
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthContext } from '@/contexts/AuthContext'
import { FirebaseError } from 'firebase/app'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import LoadingState from '@/components/LoadingState'
import vintusureLogo from '@/assets/vintusure-logo.ico'

interface LoginFormData {
    email: string
    password: string
}

export default function LoginForm() {
    const { signIn, error: authError, user } = useAuthContext()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [isRedirecting, setIsRedirecting] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()

    // Monitor authentication state
    useEffect(() => {
        if (user && !isRedirecting) {
            setIsRedirecting(true)
            console.log('User authenticated, redirecting to dashboard...')
            navigate('/dashboard', { replace: true })
        }
    }, [user, navigate, isRedirecting])

    const getErrorMessage = (error: FirebaseError) => {
        switch (error.code) {
            case 'auth/invalid-email':
                return 'Invalid email address format'
            case 'auth/user-disabled':
                return 'This account has been disabled'
            case 'auth/user-not-found':
                return 'No account found with this email'
            case 'auth/wrong-password':
                return 'Incorrect password'
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later'
            default:
                return `Sign in error: ${error.code}`
        }
    }

    const onSubmit = async (data: LoginFormData) => {
        if (isLoading || isRedirecting) return
        setIsLoading(true)
        try {
            console.log('Attempting to sign in...')
            await signIn(data.email, data.password)
            console.log('Sign in successful')
        } catch (error) {
            console.error('Login error:', error)
            if (error instanceof FirebaseError) {
                toast({
                    variant: "destructive",
                    title: "Login Failed",
                    description: getErrorMessage(error),
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Login Failed",
                    description: "An unexpected error occurred. Please try again.",
                })
            }
            setIsLoading(false)
        }
    }

    if (isLoading || isRedirecting) {
        return <LoadingState />
    }

    return (
        <Card className="w-full mx-auto backdrop-blur-md bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10 shadow-2xl">
            <CardHeader className="space-y-2 text-center px-4 sm:px-6">
                <div className="flex justify-center mb-4">
                    <img src={vintusureLogo} alt="VintuSure Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-white">Welcome back</CardTitle>
                <CardDescription className="text-white/80 text-sm sm:text-base">Login with your Google account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                {/* Social Login Buttons */}
                <div className="flex flex-col gap-3 sm:gap-4">
                    <Button variant="outline" className="w-full border-white/20 text-white bg-white/5 backdrop-blur-sm h-10 sm:h-11" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white/10 dark:bg-black/20 px-2 text-white/60 backdrop-blur-sm">Or continue with</span>
                    </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/90 text-sm font-medium">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="w-full bg-white/10 border-white/20 text-white !text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 backdrop-blur-sm h-10 sm:h-11"
                            style={{ color: 'white' }}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                        />
                        {errors.email && (
                            <p className="text-red-400 text-xs">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-white/90 text-sm font-medium">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 backdrop-blur-sm h-10 sm:h-11"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters'
                                }
                            })}
                        />
                        {errors.password && (
                            <p className="text-red-400 text-xs">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <Link 
                            to="/forgot-password" 
                            className="text-xs text-white/70"
                        >
                            Forgot your password?
                        </Link>
                    </div>

                                         <Button 
                         type="submit" 
                         className="w-full bg-primary text-primary-foreground h-10 sm:h-11"
                         disabled={isLoading}
                     >
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-center w-full">
                    <p className="text-white/60 text-xs sm:text-sm">
                        Don't have an account?{' '}
                        <Link 
                            to="/signup" 
                            className="text-primary font-medium"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </CardFooter>
        </Card>
    )
} 