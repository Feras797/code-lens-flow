import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

export function Login() {
  const { signIn, signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Sign in form state
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  
  // Sign up form state
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [signUpFullName, setSignUpFullName] = useState('')
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const { error } = await signIn(signInEmail, signInPassword)
    
    if (error) {
      setError(error.message || 'Failed to sign in')
    }
    
    setIsLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }
    
    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }
    
    const { error } = await signUp(signUpEmail, signUpPassword)
    
    if (error) {
      setError(error.message || 'Failed to sign up')
    } else {
      setError(null)
      // Show success message
      alert('Account created successfully! Please check your email to verify your account.')
    }
    
    setIsLoading(false)
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold text-center'>
            Environmental Impact Platform
          </CardTitle>
          <CardDescription className='text-center'>
            Monitor and analyze environmental impact data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='signin' className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='signin'>Sign In</TabsTrigger>
              <TabsTrigger value='signup'>Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value='signin'>
              <form onSubmit={handleSignIn} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='signin-email'>Email</Label>
                  <Input
                    id='signin-email'
                    type='email'
                    placeholder='you@example.com'
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='signin-password'>Password</Label>
                  <Input
                    id='signin-password'
                    type='password'
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <Alert variant='destructive'>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type='submit' className='w-full' disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value='signup'>
              <form onSubmit={handleSignUp} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='signup-name'>Full Name</Label>
                  <Input
                    id='signup-name'
                    type='text'
                    placeholder='John Doe'
                    value={signUpFullName}
                    onChange={(e) => setSignUpFullName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='signup-email'>Email</Label>
                  <Input
                    id='signup-email'
                    type='email'
                    placeholder='you@example.com'
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='signup-password'>Password</Label>
                  <Input
                    id='signup-password'
                    type='password'
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='signup-confirm-password'>Confirm Password</Label>
                  <Input
                    id='signup-confirm-password'
                    type='password'
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <Alert variant='destructive'>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type='submit' className='w-full' disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <p className='text-xs text-center text-muted-foreground w-full'>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
