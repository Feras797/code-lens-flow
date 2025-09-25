import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import Dashboard from './pages/Dashboard'
import TeamStatus from './pages/TeamStatus'
import PersonalInsights from './pages/PersonalInsights'
import DevelopmentCoach from './pages/DevelopmentCoach'
import KnowledgeBase from './pages/KnowledgeBase'
import Layout from './components/Layout'

function App () {
  return (
    <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
      <Router>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path='team-status' element={<TeamStatus />} />
            <Route path='insights' element={<PersonalInsights />} />
            <Route path='coach' element={<DevelopmentCoach />} />
            <Route path='knowledge' element={<KnowledgeBase />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App