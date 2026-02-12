
import { useAuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { User, Menu, Settings, LogOut, PanelLeftClose, BarChart3, Brain, Sun, Moon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import vintusureLogo from '@/assets/vintusure-logo.ico';

interface TopBarProps {
    onMenuClick?: () => void;
    isSidebarCollapsed?: boolean;
    onToggleCollapse?: () => void;
    activeTab?: 'overview' | 'ai';
    onTabChange?: (tab: 'overview' | 'ai') => void;
}

// Helper function to get user initials
const getUserInitials = (firstName: string | null | undefined, lastName: string | null | undefined, email: string | null | undefined): string => {
    if (firstName && lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (email) {
        return email.charAt(0).toUpperCase();
    }
    return 'U';
};

export default function TopBar({ onMenuClick, isSidebarCollapsed, onToggleCollapse, activeTab, onTabChange }: TopBarProps) {
    const { user, signOut } = useAuthContext();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    // Check if we're on the dashboard page
    const isDashboardPage = location.pathname === '/dashboard';

    // Handle navigation to dashboard tabs
    const handleDashboardNavigation = (tab: 'overview' | 'ai') => {
        if (isDashboardPage && onTabChange) {
            // If already on dashboard, just change the tab
            onTabChange(tab);
        } else {
            // If not on dashboard, navigate to dashboard with the tab
            navigate('/dashboard', { state: { activeTab: tab } });
        }
    };

    return (
        <div className="glass-morphism border-b border-purple-200/50 sticky top-0 z-40">
            <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center space-x-4">
                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    {/* Desktop Sidebar Collapse Button - Only show when sidebar is expanded */}
                    {!isSidebarCollapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden lg:flex text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                            onClick={onToggleCollapse}
                            title="Collapse sidebar"
                        >
                            <PanelLeftClose className="h-5 w-5" />
                        </Button>
                    )}

                    {/* Logo - Hidden on mobile when sidebar is open */}
                    <div className="flex items-center space-x-2 lg:hidden">
                        <img src={vintusureLogo} alt="VintuSure Logo" className="h-8 w-8" />
                        <span className="text-xl font-bold text-primary">VintuSure</span>
                    </div>

                    {/* Dashboard Navigation - Available everywhere */}
                    <div className="hidden lg:flex items-center space-x-1 glass-morphism border border-purple-200/30 rounded-lg p-1 purple-shadow">
                        <Button
                            variant={isDashboardPage && activeTab === 'overview' ? 'default' : 'ghost'}
                            onClick={() => handleDashboardNavigation('overview')}
                            className={cn(
                                "transition-all duration-200 px-4 py-2 text-sm",
                                isDashboardPage && activeTab === 'overview'
                                    ? 'btn-purple-gradient text-white shadow-sm'
                                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                            )}
                        >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            {getUserInitials(user?.firstName, user?.lastName, user?.email)} Dashboard
                        </Button>
                        <Button
                            variant={isDashboardPage && activeTab === 'ai' ? 'default' : 'ghost'}
                            onClick={() => handleDashboardNavigation('ai')}
                            className={cn(
                                "transition-all duration-200 px-4 py-2 text-sm",
                                isDashboardPage && activeTab === 'ai'
                                    ? 'btn-purple-gradient text-white shadow-sm'
                                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                            )}
                        >
                            <Brain className="h-4 w-4 mr-2" />
                            VintuSure AI
                        </Button>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Theme Switcher */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="theme-switcher-button relative h-10 w-10 rounded-full border-2 border-primary/20 hover:border-primary/40 transition-all duration-200 p-0 hover:shadow-md hover:shadow-primary/25 group"
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* Sun Icon */}
                            <Sun
                                className={cn(
                                    "theme-switcher-icon h-5 w-5 absolute",
                                    theme === 'light'
                                        ? "active text-primary"
                                        : "inactive text-muted-foreground"
                                )}
                            />
                            {/* Moon Icon */}
                            <Moon
                                className={cn(
                                    "theme-switcher-icon h-5 w-5 absolute",
                                    theme === 'dark'
                                        ? "active text-primary"
                                        : "inactive text-muted-foreground"
                                )}
                            />
                        </div>

                        {/* Hover effect ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-primary/30 transition-all duration-200" />
                    </Button>

                    {/* User Profile */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-10 w-10 rounded-full border-2 border-primary hover:border-primary/80 transition-all duration-200 p-0 hover:shadow-md hover:shadow-primary/25"
                            >
                                <span className="text-sm font-medium text-primary bg-primary/10 rounded-full h-full w-full flex items-center justify-center">
                                    {getUserInitials(user?.firstName, user?.lastName, user?.email)}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 purple-modal purple-shadow-lg">
                            <DropdownMenuLabel className="font-normal purple-modal-header">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium text-primary">
                                        {user?.firstName && user?.lastName
                                            ? `${user.firstName} ${user.lastName}`
                                            : user?.email
                                        }
                                    </p>
                                    {user?.firstName && user?.lastName && (
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground capitalize">
                                        {user?.role || 'User'}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="purple-divider" />
                            <DropdownMenuItem asChild className="hover:bg-purple-50 transition-colors duration-200">
                                <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                                    <User className="h-4 w-4 text-primary" />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="hover:bg-purple-50 transition-colors duration-200">
                                <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                                    <Settings className="h-4 w-4 text-primary" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => signOut()}
                                className="text-muted-foreground hover:text-primary hover:bg-purple-50 cursor-pointer transition-colors duration-200"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
} 