
import { useAuthContext } from '@/contexts/AuthContext';
import { Bell, User, Menu } from 'lucide-react';
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

export default function TopBar({ onMenuClick }: TopBarProps) {
    const { user, userProfile, logout } = useAuthContext();

    return (
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center space-x-4">
                    {/* Mobile Menu Button */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="lg:hidden"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    
                    {/* Logo - Hidden on mobile when sidebar is open */}
                    <div className="flex items-center space-x-2 lg:hidden">
                        <img src={vintusureLogo} alt="VintuSure Logo" className="h-8 w-8" />
                        <span className="text-xl font-bold text-gray-800">VintuSure</span>
                    </div>
                </div>
                
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" className="hidden sm:flex">
                        <Bell className="h-5 w-5 text-gray-500" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <User className="h-5 w-5 text-gray-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                {user?.email}
                                {userProfile?.role && (
                                    <span className="block text-sm text-gray-500">
                                        {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                                    </span>
                                )}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => logout()}>
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
} 