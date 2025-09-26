import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProjectProvider } from './contexts/ProjectContext'
import Dashboard from './pages/Dashboard'
import TeamStatus from './pages/TeamStatus'
import PersonalInsights from './pages/PersonalInsights'
import DevelopmentCoach from './pages/DevelopmentCoach'
import KnowledgeBase from './pages/KnowledgeBase'
import ProjectSelector from './pages/ProjectSelector'
import AppLayout from './components/layouts/AppLayout'
import ProjectLayout from './components/layouts/ProjectLayout'
import { Login } from './components/auth/Login'
import { MinimalAIAnalysis } from './components/MinimalAIAnalysis'

function AppContent () {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-gray-400'>Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <Routes>
      {/* Redirect root to projects */}
      <Route path="/" element={<Navigate to="/projects" replace />} />

      {/* App-level routes (with sidebar) */}
      <Route path="/" element={<AppLayout />}>
        <Route path="projects" element={<ProjectSelector />} />
        <Route path="ai-analysis" element={<MinimalAIAnalysis />} />
      </Route>

      {/* Project-specific routes (with top navigation) */}
      <Route path="/project/:projectId" element={<ProjectLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="team-status" element={<TeamStatus />} />
        <Route path="insights" element={<PersonalInsights />} />
        <Route path="coach" element={<DevelopmentCoach />} />
        <Route path="knowledge" element={<KnowledgeBase />} />
        {/* Redirect project root to dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  )
}

function App () {
  return (
    <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
      <AuthProvider>
        <ProjectProvider>
          <Router>
            <AppContent />
          </Router>
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App