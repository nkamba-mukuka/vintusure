
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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
    ChevronRight,
} from 'lucide-react'
import vintusureLogo from '@/assets/vintusure-logo.ico'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Policies', href: '/policies', icon: FileText },
    { name: 'Claims', href: '/claims', icon: AlertCircle },
    { name: 'VintuSure AI', href: '/vintusure-ai', icon: Brain },
    { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarContentProps {
    isCollapsed?: boolean
    onToggleCollapse?: () => void
    isExpanded?: boolean
}

function SidebarContent({ isCollapsed = false, onToggleCollapse, isExpanded = false }: SidebarContentProps) {
    const location = useLocation()
    const { signOut } = useAuthContext()

    return (
        <TooltipProvider>
            <div className={cn(
                "flex flex-col h-full glass-morphism border-r border-purple-200/50",
                isExpanded && "sidebar-backdrop"
            )}>
                <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
                    {/* Header with logo */}
                    <div className={cn(
                        "flex items-center flex-shrink-0 transition-all duration-300",
                        isCollapsed ? "px-2 justify-center" : "px-4"
                    )}>
                        <Link 
                            to="/dashboard" 
                            className={cn(
                                "flex items-center transition-all duration-300 hover:opacity-80 cursor-pointer",
                                isCollapsed ? "space-x-0" : "space-x-2"
                            )}
                        >
                            <img 
                                src={vintusureLogo} 
                                alt="VintuSure Logo" 
                                className="h-8 w-8 flex-shrink-0" 
                            />
                            {!isCollapsed && (
                                <span className={cn(
                                    "text-xl font-bold text-primary whitespace-nowrap",
                                    isExpanded ? "sidebar-content-fade-in" : "animate-fade-in"
                                )}>
                                    VintuSure
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className={cn(
                        "mt-5 flex-1 space-y-1 transition-all duration-300",
                        isCollapsed ? "px-2" : "px-2"
                    )}>
                        {navigation.map((item, index) => {
                            const Icon = item.icon
                            const isActive = location.pathname === item.href
                            
                            const linkContent = (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        "group flex items-center text-sm font-medium rounded-md sidebar-item-hover relative",
                                        isCollapsed ? "px-3 py-3 justify-center" : "px-3 py-2",
                                        isActive
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border hover:border-primary/10"
                                    )}
                                    style={{
                                        animationDelay: isExpanded ? `${index * 50}ms` : '0ms'
                                    }}
                                >
                                    <Icon
                                        className={cn(
                                            "h-5 w-5 flex-shrink-0 transition-all duration-200",
                                            isCollapsed ? "mr-0" : "mr-3",
                                            isActive
                                                ? "text-primary"
                                                : "text-muted-foreground group-hover:text-primary"
                                        )}
                                    />
                                    {!isCollapsed && (
                                        <span className={cn(
                                            "whitespace-nowrap",
                                            isExpanded ? "sidebar-content-fade-in" : "animate-fade-in"
                                        )}>
                                            {item.name}
                                        </span>
                                    )}
                                    
                                    {/* Active indicator for collapsed state */}
                                    {isCollapsed && isActive && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
                                    )}
                                </Link>
                            )

                            // Wrap with tooltip when collapsed
                            if (isCollapsed) {
                                return (
                                    <Tooltip key={item.name} delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            {linkContent}
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="font-medium purple-modal purple-shadow">
                                            {item.name}
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            }

                            return linkContent
                        })}
                    </nav>
                </div>
                
                {/* Sign out button */}
                <div className={cn(
                    "flex-shrink-0 flex border-t border-purple-200/50 transition-all duration-300",
                    isCollapsed ? "p-2" : "p-4"
                )}>
                    {isCollapsed ? (
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => signOut()}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full h-10 p-0 text-muted-foreground hover:text-primary hover:bg-primary/5 sidebar-item-hover"
                                >
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="font-medium purple-modal purple-shadow">
                                Sign Out
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <Button
                            onClick={() => signOut()}
                            variant="ghost"
                            className="flex-shrink-0 w-full justify-start group text-muted-foreground hover:text-primary hover:bg-primary/5 sidebar-item-hover"
                        >
                            <LogOut className="mr-3 h-5 w-5 group-hover:text-primary" />
                            <span className={cn(
                                "text-sm font-medium",
                                isExpanded ? "sidebar-content-fade-in" : "animate-fade-in"
                            )}>
                                Sign Out
                            </span>
                        </Button>
                    )}
                </div>
            </div>
        </TooltipProvider>
    )
}

interface SidebarProps {
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    isCollapsed?: boolean
    onToggleCollapse?: () => void
}

export default function Sidebar({ isOpen, onOpenChange, isCollapsed = false, onToggleCollapse }: SidebarProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    // Use external state if provided, otherwise use internal state
    const isSidebarOpen = isOpen !== undefined ? isOpen : internalIsOpen
    const setIsSidebarOpen = onOpenChange || setInternalIsOpen

    // Show expanded content when hovered over collapsed sidebar
    const showExpandedContent = !isCollapsed || isHovered

    return (
        <>
            {/* Mobile Sidebar */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild className="lg:hidden">
                    <Button variant="ghost" size="icon" className="lg:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 glass-morphism">
                    <SidebarContent 
                        isCollapsed={false}
                    />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <div 
                className={cn(
                    "hidden lg:block lg:fixed lg:inset-y-0 lg:z-50 sidebar-width-transition",
                    isCollapsed ? "lg:w-16" : "lg:w-64"
                )}
            >
                {/* Main sidebar container - always visible */}
                <div 
                    className={cn(
                        "relative h-full transition-all duration-300 ease-in-out",
                        isCollapsed ? "w-16" : "w-64"
                    )}
                    onMouseEnter={() => isCollapsed && setIsHovered(true)}
                    onMouseLeave={() => isCollapsed && setIsHovered(false)}
                >
                    <SidebarContent 
                        isCollapsed={isCollapsed}
                        onToggleCollapse={onToggleCollapse}
                    />
                </div>

                {/* Hover overlay sidebar - shows when collapsed and hovered */}
                {isCollapsed && isHovered && (
                    <div 
                        className="absolute top-0 left-0 h-full w-64 z-50 sidebar-expand-enter-active purple-shadow-xl"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <SidebarContent 
                            isCollapsed={false}
                            isExpanded={true}
                        />
                    </div>
                )}
            </div>

            {/* Expand button for collapsed state */}
            {isCollapsed && !isHovered && (
                <div className="hidden lg:block lg:fixed lg:top-1/2 lg:left-14 lg:z-50 lg:-translate-y-1/2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleCollapse}
                        className="h-8 w-8 p-0 rounded-full glass-morphism border border-purple-200/50 purple-shadow hover:bg-primary/10 sidebar-item-hover opacity-60 hover:opacity-100"
                        title="Expand sidebar"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

        </>
    )
} 