
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
    Home,
    Users,
    FileText,
    AlertCircle,
    Settings,
    LogOut,
    Brain,
    Sparkles,
    Car,
    Menu,
} from 'lucide-react'
import vintusureLogo from '@/assets/vintusure-logo.ico'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Policies', href: '/policies', icon: FileText },
    { name: 'Claims', href: '/claims', icon: AlertCircle },
    { name: 'Car Analyzer', href: '/car-analyzer', icon: Car },
    { name: 'RAG Test', href: '/rag-test', icon: Brain },
    { name: 'AI Generator', href: '/ai-generator', icon: Sparkles },
    { name: 'Settings', href: '/settings', icon: Settings },
]

function SidebarContent() {
    const location = useLocation()
    const { signOut } = useAuthContext()

    return (
        <div className="flex flex-col h-full bg-card">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                    <div className="flex items-center space-x-2">
                        <img src={vintusureLogo} alt="VintuSure Logo" className="h-8 w-8" />
                        <span className="text-xl font-bold text-primary">VintuSure</span>
                    </div>
                </div>
                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary border-r-2 border-primary"
                                        : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "mr-3 h-5 w-5",
                                        isActive
                                            ? "text-primary"
                                            : "text-muted-foreground group-hover:text-primary"
                                    )}
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-border p-4">
                <Button
                    onClick={() => signOut()}
                    variant="ghost"
                    className="flex-shrink-0 w-full justify-start group text-muted-foreground hover:text-primary hover:bg-primary/5"
                >
                    <LogOut className="mr-3 h-5 w-5 group-hover:text-primary" />
                    <span className="text-sm font-medium">
                        Sign Out
                    </span>
                </Button>
            </div>
        </div>
    )
}

interface SidebarProps {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function Sidebar({ isOpen, onOpenChange }: SidebarProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false)

    // Use external state if provided, otherwise use internal state
    const isSidebarOpen = isOpen !== undefined ? isOpen : internalIsOpen
    const setIsSidebarOpen = onOpenChange || setInternalIsOpen

    return (
        <>
            {/* Mobile Sidebar */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild className="lg:hidden">
                    <Button variant="ghost" size="icon" className="lg:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:z-40 lg:w-64 border-r border-border">
                <SidebarContent />
            </div>
        </>
    )
} 