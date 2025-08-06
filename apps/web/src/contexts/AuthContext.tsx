
import React, { createContext, useContext, useEffect, useState } from 'react'
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { useToast } from '@/components/ui/use-toast'

interface AuthContextType {
    user: User | null
    loading: boolean
    error: Error | null
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    error: null,
    signIn: async () => { },
    signUp: async () => { },
    signOut: async () => { },
    resetPassword: async () => { }
})

export const useAuthContext = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const handleAuthError = (error: Error) => {
        console.error('Authentication error:', error)
        setError(error)
        toast({
            title: 'Authentication Error',
            description: error.message,
            variant: 'destructive'
        })
    }

    const signIn = async (email: string, password: string) => {
        try {
            setError(null)
            await signInWithEmailAndPassword(auth, email, password)
        } catch (error) {
            handleAuthError(error as Error)
            throw error
        }
    }

    const signUp = async (email: string, password: string) => {
        try {
            setError(null)
            await createUserWithEmailAndPassword(auth, email, password)
        } catch (error) {
            handleAuthError(error as Error)
            throw error
        }
    }

    const signOut = async () => {
        try {
            setError(null)
            await firebaseSignOut(auth)
        } catch (error) {
            handleAuthError(error as Error)
            throw error
        }
    }

    const resetPassword = async (email: string) => {
        try {
            setError(null)
            await sendPasswordResetEmail(auth, email)
            toast({
                title: 'Password Reset Email Sent',
                description: 'Check your email for password reset instructions.'
            })
        } catch (error) {
            handleAuthError(error as Error)
            throw error
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                signIn,
                signUp,
                signOut,
                resetPassword
            }}
        >
            {children}
        </AuthContext.Provider>
    )
} 