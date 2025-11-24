import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, CheckCircle2, RotateCcw, Coffee } from 'lucide-react';
import { Task } from '../../lib/types';
import { DopamineButton } from '../ui/dopamine-button';
import { ProgressPill } from '../ui/progress-pill';
import { cn } from '../../lib/utils';

interface FocusModeOverlayProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onComplete: (taskId: number) => void;
}

export default function FocusModeOverlay({ task, isOpen, onClose, onComplete }: FocusModeOverlayProps) {
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [totalTime, setTotalTime] = useState(25 * 60);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((t) => t - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play sound?
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    useEffect(() => {
        if (isOpen) {
            setMode('focus');
            setTimeLeft(25 * 60);
            setTotalTime(25 * 60);
            setIsActive(false);
        }
    }, [isOpen]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
        setTotalTime(mode === 'focus' ? 25 * 60 : 5 * 60);
    };

    const switchMode = () => {
        const newMode = mode === 'focus' ? 'break' : 'focus';
        setMode(newMode);
        const newTime = newMode === 'focus' ? 25 * 60 : 5 * 60;
        setTimeLeft(newTime);
        setTotalTime(newTime);
        setIsActive(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    if (!task) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col items-center justify-center p-6"
                >
                    {/* Background Ambient Glow */}
                    <div className={cn(
                        "absolute inset-0 opacity-20 transition-colors duration-1000",
                        mode === 'focus' ? "bg-blue-900" : "bg-green-900"
                    )} />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="h-6 w-6 text-slate-400 hover:text-white" />
                    </button>

                    <div className="relative z-10 max-w-2xl w-full text-center space-y-12">
                        {/* Task Anchor */}
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium text-blue-200 border border-white/5">
                                {mode === 'focus' ? '🎯 Deep Focus Mode' : '☕ Recharging Break'}
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                                {task.name}
                            </h2>
                            {task.description && (
                                <p className="text-slate-400 text-lg max-w-lg mx-auto line-clamp-2">
                                    {task.description}
                                </p>
                            )}
                        </div>

                        {/* Timer */}
                        <div className="relative">
                            <div className="text-[8rem] md:text-[12rem] font-bold font-mono leading-none tracking-tighter tabular-nums">
                                {formatTime(timeLeft)}
                            </div>

                            {/* Circular Progress (Visual only for now, could be SVG) */}
                            <div className="w-full max-w-md mx-auto mt-8">
                                <ProgressPill value={progress} max={100} className="h-2 bg-white/10" />
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-6">
                            <DopamineButton
                                size="lg"
                                variant="ghost"
                                onClick={resetTimer}
                                className="rounded-full h-16 w-16 p-0 border-2 border-white/10 hover:bg-white/10 text-slate-300"
                            >
                                <RotateCcw className="h-6 w-6" />
                            </DopamineButton>

                            <DopamineButton
                                size="lg"
                                onClick={toggleTimer}
                                className={cn(
                                    "rounded-full h-24 w-24 p-0 text-white shadow-xl shadow-blue-900/20 text-xl",
                                    isActive ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-500"
                                )}
                            >
                                {isActive ? <Pause className="h-10 w-10 fill-current" /> : <Play className="h-10 w-10 fill-current ml-1" />}
                            </DopamineButton>

                            <DopamineButton
                                size="lg"
                                variant="ghost"
                                onClick={switchMode}
                                className="rounded-full h-16 w-16 p-0 border-2 border-white/10 hover:bg-white/10 text-slate-300"
                            >
                                <Coffee className="h-6 w-6" />
                            </DopamineButton>
                        </div>

                        {/* Complete Action */}
                        <div className="pt-8">
                            <DopamineButton
                                variant="success"
                                size="lg"
                                onClick={() => onComplete(task.id)}
                                className="px-8 py-6 text-lg rounded-2xl"
                            >
                                <CheckCircle2 className="mr-2 h-6 w-6" />
                                Mark Mission Complete
                            </DopamineButton>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
