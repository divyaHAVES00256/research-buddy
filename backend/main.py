# backend/main.py
import io                          
import re   
import os
import uuid

from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Depends
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
import fitz                        #PyMuPDF
from nlp_utils import (
    split_into_sections,
    extract_keywords_tfidf,
    generate_structured_summary,
    compute_stats,
)
from pydantic import BaseModel
from rag_utils import (
    build_vector_index, 
    generate_answer, 
    get_collection_info, 
    query_index
)
from database import (
    connect_db,
    disconnect_db,
    save_paper,
    get_user_papers,
    get_paper_by_id,
    create_user,
    get_user_by_email,
)
from auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

# FastAPI app with lifespan context manager to handle database connections
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    print("DB connected")

    yield

    await disconnect_db()
    print("DB disconnected")


app = FastAPI(
    title="Research Buddy API",
    version="1.0.0",
    description="Phase 3",
    lifespan=lifespan
)

# Add CORS middleware 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],    
    allow_headers=["*"],    
)
    

# SHARED HELPER FUNCTIONS
def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Open a PDF from raw bytes using PyMuPDF and concatenate text from all pages into a single string.
    """
    # fitz.open needs to know the stream type via the 'filetype' hint
    pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""
    for page in pdf_document:
        full_text += page.get_text()  # extracts plain Unicode text from the page
    pdf_document.close()
    return full_text

def clean_text(raw: str) -> str:
    """
    Clean up text extracted from a PDF.
    """
    text = raw.replace("\u00ad", "")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"(?<!\n)\n(?!\n)", " ", text)
    text = re.sub(r" {2,}", " ", text)
    return text.strip()


def make_paper_id(filename: str) -> str:
    """
    Create a safe paper_id from the uploaded filename.
    """
    base = filename.rsplit(".", 1)[0]
    safe = re.sub(r"[^a-zA-Z0-9._-]+", "-", base)
    safe = safe.strip("._-")[:50] or "paper"
    unique = uuid.uuid4().hex
    return f"{safe}-{unique}"


def guess_title(text: str) -> str:
    """
    Attempt to guess the paper title from the first non-empty line of text.
    """
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if lines:
        return lines[0][:120]
    return "Unknown Title"


# health check endpoint
@app.get("/")
def health_check():
    return {"status": "ok", "message": "Research Buddy API is running"}


# PHASE 1 - /upload ENDPOINTS

# PDF upload endpoint
# accepts a PDF, extracts text, and returns basic metadata + a preview of the raw text
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if (
        file.content_type != "application/pdf"
        or not file.filename.lower().endswith(".pdf")
    ):
        raise HTTPException(
            status_code=400,
            detail=f"Only PDF files are accepted. Got: {file.content_type}"
        )

    file_bytes = await file.read()      #1 read the uploaded file's bytes into memory

    pdf_stream = io.BytesIO(file_bytes) #2 converts raw PDF bytes into a file-like object in memory

    try:
        doc = fitz.open(stream=pdf_stream, filetype="pdf") #3 opens the PDF using PyMuPDF, which can handle file-like objects directly
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Could not parse PDF. The file may be corrupted. Error: {str(e)}"
        )

    all_text_parts = []
    for page_num in range(len(doc)):
        page = doc[page_num]                        
        page_text = page.get_text()                 
        all_text_parts.append(page_text)

    raw_joined = "\n\n--- PAGE BREAK ---\n\n".join(all_text_parts)

    full_text = clean_text(raw_joined)

    word_count = len(full_text.split())

    page_count = len(doc)

    doc.close()

    title_guess = guess_title(full_text)
    paper_id = make_paper_id(file.filename)

    # Return the structured response
    return {
        "status": "success",
        "paper_id": paper_id,
        "filename": file.filename,
        "title_guess": title_guess,
        "page_count": page_count,
        "word_count": word_count,
        "raw_text": full_text[:5000],   # first 5000 chars as a preview on dashborad
        "full_text": full_text,          
    }


# PHASE 2 — /analyze ENDPOINT

# Full ML pipeline: extract text → split sections → TF-IDF keywords →
# structured summary → stats. Returns everything in one JSON payload.
@app.post("/analyze")
async def analyze_paper(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")
 
    try:
        # 1: read raw bytes from the uploaded file
        file_bytes = await file.read()
 
        # 2: extract all text from the PDF using PyMuPDF
        text = extract_text_from_pdf(file_bytes)
 
        if not text.strip():
            raise ValueError("No text could be extracted. The PDF may be scanned/image-only.")
 
        # 3: split text into named academic sections via regex
        sections = split_into_sections(text)
 
        # 4: run TF-IDF keyword extraction independently on each section
        keywords = extract_keywords_tfidf(sections, top_n=8)
 
        # 5: generate the 5-field heuristic structured summary
        summary = generate_structured_summary(text, sections)
 
        # 6: compute basic reading statistics
        stats = compute_stats(text, sections)
 
        return {
            "filename": file.filename,
            "stats":    stats,
            "sections": sections,
            "keywords": keywords,
            "summary":  summary,
            "status":   "success",
        }
 
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(exc)}")
    

# PHASE 3 — /index ENDPOINT

# Chunks the paper text, embeds each chunk using
# sentence-transformers, and stores everything in ChromaDB
# The paper_id is used as the Chroma collection name, 
# so it should be unique for each paper (e.g. a UUID or a sanitized version of the title)
@app.post("/index")
async def index_paper(
    paper_id: str = Form(...),
    file: UploadFile = File(...)
):
    file_bytes = await file.read()

    try:
        text = extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read PDF: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=422, detail="No extractable text in this PDF.")

    try:
        chunks_indexed = build_vector_index(paper_id, text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")

    info = get_collection_info(paper_id)

    return {
        "paper_id": paper_id,
        "chunks_indexed": chunks_indexed,
        "collection_exists": info["exists"],
        "status": "indexed",
    }


# Pydantic model for the /ask request body
class AskRequest(BaseModel):
    paper_id: str
    question: str

# Pydantic models for the /register and /login request bodies
class RegisterRequest(BaseModel):
    email: str
    password: str
 
 
class LoginRequest(BaseModel):
    email: str
    password: str
 
 
class SavePaperRequest(BaseModel):
    paper_id:   str
    filename:   str
    title_guess: str
    page_count: int
    word_count: int
    full_text:  str
    summary:    dict
    keywords:   dict
    stats:      dict


# PHASE 3 — /ask ENDPOINT

# Embeds the user's question, retrieves the top-4 most
# relevant chunks from ChromaDB, then calls Gemini to generate a grounded answer
@app.post("/ask")
async def ask_question(request: AskRequest):
   
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        # Step 1: semantic search — find the 4 most relevant chunks
        context_chunks = query_index(request.paper_id, request.question, top_k=4)
    except ValueError as e:
        # query_index raises ValueError if the paper hasn't been indexed yet
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retrieval failed: {str(e)}")

    try:
        # Step 2: generation — Gemini reads the chunks and answers the question
        answer = generate_answer(request.question, context_chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

    return {
        "question": request.question,
        "answer": answer,
        "sources": context_chunks,  
        "status": "success",
    }


# PHASE 4 — USER AUTHENTICATION & PAPER MANAGEMENT

@app.post("/auth/register")
async def register(request: RegisterRequest):
    """
    Create a new user account with the given email and password.
    Returns a JWT access token on success.
    """
    # Basic input validation before hitting the database
    if "@" not in request.email:
        raise HTTPException(status_code=400, detail="Invalid email address.")
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
 
    hashed = hash_password(request.password)
 
    try:
        user = await create_user(request.email, hashed)
    except ValueError as e:
        # create_user raises ValueError when the email already exists
        raise HTTPException(status_code=409, detail=str(e))
 
    token = create_access_token({
        "user_id": str(user["id"]),
        "email":   user["email"],
    })
 
    return {
        "user_id":      str(user["id"]),
        "email":        user["email"],
        "access_token": token,
        "token_type":   "bearer",
    }



@app.post("/auth/login")
async def login(request: LoginRequest):
    """
    Authenticate an existing user and return a fresh JWT
    """
    user = await get_user_by_email(request.email)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
 
    if not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials.")
 
    token = create_access_token({
        "user_id": str(user["id"]),
        "email":   user["email"],
    })
 
    return {
        "user_id":      str(user["id"]),
        "email":        user["email"],
        "access_token": token,
        "token_type":   "bearer",
    }
 
 
# ── PHASE 4 — LIBRARY ENDPOINTS ─────────────────────────────
 
@app.get("/library")
async def get_library(current_user: dict = Depends(get_current_user)):
    """
    Return all papers saved by the currently authenticated user
    """
    papers = await get_user_papers(current_user["user_id"])
    return {
        "papers": papers,
        "count":  len(papers),
    }
 
 
@app.post("/library/save")
async def save_paper_endpoint(
    request: SavePaperRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Persist a paper that has already been uploaded and analysed on the Dashboard.
    """
    saved = await save_paper(
        user_id     = current_user["user_id"],
        paper_id    = request.paper_id,
        filename    = request.filename,
        title_guess = request.title_guess,
        page_count  = request.page_count,
        word_count  = request.word_count,
        full_text   = request.full_text,
        summary     = request.summary,
        keywords    = request.keywords,
        stats       = request.stats,
    )
    return {
        "saved":    True,
        "paper_id": saved["paper_id"],
    }

 
@app.get("/library/{paper_id}")
async def get_single_paper(
    paper_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Fetch a single paper including its full_text.
    """
    paper = await get_paper_by_id(paper_id, current_user["user_id"])
    if paper is None:
        raise HTTPException(status_code=404, detail="Paper not found.")
    return paper
 