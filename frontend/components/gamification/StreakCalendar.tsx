import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchStreakData } from '@/store/slices/historySlice';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function StreakCalendar() {
    const dispatch = useAppDispatch();
    const { streakData, loading } = useAppSelector((state) => state.history);

    useEffect(() => {
        dispatch(fetchStreakData());
    }, [dispatch]);

    if (loading || !streakData) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="animate-pulse">
                    <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
                    <div className="h-24 bg-slate-100 rounded"></div>
                </div>
            </div>
        );
    }

    const { current_streak, longest_streak, activity_calendar } = streakData;

    // Group days by week for grid layout
    const weeks: any[] = [];
    let currentWeek: any[] = [];

    activity_calendar.forEach((day, index) => {
        currentWeek.push(day);
        if ((index + 1) % 7 === 0) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });
    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }

    const getIntensityColor = (day: any) => {
        if (!day.has_activity) return 'bg-slate-100';
        const totalActivity = day.tasks_completed + (day.focus_minutes / 60);
        if (totalActivity >= 5) return 'bg-emerald-600';
        if (totalActivity >= 3) return 'bg-emerald-500';
        if (totalActivity >= 1) return 'bg-emerald-400';
        return 'bg-emerald-200';
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Activity Streak</h3>
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-orange-600">
                            <Flame className="h-5 w-5" />
                            <span className="text-2xl font-bold">{current_streak}</span>
                        </div>
                        <p className="text-xs text-slate-500">Current</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-slate-700">{longest_streak}</p>
                        <p className="text-xs text-slate-500">Best</p>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-1">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex gap-1">
                        {week.map((day: any, dayIndex: number) => (
                            <motion.div
                                key={day.date}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                                className={`w-3 h-3 rounded-sm ${getIntensityColor(day)} 
                                    hover:ring-2 hover:ring-blue-400 hover:ring-offset-1 
                                    cursor-pointer transition-all group relative`}
                                title={`${day.date}: ${day.tasks_completed} tasks, ${day.focus_minutes}min focus, ${day.xp_earned} XP`}
                            >
                                {/* Tooltip on hover */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                                    bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap 
                                    opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                    <div>{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                    <div>{day.tasks_completed} tasks • {day.focus_minutes}min</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-slate-100"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-200"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-400"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-600"></div>
                <span>More</span>
            </div>
        </div>
    );
}
