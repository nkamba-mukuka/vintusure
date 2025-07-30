"use client"

import { useEffect, useState } from 'react';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

interface UseAuthReturn {
    user: User | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            setError(null);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during sign in');
        }
    };

    const signUp = async (email: string, password: string) => {
        try {
            setError(null);
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during sign up');
        }
    };

    const logout = async () => {
        try {
            setError(null);
            await signOut(auth);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during logout');
        }
    };

    return {
        user,
        loading,
        error,
        signIn,
        signUp,
        logout,
    };
} 