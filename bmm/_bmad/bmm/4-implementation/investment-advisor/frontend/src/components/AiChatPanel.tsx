import { useState, useRef, useEffect } from 'react'
import {
  Box, Typography, Chip, TextField, IconButton,
  CircularProgress, Avatar, Divider,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import AddCommentIcon from '@mui/icons-material/AddComment'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED = [
  'How is my portfolio performing?',
  'Am I on track for my retirement goal?',
  'Should I rebalance my portfolio now?',
  'What are my tax-saving opportunities?',
]

const INITIAL_MESSAGE: Message = {
  id: '0',
  role: 'assistant',
  content: "Namaste! I'm your AI financial advisor. I have access to your live portfolio and savings goals. How can I help you today?",
  timestamp: new Date(),
}

function getMockReply(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('portfolio') || t.includes('perform'))
    return 'Your portfolio is valued at ₹14,38,200, up 8.2% YTD — outperforming the Nifty 50 benchmark of 6.1%. Equity holdings (Reliance, TCS, Infosys) are leading performance. Your Gold allocation is slightly below target.'
  if (t.includes('retire') || t.includes('goal') || t.includes('track'))
    return "You're 68% on track for your retirement goal of ₹2.5Cr by 2040. Increasing your monthly SIP by ₹2,500 and maxing PPF at ₹1.5L/year keeps you on schedule."
  if (t.includes('rebalance'))
    return 'Yes — equity has drifted to 48% vs your 40% target. Moving ₹70,000 from equity to Fixed Deposits restores the target while staying within your ₹1.25L LTCG exemption.'
  if (t.includes('tax'))
    return 'You have ₹75,000 of unused 80C limit. Recommended: ₹50,000 ELSS + ₹25,000 PPF top-up = ₹23,400 tax saving at your 31.2% effective slab. Also consider harvesting ₹30,000 of unrealised STCG losses before 31 March.'
  return "Based on your portfolio and goals, I'd recommend reviewing asset allocation quarterly and maintaining a 6-month emergency fund. Would you like me to dive deeper into a specific area?"
}

export default function AiChatPanel() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [, setConversationId] = useState<string | undefined>()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      // TODO: replace with api.aiChat(text, conversationId)
      await new Promise(r => setTimeout(r, 1200))
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getMockReply(text),
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const startNew = () => {
    setConversationId(undefined)
    setMessages([{
      ...INITIAL_MESSAGE,
      id: Date.now().toString(),
      content: 'Starting a new conversation. What would you like to discuss?',
      timestamp: new Date(),
    }])
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: '14px 20px', borderBottom: '1px solid rgba(148,163,184,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SmartToyIcon sx={{ fontSize: 20, color: '#F59E0B' }} />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>WealthAdvisor AI</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#16A34A' }} />
              <Typography variant="caption" sx={{ color: '#16A34A' }}>Online · GPT-4</Typography>
            </Box>
          </Box>
        </Box>
        <IconButton size="small" onClick={startNew} title="New conversation" sx={{ color: '#94A3B8', '&:hover': { color: '#0F172A' } }}>
          <AddCommentIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.map(msg => (
          <Box key={msg.id} sx={{ display: 'flex', gap: 1.5, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: msg.role === 'user' ? '#3B82F6' : '#F59E0B', flexShrink: 0 }}>
              {msg.role === 'user'
                ? <PersonIcon sx={{ fontSize: 14, color: '#fff' }} />
                : <SmartToyIcon sx={{ fontSize: 14, color: '#0F172A' }} />}
            </Avatar>
            <Box sx={{ maxWidth: '80%' }}>
              <Box sx={{
                p: '10px 14px',
                borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                bgcolor: msg.role === 'user' ? '#0F172A' : '#F8FAFC',
                border: msg.role === 'assistant' ? '1px solid rgba(148,163,184,0.12)' : 'none',
              }}>
                <Typography variant="body2" sx={{ color: msg.role === 'user' ? '#F8FAFC' : '#1E293B', lineHeight: 1.65, whiteSpace: 'pre-wrap', fontSize: '0.8125rem' }}>
                  {msg.content}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', px: 0.5, mt: 0.25, display: 'block', textAlign: msg.role === 'user' ? 'right' : 'left', fontSize: '0.6875rem' }}>
                {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: '#F59E0B' }}>
              <SmartToyIcon sx={{ fontSize: 14, color: '#0F172A' }} />
            </Avatar>
            <Box sx={{ p: '10px 14px', borderRadius: '4px 16px 16px 16px', bgcolor: '#F8FAFC', border: '1px solid rgba(148,163,184,0.12)', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={10} sx={{ color: '#F59E0B' }} />
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>Thinking…</Typography>
            </Box>
          </Box>
        )}
        <div ref={bottomRef} />
      </Box>

      {/* Suggested questions (before first user message) */}
      {messages.length <= 1 && (
        <Box sx={{ px: 2, pb: 1, display: 'flex', gap: 0.75, flexWrap: 'wrap', flexShrink: 0 }}>
          {SUGGESTED.map(q => (
            <Chip
              key={q}
              label={q}
              size="small"
              onClick={() => sendMessage(q)}
              sx={{ cursor: 'pointer', bgcolor: '#F8FAFC', border: '1px solid rgba(148,163,184,0.2)', fontSize: '0.6875rem', '&:hover': { bgcolor: '#FEF3C7', borderColor: '#F59E0B' } }}
            />
          ))}
        </Box>
      )}

      <Divider sx={{ borderColor: 'rgba(148,163,184,0.12)' }} />

      {/* Input */}
      <Box sx={{ p: '12px 16px', display: 'flex', gap: 1.5, alignItems: 'flex-end', flexShrink: 0 }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          size="small"
          placeholder="Ask about your portfolio, goals, or tax…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.8125rem' } }}
        />
        <IconButton
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          sx={{
            bgcolor: '#F59E0B', color: '#0F172A', width: 36, height: 36, flexShrink: 0, borderRadius: '10px',
            '&:hover': { bgcolor: '#D97706' },
            '&.Mui-disabled': { bgcolor: 'rgba(148,163,184,0.15)', color: '#94A3B8' },
          }}
        >
          <SendIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  )
}
