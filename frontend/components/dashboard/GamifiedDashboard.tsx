import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/lib/types';
import { api } from '@/lib/api';
import { FocusCard } from '../ui/focus-card';
import { FlowBar } from '../ui/flow-bar';
import { DopamineButton } from '../ui/dopamine-button';
import { ProgressPill } from '../ui/progress-pill';
import { Flame, Trophy, Target, Calendar } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import FocusModeOverlay from '../focus/FocusModeOverlay';

export default function GamifiedDashboard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const { toast } = useToast();

    // Mock Gamification Data (would come from backend in real app)
    const XP_PER_TASK = 50;
    const XP_TO_NEXT_LEVEL = 500;
    const STREAK_DAYS = 3;

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const data = await api.getTasks({ date: today });
            setTasks(data);

            // Calculate initial XP based on completed tasks
            const completedCount = data.filter(t => t.status === 'done').length;
            setXp(completedCount * XP_PER_TASK);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteTask = async (taskId: number) => {
        try {
            // Optimistic update
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, status: 'done' } : t
            ));

            // Gamification feedback
            setXp(prev => prev + XP_PER_TASK);
            toast({
                title: "Task Crushed! +50 XP",
                description: "Keep that momentum going! 🔥",
                className: "bg-teal-50 border-teal-200 text-teal-900",
            });

            // If it was the active task, clear it
            if (activeTaskId === taskId) {
                setActiveTaskId(null);
            }

            // Call API (assuming updateTask exists)
            // await api.updateTask(taskId, { status: 'done' });

        } catch (error) {
            console.error('Failed to complete task', error);
        }
    };

    const handleStartTask = (taskId: number) => {
        setActiveTaskId(taskId);
    };

    const activeTask = tasks.find(t => t.id === activeTaskId);
    const todoTasks = tasks.filter(t => t.status !== 'done');
    const doneTasks = tasks.filter(t => t.status === 'done');
    const progress = (doneTasks.length / (tasks.length || 1)) * 100;

    if (loading) return <div className="p-8 text-center text-slate-400">Loading your HQ...</div>;

    return (
        <div className="space-y-8 pb-24">
            {/* Gamified Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"
                >
                    <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                        <Trophy className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-sm font-medium mb-1">
                            <span className="text-slate-600">Level {level}</span>
                            <span className="text-blue-600">{xp} / {XP_TO_NEXT_LEVEL} XP</span>
                        </div>
                        <ProgressPill value={xp} max={XP_TO_NEXT_LEVEL} className="h-2" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"
                >
                    <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <Flame className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Daily Streak</p>
                        <p className="text-2xl font-bold text-slate-800">{STREAK_DAYS} Days</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white flex items-center justify-between"
                >
                    <div>
                        <p className="text-blue-100 text-sm">Focus Score</p>
                        <p className="text-3xl font-bold">85%</p>
                    </div>
                    <Target className="h-10 w-10 text-blue-200 opacity-50" />
                </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Today's Plan */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-500" />
                            Today's Mission
                        </h2>
                        <DopamineButton size="sm" variant="outline">
                            + Add Task
                        </DopamineButton>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-slate-500 mb-4">No missions active. Ready to plan your day?</p>
                            <DopamineButton>Start Daily Ritual</DopamineButton>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {todoTasks.map((task) => (
                                <div key={task.id} onClick={() => handleStartTask(task.id)} className="cursor-pointer">
                                    <FocusCard
                                        title={task.name}
                                        description={task.description}
                                        status="todo"
                                        priority="medium"
                                        onComplete={() => handleCompleteTask(task.id)}
                                        className={activeTaskId === task.id ? "ring-2 ring-blue-500 ring-offset-2" : ""}
                                    />
                                </div>
                            ))}

                            {doneTasks.length > 0 && (
                                <>
                                    <div className="h-px bg-slate-100 my-6" />
                                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Completed Missions</p>
                                    {doneTasks.map((task) => (
                                        <FocusCard
                                            key={task.id}
                                            title={task.name}
                                            status="done"
                                            className="opacity-50"
                                        />
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Side Quests / Stats */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-semibold text-slate-800 mb-4">Daily Progress</h3>
                        <div className="flex justify-center mb-4">
                            <div className="relative h-32 w-32 flex items-center justify-center">
                                <svg className="h-full w-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="56" stroke="#F1F5F9" strokeWidth="12" fill="none" />
                                    <circle
                                        cx="64" cy="64" r="56"
                                        stroke="#3B82F6" strokeWidth="12" fill="none"
                                        strokeDasharray={351}
                                        strokeDashoffset={351 - (351 * progress) / 100}
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <span className="absolute text-2xl font-bold text-slate-700">{Math.round(progress)}%</span>
                            </div>
                        </div>
                        <p className="text-center text-sm text-slate-500">
                            {progress === 100 ? "All missions complete! 🎉" : "Keep pushing, you got this!"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Persistent Flow Bar */}
            <FlowBar
                currentTask={activeTask}
                onComplete={() => activeTask && handleCompleteTask(activeTask.id)}
                onSkip={() => setActiveTaskId(null)}
            />

            <FocusModeOverlay
                task={activeTask || null}
                isOpen={!!activeTask}
                onClose={() => setActiveTaskId(null)}
                onComplete={(taskId) => {
                    handleCompleteTask(taskId);
                    setActiveTaskId(null);
                }}
            />
        </div >
    );
}
