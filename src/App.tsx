import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import TeamStatus from './pages/TeamStatus'
import PersonalInsights from './pages/PersonalInsights'
import DevelopmentCoach from './pages/DevelopmentCoach'
import KnowledgeBase from './pages/KnowledgeBase'
import Layout from './components/Layout'
import { Login } from './components/auth/Login'

function AppContent () {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-muted-foreground'>Loading...</p>
        </div>
      </div>
    )
  }


  if (!user) {
    return <Login />
  }

  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path='team-status' element={<TeamStatus />} />
        <Route path='insights' element={<PersonalInsights />} />
        <Route path='coach' element={<DevelopmentCoach />} />
        <Route path='knowledge' element={<KnowledgeBase />} />
      </Route>
    </Routes>
  )
}

function App () {
  return (
    <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App