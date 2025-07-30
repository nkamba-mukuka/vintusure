'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { AuthContextType, UserProfile, UserRole } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                // Fetch user profile from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setUserProfile(userDoc.data() as UserProfile);
                    }
                } catch (err) {
                    console.error('Error fetching user profile:', err);
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            setError(null);
            const result = await signInWithEmailAndPassword(auth, email, password);
            // Update last login
            await setDoc(doc(db, 'users', result.user.uid), {
                lastLogin: serverTimestamp()
            }, { merge: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during sign in');
            throw err;
        }
    };

    const signUp = async (email: string, password: string, role: UserRole = 'agent') => {
        try {
            setError(null);
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Create user profile in Firestore
            await setDoc(doc(db, 'users', result.user.uid), {
                uid: result.user.uid,
                email: result.user.email,
                role,
                displayName: result.user.displayName,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during sign up');
            throw err;
        }
    };

    const logout = async () => {
        try {
            setError(null);
            await signOut(auth);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during logout');
            throw err;
        }
    };

    const resetPassword = async (email: string) => {
        try {
            setError(null);
            await sendPasswordResetEmail(auth, email);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during password reset');
            throw err;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userProfile,
                loading,
                error,
                signIn,
                signUp,
                logout,
                resetPassword
            }}
        >
            {loading ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
} 