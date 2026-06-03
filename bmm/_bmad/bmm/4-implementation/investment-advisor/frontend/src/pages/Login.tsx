import { useState } from 'react'
import {
  Box, Paper, Typography, TextField, Button, Tabs, Tab,
  Alert, CircularProgress, InputAdornment, IconButton,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0) // 0=login, 1=register
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirm: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!loginForm.email || !loginForm.password) { setError('Please fill all fields'); return }
    setLoading(true)
    try {
      await api.login(loginForm.email, loginForm.password)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!registerForm.name || !registerForm.email || !registerForm.password) { setError('Please fill all fields'); return }
    if (registerForm.password !== registerForm.confirm) { setError('Passwords do not match'); return }
    if (registerForm.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await api.register(registerForm.email, registerForm.name, registerForm.password)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
          borderRadius: 3,
          bgcolor: '#1E293B',
          border: '1px solid rgba(148,163,184,0.12)',
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#F59E0B',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 22, color: '#0F172A' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#F8FAFC', lineHeight: 1.1 }}>
              WealthAdvisor
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.7)' }}>
              Personal Finance Intelligence
            </Typography>
          </Box>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setError('') }}
          sx={{
            mb: 3,
            '& .MuiTab-root': { color: 'rgba(148,163,184,0.7)', fontWeight: 500 },
            '& .Mui-selected': { color: '#F59E0B !important' },
            '& .MuiTabs-indicator': { bgcolor: '#F59E0B' },
          }}
        >
          <Tab label="Sign In" />
          <Tab label="Create Account" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)', '& .MuiAlert-icon': { color: '#F87171' } }}>
            {error}
          </Alert>
        )}

        {tab === 0 ? (
          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              size="small"
              value={loginForm.email}
              onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
              sx={fieldSx}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              size="small"
              value={loginForm.password}
              onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(p => !p)} sx={{ color: 'rgba(148,163,184,0.6)' }}>
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 1, bgcolor: '#F59E0B', color: '#0F172A', fontWeight: 600, '&:hover': { bgcolor: '#D97706' }, '&.Mui-disabled': { bgcolor: 'rgba(245,158,11,0.3)' } }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: '#0F172A' }} /> : 'Sign In'}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Full Name" fullWidth size="small" value={registerForm.name} onChange={e => setRegisterForm(f => ({ ...f, name: e.target.value }))} sx={fieldSx} />
            <TextField label="Email" type="email" fullWidth size="small" value={registerForm.email} onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))} sx={fieldSx} />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              size="small"
              value={registerForm.password}
              onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(p => !p)} sx={{ color: 'rgba(148,163,184,0.6)' }}>
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
            <TextField label="Confirm Password" type="password" fullWidth size="small" value={registerForm.confirm} onChange={e => setRegisterForm(f => ({ ...f, confirm: e.target.value }))} sx={fieldSx} />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 1, bgcolor: '#F59E0B', color: '#0F172A', fontWeight: 600, '&:hover': { bgcolor: '#D97706' }, '&.Mui-disabled': { bgcolor: 'rgba(245,158,11,0.3)' } }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: '#0F172A' }} /> : 'Create Account'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    color: '#F8FAFC',
    '& fieldset': { borderColor: 'rgba(148,163,184,0.2)' },
    '&:hover fieldset': { borderColor: 'rgba(148,163,184,0.4)' },
    '&.Mui-focused fieldset': { borderColor: '#F59E0B' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(148,163,184,0.7)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#F59E0B' },
}
