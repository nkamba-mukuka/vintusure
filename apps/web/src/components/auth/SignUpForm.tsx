
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

interface SignUpFormData {
    email: string
    password: string
    confirmPassword: string
}

export default function SignUpForm() {
    const { signUp, error: authError, user } = useAuthContext()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [isRedirecting, setIsRedirecting] = useState(false)
    const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpFormData>()
    const password = watch('password')

    // Monitor authentication state
    useEffect(() => {
        if (user && !isRedirecting) {
            setIsRedirecting(true)
            console.log('User registered, redirecting to onboarding...')
            navigate('/onboarding', { replace: true })
        }
    }, [user, navigate, isRedirecting])

    const getErrorMessage = (error: FirebaseError) => {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return 'An account with this email already exists'
            case 'auth/invalid-email':
                return 'Invalid email address format'
            case 'auth/operation-not-allowed':
                return 'Email/password accounts are not enabled. Please contact support.'
            case 'auth/weak-password':
                return 'Password is too weak. Please use a stronger password.'
            default:
                return `Sign up error: ${error.code}`
        }
    }

    const onSubmit = async (data: SignUpFormData) => {
        if (isLoading || isRedirecting) return
        setIsLoading(true)
        try {
            console.log('Attempting to sign up...')
            await signUp(data.email, data.password)
            console.log('Sign up successful')
        } catch (error) {
            console.error('Sign up error:', error)
            if (error instanceof FirebaseError) {
                toast({
                    variant: "destructive",
                    title: "Sign Up Failed",
                    description: getErrorMessage(error),
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Sign Up Failed",
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
        <Card className="w-full max-w-md mx-auto backdrop-blur-md bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10 shadow-2xl">
            <CardHeader className="space-y-2 text-center">
                <div className="flex justify-center mb-4">
                    <img src={vintusureLogo} alt="VintuSure Logo" className="h-12 w-12" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-white">Create an account</CardTitle>
                <CardDescription className="text-white/80">Create your account to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Error Message */}
                {authError && (
                    <div className="bg-red-500/20 text-red-200 p-3 rounded-md text-sm border border-red-500/30">
                        {authError.message}
                    </div>
                )}

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-white font-medium">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                            className={`bg-white/10 border-white/20 text-indigo-400 placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 focus:text-indigo-400 ${errors.email ? 'border-red-400' : ''}`}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-300">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-white font-medium">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Create a password"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters',
                                },
                            })}
                            className={`bg-white/10 border-white/20 text-indigo-400 placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 focus:text-indigo-400 ${errors.password ? 'border-red-400' : ''}`}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-300">{errors.password.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-white font-medium">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: value =>
                                    value === password || 'The passwords do not match',
                            })}
                            className={`bg-white/10 border-white/20 text-indigo-400 placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 focus:text-indigo-400 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-300">{errors.confirmPassword.message}</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full bg-primary text-white shadow-lg" variant="default">
                        {isLoading ? 'Creating account...' : isRedirecting ? 'Redirecting...' : 'Create account'}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <p className="text-sm text-center text-white/80">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="font-medium text-primary"
                    >
                        Sign in
                    </Link>
                </p>
                <p className="text-xs text-center text-white/60">
                    By clicking continue, you agree to our{' '}
                    <a href="#" className="underline underline-offset-4">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="underline underline-offset-4">Privacy Policy</a>.
                </p>
            </CardFooter>
        </Card>
    )
} 