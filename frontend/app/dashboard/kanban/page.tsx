'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import KanbanBoard from '@/components/kanban/KanbanBoard';

export default function KanbanPage() {
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
        return null; // Will redirect
    }

    return (
        <div className="container mx-auto py-6 h-[calc(100vh-4rem)]">
            <KanbanBoard />
        </div>
    );
}
