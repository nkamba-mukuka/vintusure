'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Users,
    FileText,
    ClipboardList,
    FileBox,
    Settings,
    LogOut,
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const navigation = [
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Policies', href: '/policies', icon: FileText },
    { name: 'Claims', href: '/claims', icon: ClipboardList },
    { name: 'Documents', href: '/documents', icon: FileBox },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuthContext();

    return (
        <div className="w-64 bg-white shadow-sm h-screen">
            <div className="h-full flex flex-col">
                <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                    <div className="flex items-center flex-shrink-0 px-4">
                        <h1 className="text-xl font-bold text-gray-900">VintuSure</h1>
                    </div>
                    <nav className="mt-8 flex-1 px-2 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                                        isActive
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            'mr-3 h-5 w-5',
                                            isActive
                                                ? 'text-gray-500'
                                                : 'text-gray-400 group-hover:text-gray-500'
                                        )}
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                    <button
                        onClick={() => logout()}
                        className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
} 