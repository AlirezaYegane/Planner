import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ProgressPillProps {
    value: number;
    max: number;
    label?: string;
    className?: string;
}

export function ProgressPill({ value, max, label, className }: ProgressPillProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className={cn("w-full space-y-1", className)}>
            {label && (
                <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>{label}</span>
                    <span>{Math.round(percentage)}%</span>
                </div>
            )}
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={cn(
                        "h-full rounded-full transition-colors",
                        percentage < 30 ? "bg-blue-400" :
                            percentage < 70 ? "bg-blue-500" :
                                "bg-teal-500"
                    )}
                />
            </div>
        </div>
    );
}
