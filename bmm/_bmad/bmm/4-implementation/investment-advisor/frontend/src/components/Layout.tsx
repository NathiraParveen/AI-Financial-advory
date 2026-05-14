import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Divider } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AssessmentIcon from '@mui/icons-material/Assessment'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates'
import TargetIcon from '@mui/icons-material/GpsFixed'
import TaxIcon from '@mui/icons-material/ReceiptLong'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

const drawerWidth = 248

interface LayoutProps {
  children: React.ReactNode
}

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/dashboard' },
  { label: 'Savings Analysis', icon: <AssessmentIcon fontSize="small" />, path: '/savings-analysis' },
  { label: 'Portfolio', icon: <AccountBalanceIcon fontSize="small" />, path: '/portfolio' },
  { label: 'Recommendations', icon: <TipsAndUpdatesIcon fontSize="small" />, path: '/recommendations' },
  { label: 'Goal Planning', icon: <TargetIcon fontSize="small" />, path: '/goal-planning' },
  { label: 'Tax Optimization', icon: <TaxIcon fontSize="small" />, path: '/tax-optimization' },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          borderBottom: '1px solid rgba(148,163,184,0.15)',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ minHeight: '60px !important', px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 18, color: '#0F172A' }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, lineHeight: 1.1, fontSize: '0.9375rem', color: '#0F172A' }}
              >
                WealthAdvisor
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>
                Personal Finance Intelligence
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#0F172A',
            borderRight: 'none',
            pt: '60px',
          },
        }}
      >
        {/* Nav section label */}
        <Box sx={{ px: 3, pt: 3, pb: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(148,163,184,0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
              fontSize: '0.6875rem',
            }}
          >
            Navigation
          </Typography>
        </Box>

        <List sx={{ px: 1.5, py: 0 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  sx={{
                    borderRadius: '8px',
                    py: 1,
                    px: 1.5,
                    minHeight: 42,
                    borderLeft: isActive ? '3px solid #F59E0B' : '3px solid transparent',
                    bgcolor: isActive ? 'rgba(245,158,11,0.1)' : 'transparent',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: isActive ? '#F59E0B' : 'rgba(148,163,184,0.7)',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#F8FAFC' : 'rgba(148,163,184,0.8)',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>

        <Divider sx={{ borderColor: 'rgba(148,163,184,0.1)', mx: 2, mt: 2, mb: 2 }} />

        {/* Bottom branding area */}
        <Box sx={{ px: 3, mt: 'auto', pb: 3 }}>
          <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.4)', display: 'block' }}>
            Portfolio last updated
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.6)', fontWeight: 500 }}>
            Today, 9:00 AM
          </Typography>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
          pt: '60px',
          width: `calc(100% - ${drawerWidth}px)`,
        }}
      >
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  )
}
