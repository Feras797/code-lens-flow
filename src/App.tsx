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
  const { user, isLoading, initError } = useAuth()

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

  if (initError) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50'>
        <div className='max-w-md w-full p-6 bg-white rounded-lg shadow-lg'>
          <h2 className='text-2xl font-bold text-red-600 mb-4'>Configuration Error</h2>
          <p className='text-gray-700 mb-4'>{initError}</p>
          <div className='bg-gray-100 p-4 rounded-md'>
            <h3 className='font-semibold mb-2'>To fix this:</h3>
            <ol className='list-decimal list-inside space-y-2 text-sm'>
              <li>Create a <code className='bg-gray-200 px-1 rounded'>.env</code> file in your project root</li>
              <li>Add your Supabase credentials:
                <pre className='bg-gray-200 p-2 mt-2 rounded text-xs overflow-x-auto'>
{`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key`}
                </pre>
              </li>
              <li>Get these values from your Supabase dashboard under Settings → API</li>
              <li>Restart the development server after adding the .env file</li>
            </ol>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className='mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors'
          >
            Retry
          </button>
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