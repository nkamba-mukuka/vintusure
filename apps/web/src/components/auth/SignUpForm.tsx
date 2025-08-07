
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
            console.log('User registered, redirecting to dashboard...')
            navigate('/dashboard', { replace: true })
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
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
            {/* Background gradient effects */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/3 top-0 -z-10 transform-gpu blur-3xl" aria-hidden="true">
                    <div
                        className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary to-purple-200 opacity-10"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>
            </div>

            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="space-y-2 text-center">
                    <div className="flex justify-center mb-4">
                        <img src={vintusureLogo} alt="VintuSure Logo" className="h-12 w-12" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-primary">Create an account</CardTitle>
                    <CardDescription>Sign up with your Apple or Google account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Social Sign Up Buttons */}
                    <div className="flex flex-col gap-4">
                        <Button variant="outline" className="w-full hover:bg-primary/5 hover:text-primary" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                                <path
                                    d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                                    fill="currentColor"
                                />
                            </svg>
                            Sign up with Apple
                        </Button>
                        <Button variant="outline" className="w-full hover:bg-primary/5 hover:text-primary" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                                <path
                                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                    fill="currentColor"
                                />
                            </svg>
                            Sign up with Google
                        </Button>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {authError && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                            {authError.message}
                        </div>
                    )}

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
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
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
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
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: value =>
                                        value === password || 'The passwords do not match',
                                })}
                                className={errors.confirmPassword ? 'border-red-500' : ''}
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" variant="purple">
                            {isLoading ? 'Creating account...' : isRedirecting ? 'Redirecting...' : 'Create account'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <p className="text-sm text-center text-muted-foreground">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                    <p className="text-xs text-center text-muted-foreground">
                        By clicking continue, you agree to our{' '}
                        <a href="#" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>{' '}
                        and{' '}
                        <a href="#" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
} 