import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'
import { useAuthContext } from '@/contexts/AuthContext'
import LoadingState from '@/components/LoadingState'

export default function DashboardLayout() {
    const { loading } = useAuthContext()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    if (loading) {
        return <LoadingState />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
            <div className="flex">
                <Sidebar isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
} 