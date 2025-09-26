import { Outlet } from 'react-router-dom'
import { Settings, HelpCircle, User } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

function AppLayout() {
  const getUserInitials = () => 'CL'

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className='flex items-center gap-8'>
              <span className='text-2xl font-bold text-white' style={{ fontFamily: '"Neue Haas Grotesk Display Pro", "Helvetica Neue", Arial, sans-serif' }}>
                Home
              </span>
            </div>

            {/* Right side - User menu and actions */}
            <div className="flex items-center gap-4">

              {/* Help Button */}
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Help</span>
              </Button>

              {/* Settings Button */}
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 px-2">
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src='' />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">
                      Team Member
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-56'>
                  <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className='gap-2'>
                    <User className='h-4 w-4' />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className='gap-2'>
                    <Settings className='h-4 w-4' />
                    Account Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
