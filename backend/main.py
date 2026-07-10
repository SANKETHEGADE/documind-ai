from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import os
import tempfile
import shutil
import traceback
import fitz
import chromadb
from google import genai
from google.genai import types
import uuid

# ── API KEY ─────────────────────────────────────────
GEMINI_API_KEY = ""
client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI(title="DocuMind AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"GLOBAL ERROR: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"}
    )

chroma_client = chromadb.Client()
collection = chroma_client.get_or_create_collection(
    name="documents",
    metadata={"hnsw:space": "cosine"}
)

def extract_text(path: str) -> str:
    print(f"Extracting text from {path}")
    doc = fitz.open(path)
    text = "".join(page.get_text() for page in doc)
    print(f"Extracted {len(text)} characters")
    return text

def chunk_text(text: str, size: int = 400, overlap: int = 40) -> list:
    words = text.split()
    chunks, i = [], 0
    while i < len(words):
        chunk = " ".join(words[i:i+size])
        if len(chunk.strip()) > 30:
            chunks.append(chunk)
        i += size - overlap
    print(f"Created {len(chunks)} chunks")
    return chunks

def embed(text: str, task: str = "RETRIEVAL_DOCUMENT") -> list:
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config=types.EmbedContentConfig(task_type=task)
    )
    return result.embeddings[0].values

@app.get("/")
def root():
    return {"message": "DocuMind AI is running ✅"}

@app.get("/models")
def list_models():
    models = client.models.list()
    return {"models": [m.name for m in models]}

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    print(f"Upload received: {file.filename}")

    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF files supported")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        text = extract_text(tmp_path)

        if not text.strip():
            raise HTTPException(400, "Could not extract text from PDF")

        chunks = chunk_text(text)
        doc_id = str(uuid.uuid4())

        print(f"Generating embeddings for {len(chunks)} chunks...")
        embeddings = []
        for i, chunk in enumerate(chunks):
            print(f"Embedding chunk {i+1}/{len(chunks)}")
            embeddings.append(embed(chunk))

        collection.add(
            documents=chunks,
            embeddings=embeddings,
            ids=[f"{doc_id}_{i}" for i in range(len(chunks))],
            metadatas=[{"filename": file.filename, "chunk": i} for i in range(len(chunks))]
        )

        print("Upload complete!")
        return {
            "message": "Uploaded successfully!",
            "filename": file.filename,
            "chunks": len(chunks)
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"UPLOAD ERROR: {e}")
        traceback.print_exc()
        raise HTTPException(500, str(e))
    finally:
        os.unlink(tmp_path)

class Question(BaseModel):
    question: str
    top_k: int = 5

@app.post("/ask")
async def ask(req: Question):
    print(f"Question: {req.question}")

    if collection.count() == 0:
        raise HTTPException(400, "No documents uploaded yet")

    try:
        q_embed = embed(req.question, task="RETRIEVAL_QUERY")
        results = collection.query(
            query_embeddings=[q_embed],
            n_results=min(req.top_k, collection.count())
        )

        chunks = results["documents"][0]
        metas = results["metadatas"][0]
        context = "\n\n".join([f"[Source {i+1}]: {c}" for i, c in enumerate(chunks)])

        prompt = f"""You are DocuMind AI, an intelligent document assistant.
Answer ONLY based on the context below. If the answer isn't there, say so.
Always cite which source you used.

CONTEXT:
{context}

QUESTION: {req.question}

Give a clear, detailed answer with source citations."""

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        print("Answer generated!")

        return {
            "answer": response.text,
            "sources": [
                {
                    "chunk": m["chunk"] + 1,
                    "filename": m["filename"],
                    "text": chunks[i][:200] + "..."
                }
                for i, m in enumerate(metas)
            ]
        }
    except Exception as e:
        print(f"ASK ERROR: {e}")
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.get("/documents")
def documents():
    count = collection.count()
    return {"total_chunks": count, "status": "ready" if count > 0 else "empty"}

@app.delete("/clear")
def clear():
    global collection
    chroma_client.delete_collection("documents")
    collection = chroma_client.get_or_create_collection(
        name="documents",
        metadata={"hnsw:space": "cosine"}
    )
    return {"message": "Cleared!"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)