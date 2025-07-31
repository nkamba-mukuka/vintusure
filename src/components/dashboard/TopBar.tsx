
import { useAuthContext } from '@/contexts/AuthContext';
import { Bell, User } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function TopBar() {
    const { user, userProfile, logout } = useAuthContext();

    return (
        <div className="bg-white shadow-sm">
            <div className="h-16 flex items-center justify-between px-4">
                <div className="flex-1" />
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon">
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