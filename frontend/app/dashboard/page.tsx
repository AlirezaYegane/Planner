'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import GamifiedDashboard from '@/components/dashboard/GamifiedDashboard';

/**
 * Dashboard Page - Main dashboard view showing user statistics and daily tasks.
 * 
 * This component renders the gamified dashboard with task completion stats,
 * progress tracking, and today's task list.
 */
export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated, loading } = useAppSelector((state) => state.user);

    useEffect(() => {
        // Only redirect if loading is complete AND user is not authenticated
        // This prevents race condition during AuthProvider initialization
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, loading, router]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return <GamifiedDashboard />;
}
