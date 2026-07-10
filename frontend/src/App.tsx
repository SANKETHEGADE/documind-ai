import { useState } from 'react'
import Upload from './components/Upload.tsx'
import Chat from './components/Chat.tsx'
import { FileText, MessageSquare, Trash2, Brain } from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:8000'

export type Source = {
  chunk: number
  filename: string
  text: string
}

export type Message = {
  role: 'user' | 'ai'
  content: string
  sources?: Source[]
}

export default function App() {
  const [page, setPage] = useState<'upload' | 'chat'>('upload')
  const [messages, setMessages] = useState<Message[]>([])
  const [docCount, setDocCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const checkDocs = async () => {
    try {
      const res = await axios.get(`${API}/documents`)
      setDocCount(res.data.total_chunks)
    } catch {}
  }

  const clearDocs = async () => {
    await axios.delete(`${API}/clear`)
    setDocCount(0)
    setMessages([])
    setPage('upload')
  }

  const askQuestion = async (question: string) => {
    setMessages(m => [...m, { role: 'user', content: question }])
    setLoading(true)
    try {
      const res = await axios.post(`${API}/ask`, { question, top_k: 5 })
      setMessages(m => [...m, {
        role: 'ai',
        content: res.data.answer,
        sources: res.data.sources
      }])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      setMessages(m => [...m, { role: 'ai', content: `Error: ${msg}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px', background: '#0d0d14', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '24px 16px',
        position: 'fixed', top: 0, left: 0, height: '100vh'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', paddingLeft: '8px' }}>
          <Brain size={26} color="#a855f7" />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              DocuMind AI
            </div>
            <div style={{ fontSize: '11px', color: '#444' }}>Document Intelligence</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { id: 'upload', label: 'Upload Document', icon: FileText },
            { id: 'chat',   label: 'Ask Questions',   icon: MessageSquare },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setPage(id as 'upload' | 'chat')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '10px', border: 'none',
                cursor: 'pointer', fontSize: '14px', fontWeight: 500,
                background: page === id ? 'rgba(168,85,247,0.15)' : 'transparent',
                color: page === id ? '#a855f7' : '#555', transition: 'all 0.2s', textAlign: 'left', width: '100%'
              }}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* Doc status */}
        {docCount > 0 && (
          <div style={{
            marginTop: '24px', padding: '14px', background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px'
          }}>
            <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600, marginBottom: '4px' }}>
              ✅ Document Ready
            </div>
            <div style={{ fontSize: '11px', color: '#444' }}>{docCount} chunks indexed</div>
          </div>
        )}

        {/* Clear button */}
        {docCount > 0 && (
          <button onClick={clearDocs} style={{
            marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)',
            background: 'rgba(239,68,68,0.08)', color: '#ef4444',
            fontSize: '13px', cursor: 'pointer', fontWeight: 500
          }}>
            <Trash2 size={14} /> Clear Documents
          </button>
        )}

        <div style={{ marginTop: 'auto', fontSize: '11px', color: '#2a2a3a', paddingLeft: '8px' }}>
          Powered by Gemini AI
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px', maxWidth: '900px' }}>
        {page === 'upload' && (
          <Upload
            onUploaded={() => { checkDocs(); setPage('chat') }}
            apiUrl={API}
          />
        )}
        {page === 'chat' && (
          <Chat
            messages={messages}
            loading={loading}
            onAsk={askQuestion}
            docCount={docCount}
          />
        )}
      </main>
    </div>
  )
}