import { useState, useRef, useEffect } from 'react'
import {
  Box, Card, CardContent, Typography, Grid, Chip, TextField, IconButton,
  CircularProgress, Avatar, Divider,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import AddCommentIcon from '@mui/icons-material/AddComment'

// Mock responses — replace sendMessage's try block with: api.aiChat(text, conversationId)

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
  'What are my tax-saving opportunities this year?',
]

const INITIAL_MESSAGE: Message = {
  id: '0',
  role: 'assistant',
  content: 'Namaste! I\'m your AI financial advisor. I have access to your live portfolio and savings goals. How can I help you today?',
  timestamp: new Date(),
}

function getMockReply(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('portfolio') || t.includes('perform'))
    return 'Your portfolio is currently valued at ₹14,38,200, up 8.2% YTD. Your equity holdings (Reliance, TCS, Infosys) are performing well above the Nifty 50 benchmark of 6.1%. However, your Gold allocation is slightly underperforming — consider whether the 12% target still aligns with your risk profile.'
  if (t.includes('retire') || t.includes('goal') || t.includes('track'))
    return 'You\'re 68% on track for your retirement goal of ₹2.5Cr by 2040. To stay on track, I\'d recommend increasing your monthly SIP by ₹2,500. Your PPF contribution is excellent for the debt component — keep maxing it out at ₹1.5L per year.'
  if (t.includes('rebalance'))
    return 'Yes, your portfolio needs rebalancing. Your equity allocation has drifted to 48% against your 40% target. A partial rebalance — moving ₹70,000 from equity to Fixed Deposits — would restore the target while generating ₹8,400 of LTCG within your ₹1.25L exemption.'
  if (t.includes('tax'))
    return 'You have ₹75,000 of unused Section 80C limit this financial year. Recommended: ₹50,000 in Axis Long Term Equity ELSS + ₹25,000 PPF top-up. That saves ₹23,400 at your 31.2% effective slab. Also consider harvesting ₹30,000 of unrealised STCG losses before 31 March.'
  return 'That\'s a great question. Based on your current portfolio composition and financial goals, I\'d recommend reviewing your asset allocation quarterly and ensuring your emergency fund covers at least 6 months of expenses. Would you like me to dive deeper into any specific aspect?'
}

export default function AiChat() {
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
      // const res = await api.aiChat(text, conversationId)
      // setConversationId(res.conversationId)
      await new Promise(r => setTimeout(r, 1200))
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getMockReply(text),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, reply])
    } finally {
      setLoading(false)
    }
  }

  const startNewConversation = () => {
    setConversationId(undefined)
    setMessages([{ ...INITIAL_MESSAGE, id: Date.now().toString(), content: 'Starting a new conversation. What would you like to discuss?', timestamp: new Date() }])
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A' }}>AI Financial Advisor</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Chat with your AI advisor — powered by your live portfolio and savings data.
        </Typography>
      </Box>

      {/* Stats banner */}
      <Card sx={{ mb: 3, bgcolor: '#0F172A', color: 'white' }}>
        <CardContent sx={{ p: '20px !important' }}>
          <Grid container spacing={3} alignItems="center">
            {[
              { label: 'AI Model', value: 'GPT-4' },
              { label: 'Context', value: 'Portfolio + Goals' },
              { label: 'Message History', value: '10 messages' },
              { label: 'Monthly Cost Limit', value: '₹4,150' },
            ].map(stat => (
              <Grid item xs={6} sm={3} key={stat.label}>
                <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>
                  {stat.label}
                </Typography>
                <Typography className="mono" sx={{ fontWeight: 700, fontSize: '1.1rem', mt: 0.25 }}>
                  {stat.value}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Chat card */}
      <Card>
        <CardContent sx={{ p: '0 !important', display: 'flex', flexDirection: 'column', height: 560 }}>
          {/* Header */}
          <Box sx={{ p: '14px 20px', borderBottom: '1px solid rgba(148,163,184,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SmartToyIcon sx={{ fontSize: 20, color: '#F59E0B' }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>WealthAdvisor AI</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#16A34A' }} />
                  <Typography variant="caption" sx={{ color: '#16A34A' }}>Online</Typography>
                </Box>
              </Box>
            </Box>
            <IconButton size="small" onClick={startNewConversation} title="New conversation" sx={{ color: '#94A3B8', '&:hover': { color: '#0F172A' } }}>
              <AddCommentIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map(msg => (
              <Box key={msg.id} sx={{ display: 'flex', gap: 1.5, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: msg.role === 'user' ? '#3B82F6' : '#F59E0B', flexShrink: 0 }}>
                  {msg.role === 'user'
                    ? <PersonIcon sx={{ fontSize: 16, color: '#fff' }} />
                    : <SmartToyIcon sx={{ fontSize: 16, color: '#0F172A' }} />}
                </Avatar>
                <Box sx={{ maxWidth: '72%' }}>
                  <Box sx={{
                    p: '10px 14px',
                    borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    bgcolor: msg.role === 'user' ? '#0F172A' : '#F8FAFC',
                    border: msg.role === 'assistant' ? '1px solid rgba(148,163,184,0.12)' : 'none',
                  }}>
                    <Typography variant="body2" sx={{ color: msg.role === 'user' ? '#F8FAFC' : '#1E293B', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', px: 0.5, mt: 0.25, display: 'block', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#F59E0B' }}>
                  <SmartToyIcon sx={{ fontSize: 16, color: '#0F172A' }} />
                </Avatar>
                <Box sx={{ p: '12px 16px', borderRadius: '4px 16px 16px 16px', bgcolor: '#F8FAFC', border: '1px solid rgba(148,163,184,0.12)', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={12} sx={{ color: '#F59E0B' }} />
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>Thinking…</Typography>
                </Box>
              </Box>
            )}
            <div ref={bottomRef} />
          </Box>

          {/* Suggested questions (shown only before first user message) */}
          {messages.length <= 1 && (
            <Box sx={{ px: 2.5, pb: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {SUGGESTED.map(q => (
                <Chip
                  key={q}
                  label={q}
                  size="small"
                  onClick={() => sendMessage(q)}
                  sx={{ cursor: 'pointer', bgcolor: '#F8FAFC', border: '1px solid rgba(148,163,184,0.2)', fontSize: '0.75rem', '&:hover': { bgcolor: '#FEF3C7', borderColor: '#F59E0B' } }}
                />
              ))}
            </Box>
          )}

          <Divider sx={{ borderColor: 'rgba(148,163,184,0.12)' }} />

          {/* Input */}
          <Box sx={{ p: '12px 20px', display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              size="small"
              placeholder="Ask about your portfolio, goals, or tax planning…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
            <IconButton
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              sx={{
                bgcolor: '#F59E0B', color: '#0F172A', width: 40, height: 40, flexShrink: 0, borderRadius: '10px',
                '&:hover': { bgcolor: '#D97706' },
                '&.Mui-disabled': { bgcolor: 'rgba(148,163,184,0.15)', color: '#94A3B8' },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
