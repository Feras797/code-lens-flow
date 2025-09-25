import { NavLink } from 'react-router-dom'
import { 
  Activity, 
  Brain, 
  Users, 
  BookOpen, 
  LayoutDashboard,
  Zap,
  Settings,
  HelpCircle,
  LogOut,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Team Status', href: '/team-status', icon: Users },
  { name: 'Personal Insights', href: '/insights', icon: Activity },
  { name: 'Development Coach', href: '/coach', icon: Brain },
  { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen }
]

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle }
]

function Sidebar () {
  const user = { full_name: 'Vishi Choudhary', email: 'vishi@example.com' }

  const handleSignOut = () => {
    // Mock sign out for now
    console.log('Sign out clicked')
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return 'U'
    if (user.full_name) {
      return user.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email?.[0]?.toUpperCase() || 'U'
  }

  return (
    <div className='w-64 bg-[hsl(var(--sidebar-background))] border-r border-border flex flex-col'>
      {/* Logo */}
      <div className='px-6 py-5 border-b border-border'>
        <div className='flex items-center'>
          <span className='text-2xl font-bold text-white' style={{ fontFamily: '"Neue Haas Grotesk Display Pro", "Helvetica Neue", Arial, sans-serif' }}>
            Lens
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className='flex-1 px-4 py-4 space-y-1'>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                'hover:bg-[hsl(var(--hover-bg))] hover:text-foreground',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground'
              )
            }
          >
            <item.icon className='h-5 w-5' />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Team Activity Indicator */}
      <div className='px-4 py-3 border-t border-border'>
        <div className='bg-card rounded-lg p-3'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-xs font-medium text-muted-foreground'>Team Activity</span>
            <div className='flex items-center gap-1'>
              <div className='h-2 w-2 rounded-full bg-status-flow animate-pulse' />
              <span className='text-xs text-status-flow'>Live</span>
            </div>
          </div>
          <div className='flex items-center gap-3 text-xs'>
            <div className='flex items-center gap-1'>
              <div className='h-2 w-2 rounded-full bg-status-flow' />
              <span className='text-muted-foreground'>9 Active</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-2 w-2 rounded-full bg-status-slow' />
              <span className='text-muted-foreground'>2 Slow</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-2 w-2 rounded-full bg-status-blocked' />
              <span className='text-muted-foreground'>1 Stuck</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className='px-4 py-4 border-t border-border space-y-1'>
        {bottomNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                'hover:bg-[hsl(var(--hover-bg))] hover:text-foreground',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground'
              )
            }
          >
            <item.icon className='h-4 w-4' />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className='px-4 py-4 border-t border-border'>
        <div className='flex items-center gap-3 px-3 py-2 rounded-lg'>
          <div className='h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm'>
            {getUserInitials()}
          </div>
          <div className='flex-1 text-left'>
            <p className='text-sm font-medium text-foreground'>
              {user?.full_name || 'User'}
            </p>
            <p className='text-xs text-muted-foreground truncate'>
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
