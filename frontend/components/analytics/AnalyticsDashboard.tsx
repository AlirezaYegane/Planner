'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchTasks } from '../../store/slices/tasksSlice';
import { fetchPlans } from '../../store/slices/plansSlice';
import TaskCompletionStats from './TaskCompletionStats';
import ProductivityChart from './ProductivityChart';
import TimeDistributionChart from './TimeDistributionChart';

export default function AnalyticsDashboard() {
    const dispatch = useAppDispatch();
    const { items: tasks, status: tasksStatus } = useAppSelector((state) => state.tasks);
    const { items: plans, status: plansStatus } = useAppSelector((state) => state.plans);

    useEffect(() => {
        if (tasksStatus === 'idle') {
            dispatch(fetchTasks());
        }
        if (plansStatus === 'idle') {
            dispatch(fetchPlans());
        }
    }, [dispatch, tasksStatus, plansStatus]);

    if (tasksStatus === 'loading' || plansStatus === 'loading') {
        return <div className="flex justify-center items-center h-64">Loading analytics...</div>;
    }

    return (
        <div className="space-y-6">
            <TaskCompletionStats tasks={tasks} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <ProductivityChart tasks={tasks} />
                <TimeDistributionChart plans={plans} />
            </div>
        </div>
    );
}
