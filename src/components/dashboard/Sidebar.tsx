
import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
    Home,
    Users,
    FileText,
    AlertCircle,
    Settings,
    LogOut
} from 'lucide-react'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Policies', href: '/policies', icon: FileText },
    { name: 'Claims', href: '/claims', icon: AlertCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
    const location = useLocation()
    const { signOut } = useAuthContext()

    return (
        <div className="flex flex-col w-64 bg-white border-r">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                    <span className="text-xl font-semibold">VintuSure</span>
                </div>
                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    location.pathname === item.href
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                )}
                            >
                                <Icon
                                    className={cn(
                                        location.pathname === item.href
                                            ? 'text-gray-500'
                                            : 'text-gray-400 group-hover:text-gray-500',
                                        'mr-3 h-5 w-5'
                                    )}
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <button
                    onClick={() => signOut()}
                    className="flex-shrink-0 w-full group block"
                >
                    <div className="flex items-center">
                        <div>
                            <LogOut className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                Sign Out
                            </p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    )
} 