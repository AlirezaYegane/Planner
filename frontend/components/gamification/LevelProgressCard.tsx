import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';

interface LevelProgressCardProps {
    level: number;
    current_xp: number;
    xp_to_next_level: number;
    total_tasks: number;
    total_focus_time: number;
}

export default function LevelProgressCard({
    level,
    current_xp,
    xp_to_next_level,
    total_tasks,
    total_focus_time
}: LevelProgressCardProps) {
    const progress = (current_xp / (current_xp + xp_to_next_level)) * 100;
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-3xl shadow-xl text-white">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-6 w-6 text-yellow-300" />
                        <h3 className="text-2xl font-bold">Level {level}</h3>
                    </div>
                    <p className="text-blue-100 text-sm">Keep crushing it!</p>
                </div>
                <div className="relative">
                    <svg className="w-36 h-36 transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="72"
                            cy="72"
                            r={radius}
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="12"
                            fill="none"
                        />
                        {/* Progress circle */}
                        <motion.circle
                            cx="72"
                            cy="72"
                            r={radius}
                            stroke="rgba(255,255,255,0.9)"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold">{Math.round(progress)}%</div>
                        <div className="text-xs text-blue-100">to Level {level + 1}</div>
                    </div>
                </div>
            </div>

            {/* XP Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-blue-100">XP Progress</span>
                    <span className="font-semibold">{current_xp.toLocaleString()} / {(current_xp + xp_to_next_level).toLocaleString()}</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
                <p className="text-xs text-blue-100">{xp_to_next_level.toLocaleString()} XP remaining</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20">
                <div>
                    <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
                        <Zap className="h-4 w-4" />
                        <span>Tasks Completed</span>
                    </div>
                    <div className="text-3xl font-bold">{total_tasks}</div>
                </div>
                <div>
                    <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
                        <Zap className="h-4 w-4" />
                        <span>Focus Time</span>
                    </div>
                    <div className="text-3xl font-bold">{Math.floor(total_focus_time / 60)}h</div>
                    <div className="text-xs text-blue-100">{total_focus_time % 60}min</div>
                </div>
            </div>
        </div>
    );
}
