import { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "@/components/dashboard/Sidebar"
import TopBar from "@/components/dashboard/TopBar"

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        // Initialize from localStorage or default to false
        const saved = localStorage.getItem('sidebar-collapsed')
        return saved ? JSON.parse(saved) : false
    })
    const [dashboardActiveTab, setDashboardActiveTab] = useState<'overview' | 'ai'>('overview')
    const location = useLocation()

    // Save collapse state to localStorage
    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(isSidebarCollapsed))
    }, [isSidebarCollapsed])

    // Handle navigation state when coming from other pages
    useEffect(() => {
        if (location.pathname === '/dashboard' && location.state?.activeTab) {
            setDashboardActiveTab(location.state.activeTab)
        }
    }, [location])

    // Reset dashboard tab when leaving dashboard page
    useEffect(() => {
        if (location.pathname !== '/dashboard') {
            setDashboardActiveTab('overview')
        }
    }, [location.pathname])

    const handleToggleCollapse = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed)
    }

    const handleDashboardTabChange = (tab: 'overview' | 'ai') => {
        setDashboardActiveTab(tab)
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <Sidebar 
                isOpen={isSidebarOpen} 
                onOpenChange={setIsSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={handleToggleCollapse}
            />

            {/* Main Content */}
            <div className={`transition-all duration-300 ease-in-out ${
                isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
            }`}>
                {/* Top Bar */}
                <TopBar 
                    onMenuClick={() => setIsSidebarOpen(true)}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleCollapse={handleToggleCollapse}
                    activeTab={dashboardActiveTab}
                    onTabChange={handleDashboardTabChange}
                />

                {/* Content Area */}
                <main className="min-h-[calc(100vh-4rem)] p-8">
                    <div className="mx-auto max-w-7xl">
                        <Outlet context={{ activeTab: dashboardActiveTab, setActiveTab: handleDashboardTabChange }} />
                    </div>
                </main>
            </div>

            {/* Background gradient effects */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/3 top-0 -z-10 transform-gpu blur-3xl" aria-hidden="true">
                    <div
                        className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary to-purple-200 opacity-10"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>
                <div className="absolute right-1/3 bottom-0 -z-10 transform-gpu blur-3xl" aria-hidden="true">
                    <div
                        className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary to-purple-200 opacity-10"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>
            </div>
        </div>
    )
} 