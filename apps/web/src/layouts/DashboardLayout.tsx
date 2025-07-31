import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'
import { useAuthContext } from '@/contexts/AuthContext'
import LoadingState from '@/components/LoadingState'

export default function DashboardLayout() {
    const { loading } = useAuthContext()

    if (loading) {
        return <LoadingState />
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <TopBar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
} 