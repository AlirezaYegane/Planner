'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import DailyRitual from '@/components/daily-plan/DailyRitual';

export default function DailyPlanPage() {
    const router = useRouter();
    const { isAuthenticated, loading } = useAppSelector((state) => state.user);

    useEffect(() => {
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

    return <DailyRitual />;
}
