import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SavingsAnalysis from './pages/SavingsAnalysis'
import Portfolio from './pages/Portfolio'
import Recommendations from './pages/Recommendations'
import GoalPlanning from './pages/GoalPlanning'
import TaxOptimization from './pages/TaxOptimization'
import AiChat from './pages/AiChat'
import Insights from './pages/Insights'
import PortfolioForecast from './pages/PortfolioForecast'
import RiskAlerts from './pages/RiskAlerts'
import Login from './pages/Login'
import './App.css'

function isAuthenticated() {
  return !!localStorage.getItem('authToken')
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/savings-analysis" element={<SavingsAnalysis />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/recommendations" element={<Recommendations />} />
                    <Route path="/goal-planning" element={<GoalPlanning />} />
                    <Route path="/tax-optimization" element={<TaxOptimization />} />
                    <Route path="/ai-chat" element={<AiChat />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/portfolio-forecast" element={<PortfolioForecast />} />
                    <Route path="/risk-alerts" element={<RiskAlerts />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </Box>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
