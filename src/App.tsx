import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { ProjectProvider } from './contexts/ProjectContext'
import Home from './pages/Dashboard'
import TeamStatus from './pages/TeamStatus'
import PersonalInsights from './pages/PersonalInsights'
import DevelopmentCoach from './pages/DevelopmentCoach'
import KnowledgeBase from './pages/KnowledgeBase'
import ProjectSelector from './pages/ProjectSelector'
import AppLayout from './components/layouts/AppLayout'
import ProjectLayout from './components/layouts/ProjectLayout'
import { MinimalAIAnalysis } from './components/MinimalAIAnalysis'

function App () {
  return (
    <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
      <ProjectProvider>
        <Router>
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
              <Route path="dashboard" element={<Home />} />
              <Route path="team-status" element={<TeamStatus />} />
              <Route path="insights" element={<PersonalInsights />} />
              <Route path="coach" element={<DevelopmentCoach />} />
              <Route path="knowledge" element={<KnowledgeBase />} />
              {/* Redirect project root to dashboard */}
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
          </Routes>
        </Router>
      </ProjectProvider>
    </ThemeProvider>
  )
}

export default App
