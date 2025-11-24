import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface FocusCardProps {
    title: string;
    description?: string;
    status?: 'todo' | 'in-progress' | 'done';
    priority?: 'low' | 'medium' | 'high';
    dueTime?: string;
    onComplete?: () => void;
    className?: string;
}

export function FocusCard({
    title,
    description,
    status = 'todo',
    priority = 'medium',
    dueTime,
    onComplete,
    className
}: FocusCardProps) {
    const priorityColors = {
        low: 'bg-slate-100 text-slate-600',
        medium: 'bg-blue-50 text-blue-600',
        high: 'bg-rose-50 text-rose-600'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className={cn(
                "group relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200",
                status === 'done' && "opacity-60 bg-slate-50",
                className
            )}
        >
            {/* Progress Bar / Status Indicator */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 transition-colors",
                status === 'in-progress' ? "bg-blue-500" :
                    status === 'done' ? "bg-teal-500" : "bg-transparent group-hover:bg-slate-200"
            )} />

            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className={cn(
                            "font-semibold text-lg leading-tight text-slate-900",
                            status === 'done' && "line-through text-slate-500"
                        )}>
                            {title}
                        </h3>
                        {priority === 'high' && (
                            <AlertCircle className="h-4 w-4 text-rose-500" />
                        )}
                    </div>

                    {description && (
                        <p className="text-sm text-slate-500 line-clamp-2">{description}</p>
                    )}

                    <div className="flex items-center gap-3 pt-2 text-xs font-medium">
                        <span className={cn("px-2 py-1 rounded-full", priorityColors[priority])}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </span>

                        {dueTime && (
                            <span className="flex items-center gap-1 text-slate-500">
                                <Clock className="h-3 w-3" />
                                {dueTime}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={onComplete}
                    className={cn(
                        "flex-shrink-0 rounded-full p-2 transition-colors",
                        status === 'done'
                            ? "text-teal-500 bg-teal-50"
                            : "text-slate-300 hover:text-blue-500 hover:bg-blue-50"
                    )}
                >
                    <CheckCircle2 className={cn("h-6 w-6", status === 'done' && "fill-current")} />
                </button>
            </div>
        </motion.div>
    );
}
