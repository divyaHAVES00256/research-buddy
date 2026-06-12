# backend/main.py
import io                          
import re                          
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fitz                        #PyMuPDF
from nlp_utils import (
    split_into_sections,
    extract_keywords_tfidf,
    generate_structured_summary,
    compute_stats,
)

# Create the FastAPI application instance
app = FastAPI(
    title="Research Buddy API",
    version="1.0.0",
    description="Phase 2 — Structured Summarization and Analysis. Upload a PDF and get back structured insights about the paper's content.",
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


def guess_title(text: str) -> str:
    """
    Attempt to guess the paper title from the first non-empty line of text.
    """
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if lines:
        return lines[0][:120]
    return "Unknown Title"


# PHASE 1 ENDPOINTS

# health check endpoint
@app.get("/")
def health_check():
    return {"status": "ok", "message": "Research Buddy API is running"}


# PDF upload endpoint
# accepts a PDF, extracts text, and returns basic metadata + a preview of the raw text
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
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

    # Return the structured response
    return {
        "status": "success",
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