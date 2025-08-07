
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

                    {/* Logo - Hidden on mobile when sidebar is open */}
                    <div className="flex items-center space-x-2 lg:hidden">
                        <img src={vintusureLogo} alt="VintuSure Logo" className="h-8 w-8" />
                        <span className="text-xl font-bold text-primary">VintuSure</span>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden sm:flex text-muted-foreground hover:text-primary hover:bg-primary/5"
                    >
                        <Bell className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-primary hover:bg-primary/5"
                            >
                                <User className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium text-primary">{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={() => signOut()}
                                className="text-muted-foreground hover:text-primary hover:bg-primary/5"
                            >
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
} 