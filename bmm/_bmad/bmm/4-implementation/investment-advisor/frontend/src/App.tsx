import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box, Container } from '@mui/material'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SavingsAnalysis from './pages/SavingsAnalysis'
import Portfolio from './pages/Portfolio'
import Recommendations from './pages/Recommendations'
import GoalPlanning from './pages/GoalPlanning'
import TaxOptimization from './pages/TaxOptimization'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <Layout>
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/savings-analysis" element={<SavingsAnalysis />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/goal-planning" element={<GoalPlanning />} />
              <Route path="/tax-optimization" element={<TaxOptimization />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Container>
        </Layout>
      </Box>
    </BrowserRouter>
  )
}

export default App
