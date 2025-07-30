'use client';

import { Metadata } from 'next';
import SignUpForm from '@/components/auth/SignUpForm';

export const metadata: Metadata = {
    title: 'Sign Up - VintuSure',
    description: 'Create your VintuSure Insurance Management System account',
};

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        VintuSure Insurance Management System
                    </p>
                </div>
                <SignUpForm />
            </div>
        </div>
    );
} 