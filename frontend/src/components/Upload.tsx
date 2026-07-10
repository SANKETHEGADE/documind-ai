import { useState, useRef } from 'react'
import axios from 'axios'
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

type Props = {
  onUploaded: () => void
  apiUrl: string
}

export default function Upload({ onUploaded, apiUrl }: Props) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.pdf')) {
      setStatus('error')
      setMessage('Only PDF files are supported')
      return
    }
    setFile(f)
    setStatus('idle')
    setMessage('')
  }

  const uploadFile = async () => {
    if (!file) return
    setStatus('uploading')
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post(`${apiUrl}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / (e.total ?? 1)))
        }
      })
      setStatus('success')
      setMessage(`✅ ${res.data.chunks} chunks indexed from "${res.data.filename}"`)
      setTimeout(onUploaded, 1500)
    } catch (e: unknown) {
      setStatus('error')
      const err = e as { response?: { data?: { detail?: string } } }
      setMessage(err.response?.data?.detail ?? 'Upload failed')
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>Upload Document</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '36px', fontSize: '14px' }}>
        Upload a PDF and DocuMind AI will index it for intelligent Q&A
      </p>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#a855f7' : file ? '#22c55e' : 'var(--border)'}`,
          borderRadius: '16px', padding: '60px 40px', textAlign: 'center',
          cursor: 'pointer', transition: 'all 0.2s',
          background: dragging ? 'rgba(168,85,247,0.05)' : 'var(--bg-card)',
          marginBottom: '24px'
        }}>
        <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

        {file ? (
          <>
            <FileText size={48} color="#22c55e" style={{ marginBottom: '16px' }} />
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#22c55e', marginBottom: '6px' }}>{file.name}</div>
            <div style={{ fontSize: '13px', color: '#444' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
          </>
        ) : (
          <>
            <UploadIcon size={48} color="#444" style={{ marginBottom: '16px' }} />
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
              Drop your PDF here
            </div>
            <div style={{ fontSize: '13px', color: '#444' }}>or click to browse</div>
          </>
        )}
      </div>

      {/* Progress bar */}
      {status === 'uploading' && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginBottom: '6px' }}>
            <span>Processing document...</span>
            <span>{progress}%</span>
          </div>
          <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #a855f7, #06b6d4)', borderRadius: '2px', transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      {/* Status message */}
      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
          background: status === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
          border: `1px solid ${status === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
          display: 'flex', alignItems: 'center', gap: '10px',
          color: status === 'error' ? '#ef4444' : '#22c55e', fontSize: '14px'
        }}>
          {status === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {message}
        </div>
      )}

      {/* Upload button */}
      {file && status !== 'success' && (
        <button onClick={uploadFile} disabled={status === 'uploading'}
          style={{
            width: '100%', padding: '14px',
            background: status === 'uploading' ? '#2a2a3a' : 'linear-gradient(135deg, #a855f7, #06b6d4)',
            border: 'none', borderRadius: '12px', color: 'white',
            fontSize: '15px', fontWeight: 600, cursor: status === 'uploading' ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}>
          {status === 'uploading'
            ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
            : <><UploadIcon size={18} /> Upload & Index Document</>
          }
        </button>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '40px' }}>
        {[
          { emoji: '📄', title: 'PDF Support', desc: 'Upload any PDF document — research papers, reports, books' },
          { emoji: '🧠', title: 'AI Indexing', desc: 'Gemini AI creates semantic embeddings for intelligent search' },
          { emoji: '💬', title: 'Smart Q&A', desc: 'Ask questions in natural language and get cited answers' },
        ].map(c => (
          <div key={c.title} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '20px'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>{c.emoji}</div>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>{c.title}</div>
            <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.5 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}