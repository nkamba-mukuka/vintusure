import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard - VintuSure',
    description: 'VintuSure Insurance Management System Dashboard',
};

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-100">
            <main className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <div className="mt-4">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800">Welcome to VintuSure</h2>
                            <p className="mt-2 text-gray-600">
                                Your insurance management dashboard is ready.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 