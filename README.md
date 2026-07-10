# DocuMind AI 
### Intelligent Document Q&A System — Powered by RAG + Gemini AI

Upload any PDF document and ask questions about it in natural language. DocuMind AI uses Retrieval-Augmented Generation (RAG) to find the most relevant sections of your document and generate accurate, cited answers using Google Gemini AI.

---

## Screenshots

> Add screenshots after running the project

---

## How it works

```
PDF Upload → Text Extraction → Chunking → Gemini Embeddings → ChromaDB
                                                                    ↓
User Question → Embed Question → Vector Search → Top K Chunks → Gemini AI → Answer + Citations
```

1. **Upload** — PDF is parsed and split into overlapping text chunks
2. **Embed** — Each chunk is converted into a vector using Gemini Embedding model
3. **Store** — Vectors stored in ChromaDB (in-memory vector database)
4. **Query** — User question is embedded and compared against stored vectors
5. **Answer** — Top matching chunks sent to Gemini AI with the question for a cited answer

---

## Features

-  **PDF Upload** — Drag and drop any PDF, text is extracted automatically
-  **Smart Chunking** — Document split into overlapping chunks for better context
-  **Semantic Search** — Cosine similarity search finds the most relevant passages
- 🤖 **AI Answers** — Gemini AI generates detailed answers with source citations
- 📚 **Source Citations** — Every answer shows exactly which chunk it came from
- 🗑️ **Clear & Reset** — Clear documents and start fresh anytime
- 💬 **Suggested Questions** — Quick-start prompts to get going immediately
- ⚡ **Real-time** — Instant responses with loading indicators

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Backend | Python + FastAPI |
| Vector Database | ChromaDB |
| Embeddings | Google Gemini (`gemini-embedding-001`) |
| AI Model | Google Gemini (`gemini-2.0-flash`) |
| PDF Parsing | PyMuPDF (fitz) |
| HTTP Client | Axios |
| Icons | Lucide React |

---

## Project Structure

```
documind-ai/
├── backend/
│   ├── main.py              # FastAPI server — upload, embed, query, answer
│   ├── .env                 # API key (not committed)
│   ├── .gitignore
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Upload.tsx   # PDF upload with drag & drop
│   │   │   └── Chat.tsx     # Q&A chat interface with citations
│   │   ├── App.tsx          # Main app + sidebar navigation
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.local           # API key (not committed)
│   └── package.json
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/upload` | Upload and index a PDF |
| POST | `/ask` | Ask a question about uploaded docs |
| GET | `/documents` | Get total indexed chunks |
| DELETE | `/clear` | Clear all documents |

---

## How to Run Locally

### Prerequisites
- Python 3.11
- Node.js 18+
- Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install fastapi uvicorn python-multipart pymupdf chromadb google-genai

# Add your API key
# Create a .env file:
# GEMINI_API_KEY=your_key_here

# Start the server
python main.py
```

Backend runs at `http://localhost:8000`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Usage

1. Open `http://localhost:5173`
2. Click **"Upload Document"** and drag in any PDF
3. Wait for indexing to complete (shows chunk count)
4. Click **"Ask Questions"**
5. Type any question about your document
6. Get an AI-generated answer with source citations

---

## Why RAG?

Standard LLMs can hallucinate answers when asked about specific documents. RAG (Retrieval-Augmented Generation) solves this by:

- Only feeding the model **relevant sections** of your document
- Grounding every answer in **actual document content**
- Providing **citations** so you can verify the source
- Working with **any document** without fine-tuning the model

---

## Future Improvements

- [ ] Multi-document support
- [ ] Persistent vector storage
- [ ] Document history
- [ ] Export answers as PDF
- [ ] Support for DOCX, TXT files
- [ ] Streaming responses
