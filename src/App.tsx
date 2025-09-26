import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import DevelopmentCoach from './pages/DevelopmentCoach'
// Temporary minimal router for demo: load Coach directly
function AppContent () {
  return (
    <Routes>
      <Route path='/' element={<DevelopmentCoach />} />
    </Routes>
  )
}

function App () {
  return (
    <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  )
}

export default App