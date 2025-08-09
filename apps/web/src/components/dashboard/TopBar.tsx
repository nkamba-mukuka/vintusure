
import { useAuthContext } from '@/contexts/AuthContext';
import { User, Menu, Settings, LogOut, PanelLeftClose } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import vintusureLogo from '@/assets/vintusure-logo.ico';

interface TopBarProps {
    onMenuClick?: () => void;
}

// Helper function to get user initials
const getUserInitials = (firstName?: string, lastName?: string, email?: string): string => {
    if (firstName && lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (email) {
        return email.charAt(0).toUpperCase();
    }
    return 'U';
};

export default function TopBar({ onMenuClick, isSidebarCollapsed, onToggleCollapse }: TopBarProps) {
    const { user, signOut } = useAuthContext();

    return (
        <div className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
            <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center space-x-4">
                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden text-muted-foreground hover:text-primary hover:bg-primary/5"
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
                </div>

                <div className="flex items-center space-x-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-10 w-10 rounded-full border-2 border-indigo-500 hover:border-indigo-600 transition-colors duration-200 p-0"
                            >
                                {user?.profileImage ? (
                                    <img
                                        src={user.profileImage}
                                        alt={`${user.firstName || ''} ${user.lastName || ''}`}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm font-medium text-primary">
                                        {getUserInitials(user?.firstName, user?.lastName, user?.email)}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="font-normal">
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                                    <User className="h-4 w-4" />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => signOut()}
                                className="text-muted-foreground hover:text-primary hover:bg-primary/5 cursor-pointer"
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