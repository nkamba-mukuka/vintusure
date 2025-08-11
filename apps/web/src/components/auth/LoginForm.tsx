
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
                <CardDescription className="text-white/80 text-sm sm:text-base">Enter your credentials to sign in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/20" />
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
                            className="w-full bg-white/10 border-white/20 text-indigo-400 placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 backdrop-blur-sm h-10 sm:h-11"
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
                            className="w-full bg-white/10 border-white/20 text-indigo-400 placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 backdrop-blur-sm h-10 sm:h-11"
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