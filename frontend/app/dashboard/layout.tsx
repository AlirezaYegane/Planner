'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, LayoutGrid, CheckSquare, BarChart3, History } from 'lucide-react';
import TeamSwitcher from '@/components/teams/TeamSwitcher';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/planner', label: 'Daily Planner', icon: Calendar },
        { href: '/dashboard/kanban', label: 'Kanban Board', icon: LayoutGrid },
        { href: '/dashboard/checklist', label: 'Checklist', icon: CheckSquare },
        { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/dashboard/history', label: 'History', icon: History },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800">Deep Focus</h1>
                    <p className="text-sm text-gray-500 mb-6">Planning Platform</p>
                    <TeamSwitcher />
                </div>

                <nav className="mt-6">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                                    }`}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-64 p-6 border-t">
                    <button
                        onClick={() => {
                            // Clear token and redirect to login
                            localStorage.removeItem('access_token');
                            window.location.href = '/login';
                        }}
                        className="w-full text-left text-gray-600 hover:text-red-600 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
