# backend/main.py
import io                          
import re                          
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fitz                        #PyMuPDF — imported as 'fitz' by convention

# Create the FastAPI application instance
app = FastAPI(
    title="Research Buddy API",
    version="1.0.0",
    description="Phase 1 — PDF upload and text extraction"
)

# Add CORS middleware 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],    
    allow_headers=["*"],    
)


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


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Research Buddy API is running"}


# PDF upload endpoint
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail=f"Only PDF files are accepted. Got: {file.content_type}"
        )

    file_bytes = await file.read()

    pdf_stream = io.BytesIO(file_bytes)

    try:
        doc = fitz.open(stream=pdf_stream, filetype="pdf")
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
        "raw_text": full_text[:2000],   
        "full_text": full_text,          
    }