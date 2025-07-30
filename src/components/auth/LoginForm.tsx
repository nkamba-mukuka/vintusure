
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { FirebaseError } from 'firebase/app'

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [formError, setFormError] = useState('')
    const [isRedirecting, setIsRedirecting] = useState(false)
    const navigate = useNavigate()
    const { signIn, error: authError, user } = useAuthContext()

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isLoading || isRedirecting) return

        setFormError('')
        setIsLoading(true)

        try {
            console.log('Attempting to sign in...')
            await signIn(email, password)
            console.log('Sign in successful')
        } catch (err) {
            console.error('Login error:', err)
            if (err instanceof FirebaseError) {
                setFormError(getErrorMessage(err))
            } else {
                setFormError('An unexpected error occurred. Please try again.')
            }
            setIsLoading(false)
        }
    }

    if (isRedirecting) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {(formError || (authError && authError.message)) && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                    {formError || authError?.message}
                </div>
            )}

            <div className="rounded-md shadow-sm -space-y-px">
                <div>
                    <label htmlFor="email-address" className="sr-only">
                        Email address
                    </label>
                    <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Email address"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="sr-only">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Password"
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isLoading || isRedirecting}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isLoading ? 'Signing in...' : isRedirecting ? 'Redirecting...' : 'Sign in'}
                </button>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm">
                    <Link
                        to="/signup"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Create new account
                    </Link>
                </div>
                <div className="text-sm">
                    <Link
                        to="/forgot-password"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Forgot your password?
                    </Link>
                </div>
            </div>
        </form>
    )
} 