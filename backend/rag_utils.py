# backend/rag_utils.py
# all RAG logic: chunking, embedding, ChromaDB, Gemini

import os
import chromadb
from google import genai
from google.genai import types
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import time
import re

load_dotenv()  # Load environment variables from .env file

# Initialize the embedding model (loaded once at the start of the application)
_embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# ChromaDB client initialization
# chromadb.EphemeralClient() vs client() - EphemeralClient is in-memory, client() is persistent
_chroma_client = chromadb.EphemeralClient()

# Gemini client initialization 
_gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# 1. Overlapping Chunking
def chunk_text(text: str, chunk_size: int = 300, overlap: int = 50) -> list[str]:
    # Split on whitespace to get individual words
    words = text.split()

    chunks = []
    start = 0

    while start < len(words):
        # Take `chunk_size` words starting from `start`
        end = start + chunk_size
        chunk_words = words[start:end]

        # Skip chunks that are too short chunks
        if len(chunk_words) >= 20:
            chunks.append(" ".join(chunk_words))

        # Chunk overlap
        start += chunk_size - overlap

    return chunks


# 2. Build Vector Index: embedding and storing chunks in ChromaDB
def build_vector_index(paper_id: str, text: str) -> int:

    # a. chunking
    chunks = chunk_text(text)

    # b. delete existing upload
    existing_collections = [c.name for c in _chroma_client.list_collections()]
    if paper_id in existing_collections:
        _chroma_client.delete_collection(paper_id)

    # c. create a new collection for this paper's chunks
    collection = _chroma_client.create_collection(
        name=paper_id,
        # cosine similarity is common for text embeddings, but ChromaDB also supports dot_product and euclidean
        metadata={"hnsw:space": "cosine"}
    )

    # d. embed all chunks in one batch call (returns (num_chunks, 384))
    embeddings = _embedding_model.encode(chunks, show_progress_bar=False)

    # ChromaDB requires IDs as strings — we use "chunk_0", "chunk_1", etc.
    ids = [f"chunk_{i}" for i in range(len(chunks))]

    # metadata for each chunk (chunk index and paper id)
    metadatas = [
        {"chunk_index": i, "paper_id": paper_id}
        for i in range(len(chunks))
    ]

    # e. store chunks in ChromaDB: the text (documents), embeddings, metadata, and IDs
    collection.add(
        documents=chunks,
        embeddings=embeddings.tolist(),  # ChromaDB expects plain Python lists
        metadatas=metadatas,
        ids=ids
    )

    return len(chunks)


# 3. Build Query Index
# Embeds the user's question and retrieves the top_k most similar chunks
# from ChromaDB using cosine similarity
def query_index(paper_id: str, question: str, top_k: int = 4) -> list[dict]:
    
    # verify the collection exists 
    existing_collections = [c.name for c in _chroma_client.list_collections()]
    if paper_id not in existing_collections:
        raise ValueError(
            "Paper not indexed yet. Please upload the paper first."
        )

    collection = _chroma_client.get_collection(paper_id)

    # embed the question using the SAME model used during indexing 
    question_embedding = _embedding_model.encode([question], show_progress_bar=False)

    # query ChromaDB: finds the top_k chunks using cosine similarity 
    results = collection.query(
        query_embeddings=question_embedding.tolist(),
        n_results=min(top_k, collection.count()),  # can't request more than stored
        include=["documents", "metadatas", "distances"]
    )

    # reformat the results into a more convenient structure for the frontend
    chunks = []
    for i in range(len(results["documents"][0])):
        chunks.append({
            "text": results["documents"][0][i],
            "chunk_index": results["metadatas"][0][i]["chunk_index"],
            "distance": round(results["distances"][0][i], 4)
        })

    return chunks


# 3. Generate Answer with Gemini 1.5 Flash
def generate_answer(question: str, context_chunks: list[dict]) -> str:
    """
    Calls Gemini 1.5 Flash via the new google.genai SDK to generate a grounded answer
    """
    if not os.getenv("GEMINI_API_KEY"):
        return "Gemini API key not configured. Please add GEMINI_API_KEY to backend/.env"

    context_block = "\n\n".join(
        f"Context [{i+1}]:\n{chunk['text']}"
        for i, chunk in enumerate(context_chunks)
    )

    prompt = f"""You are a research assistant helping a university student understand an academic paper.

Answer the question using ONLY the context provided below. Do not use any external knowledge or make up information. If the answer is not present in the context, respond with: "I could not find this information in the paper."

Be concise and direct. If the context contains a specific number, statistic, or quote relevant to the question, include it in your answer.

---
{context_block}
---

Question: {question}

Answer:"""

    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = _gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            return response.text.strip()

        except Exception as e:
            error_str = str(e)
            is_rate_limit = "429" in error_str or "quota" in error_str.lower()

            if is_rate_limit and attempt < max_retries - 1:
                wait_seconds = 20 * (2 ** attempt)
                match = re.search(r"retry in (\d+)", error_str, re.IGNORECASE)
                if match:
                    wait_seconds = int(match.group(1)) + 2
                print(f"[rag_utils] Rate limited. Waiting {wait_seconds}s (retry {attempt + 2}/{max_retries})...")
                time.sleep(wait_seconds)
                continue

            print(f"[rag_utils] Gemini API error: {e}")
            return "The AI service is temporarily unavailable. Please try again in a moment."

# 4. Utility to check if a paper's collection exists and how many chunks it has
def get_collection_info(paper_id: str) -> dict:
    existing_collections = [c.name for c in _chroma_client.list_collections()]
    if paper_id not in existing_collections:
        return {"exists": False, "chunk_count": 0}

    collection = _chroma_client.get_collection(paper_id)
    return {"exists": True, "chunk_count": collection.count()}