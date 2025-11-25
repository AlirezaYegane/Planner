import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, CheckCircle2, Circle, Target } from 'lucide-react';
import { Task } from '@/lib/types';

interface TaskHierarchyTreeProps {
    tasks: Task[];
    onToggleTask?: (taskId: number) => void;
}

interface TreeNodeProps {
    task: Task;
    level: number;
    onToggle?: (taskId: number) => void;
}

function TreeNode({ task, level, onToggle }: TreeNodeProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const completedSubtasks = task.subtasks?.filter(st => st.is_done).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    const isDone = task.status === 'done';
    const isInProgress = task.status === 'in_progress';

    return (
        <div className="select-none">
            <motion.div
                className={`flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer
                    ${level > 0 ? 'ml-8' : ''} ${isDone ? 'opacity-60' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
            >
                {/* Expand/Collapse Icon */}
                {hasSubtasks && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>
                )}
                {!hasSubtasks && <div className="w-6" />}

                {/* Checkbox */}
                <button
                    onClick={() => onToggle?.(task.id)}
                    className="flex-shrink-0"
                >
                    {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                        <Circle className="h-5 w-5 text-slate-300 hover:text-blue-500" />
                    )}
                </button>

                {/* Task Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className={`font-medium ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.name}
                        </span>
                        {isInProgress && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                In Progress
                            </span>
                        )}
                    </div>

                    {/* Subtask Progress Bar */}
                    {hasSubtasks && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <span className="text-xs font-medium">
                                {completedSubtasks}/{totalSubtasks}
                            </span>
                        </div>
                    )}
                </div>

                {/* Points Badge */}
                {task.points_value > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-semibold">
                        <Target className="h-3 w-3" />
                        {task.points_value} XP
                    </div>
                )}
            </motion.div>

            {/* Subtasks */}
            <AnimatePresence>
                {hasSubtasks && isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {task.subtasks?.map((subtask) => (
                            <div key={subtask.id} className={`flex items-center gap-3 p-2 ml-16 rounded hover:bg-slate-50`}>
                                <button
                                    onClick={() => onToggle?.(subtask.id)}
                                    className="flex-shrink-0"
                                >
                                    {subtask.is_done ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <Circle className="h-4 w-4 text-slate-300 hover:text-blue-500" />
                                    )}
                                </button>
                                <span className={`text-sm ${subtask.is_done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                    {subtask.name}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function TaskHierarchyTree({ tasks, onToggleTask }: TaskHierarchyTreeProps) {
    if (tasks.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No tasks yet. Create one to get started!</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {tasks.map((task) => (
                <TreeNode
                    key={task.id}
                    task={task}
                    level={0}
                    onToggle={onToggleTask}
                />
            ))}
        </div>
    );
}
