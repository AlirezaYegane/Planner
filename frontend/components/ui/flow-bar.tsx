import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, CheckCircle2, X } from 'lucide-react';
import { Button } from './button';
import { Task } from '@/lib/types';

interface FlowBarProps {
    currentTask?: Task;
    onComplete?: () => void;
    onSkip?: () => void;
}

export function FlowBar({ currentTask, onComplete, onSkip }: FlowBarProps) {
    const [isActive, setIsActive] = useState(false);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    if (!currentTask) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-slate-900/90 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-slate-700/50 flex items-center justify-between z-50"
            >
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-mono font-bold">
                        {formatTime(seconds)}
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Current Focus</p>
                        <h3 className="font-semibold text-sm md:text-base line-clamp-1">{currentTask.name}</h3>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                        onClick={() => setIsActive(!isActive)}
                    >
                        {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>

                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-teal-400 hover:text-teal-300 hover:bg-teal-900/30 rounded-full"
                        onClick={onComplete}
                    >
                        <CheckCircle2 className="h-5 w-5" />
                    </Button>

                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-full"
                        onClick={onSkip}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
