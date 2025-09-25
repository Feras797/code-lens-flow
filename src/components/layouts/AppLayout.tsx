import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar'

function AppLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AppLayout