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
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Enhanced background gradient effects */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                {/* Top left gradient - Deep Space Theme */}
                <div className="absolute left-0 top-0 -z-10 transform-gpu blur-3xl" aria-hidden="true">
                    <div
                        className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#5E40B4] to-[#E464AB] opacity-10 dark:opacity-15"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>
                
                {/* Top right gradient - Cyan/Teal Theme */}
                <div className="absolute right-0 top-0 -z-10 transform-gpu blur-3xl" aria-hidden="true">
                    <div
                        className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-bl from-[#73C5E0] to-[#81D6E5] opacity-8 dark:opacity-12"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>
                
                {/* Bottom left gradient - Purple/Magenta Theme */}
                <div className="absolute left-0 bottom-0 -z-10 transform-gpu blur-3xl" aria-hidden="true">
                    <div
                        className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#A16EC5] to-[#5E40B4] opacity-8 dark:opacity-12"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>
                
                {/* Bottom right gradient - Teal/Cyan Theme */}
                <div className="absolute right-0 bottom-0 -z-10 transform-gpu blur-3xl" aria-hidden="true">
                    <div
                        className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-bl from-[#81D6E5] to-[#73C5E0] opacity-10 dark:opacity-15"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>

                {/* Center radial gradient - Enhanced for dark mode */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-transparent to-purple-100/20 dark:from-[#120F26]/20 dark:via-transparent dark:to-[#1F1A44]/15" />
                </div>

                {/* Additional deep space atmosphere for dark mode */}
                <div className="absolute inset-0 -z-10 dark:block hidden">
                    <div className="absolute inset-0 bg-gradient-radial from-[#5E40B4]/5 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#E464AB]/5" />
                </div>
            </div>

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
                <main className="min-h-[calc(100vh-4rem)] p-8 relative">
                    <div className="mx-auto max-w-7xl">
                        <Outlet context={{ activeTab: dashboardActiveTab, setActiveTab: handleDashboardTabChange }} />
                    </div>
                </main>
            </div>
        </div>
    )
} 