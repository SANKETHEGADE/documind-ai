import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, FileText, Bot, User } from 'lucide-react'
import type { Message, Source } from '../App.tsx'

type Props = {
  messages: Message[]
  loading: boolean
  onAsk: (q: string) => void
  docCount: number
}

export default function Chat({ messages, loading, onAsk, docCount }: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = () => {
    if (!input.trim() || loading) return
    onAsk(input.trim())
    setInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>Ask Questions</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
        Ask anything about your uploaded document
      </p>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
        gap: '20px', paddingBottom: '20px'
      }}>
        {messages.length === 0 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '16px',
            color: '#333', paddingTop: '60px'
          }}>
            <Bot size={48} color="#2a2a3a" />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px', color: '#444' }}>
                Ready to answer questions
              </div>
              <div style={{ fontSize: '13px', color: '#333' }}>
                {docCount > 0 ? 'Ask anything about your document' : 'Upload a document first'}
              </div>
            </div>

            {docCount > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '500px', marginTop: '16px' }}>
                {[
                  'What is this document about?',
                  'Summarize the key points',
                  'What are the main conclusions?'
                ].map(q => (
                  <button key={q} onClick={() => onAsk(q)}
                    style={{
                      padding: '12px 16px', background: 'var(--bg-card)',
                      border: '1px solid var(--border)', borderRadius: '10px',
                      color: '#888', fontSize: '13px', cursor: 'pointer',
                      textAlign: 'left', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#a855f7'
                      e.currentTarget.style.color = '#a855f7'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.color = '#888'
                    }}>
                    💡 {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', gap: '12px',
            flexDirection: m.role === 'user' ? 'row-reverse' : 'row'
          }}>
            {/* Avatar */}
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: m.role === 'user' ? 'rgba(168,85,247,0.2)' : 'rgba(6,182,212,0.2)'
            }}>
              {m.role === 'user'
                ? <User size={16} color="#a855f7" />
                : <Bot size={16} color="#06b6d4" />
              }
            </div>

            <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Message bubble */}
              <div style={{
                padding: '14px 18px', borderRadius: '16px',
                background: m.role === 'user' ? 'rgba(168,85,247,0.15)' : 'var(--bg-card)',
                border: `1px solid ${m.role === 'user' ? 'rgba(168,85,247,0.2)' : 'var(--border)'}`,
                fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap'
              }}>
                {m.content}
              </div>

              {/* Sources */}
              {m.sources && m.sources.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#444', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Sources
                  </div>
                  {m.sources.map((s: Source, j: number) => (
                    <div key={j} style={{
                      padding: '10px 14px', background: 'rgba(6,182,212,0.05)',
                      border: '1px solid rgba(6,182,212,0.15)', borderRadius: '8px',
                      fontSize: '12px', color: '#555'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <FileText size={12} color="#06b6d4" />
                        <span style={{ color: '#06b6d4', fontWeight: 600 }}>
                          {s.filename} — Chunk {s.chunk}
                        </span>
                      </div>
                      <div style={{ lineHeight: 1.5 }}>{s.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(6,182,212,0.2)'
            }}>
              <Bot size={16} color="#06b6d4" />
            </div>
            <div style={{
              padding: '14px 18px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: '16px',
              display: 'flex', alignItems: 'center', gap: '10px', color: '#666', fontSize: '14px'
            }}>
              <Loader2 size={16} color="#a855f7" style={{ animation: 'spin 1s linear infinite' }} />
              Analyzing document...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: '12px', paddingTop: '16px',
        borderTop: '1px solid var(--border)'
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder={docCount > 0 ? 'Ask a question about your document...' : 'Upload a document first...'}
          disabled={docCount === 0 || loading}
          style={{
            flex: 1, padding: '14px 18px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '12px', color: 'var(--text-primary)',
            fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = '#a855f7'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button onClick={send} disabled={!input.trim() || loading || docCount === 0}
          style={{
            padding: '14px 20px', borderRadius: '12px', border: 'none',
            background: !input.trim() || loading || docCount === 0
              ? '#2a2a3a'
              : 'linear-gradient(135deg, #a855f7, #06b6d4)',
            color: 'white', cursor: !input.trim() || loading || docCount === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600
          }}>
          <Send size={16} />
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}