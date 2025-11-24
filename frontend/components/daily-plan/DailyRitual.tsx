import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DopamineButton } from '../ui/dopamine-button';
import { FocusCard } from '../ui/focus-card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Sun, Brain, Target, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const STEPS = [
    { id: 'reflection', title: 'Morning Reflection', icon: Sun },
    { id: 'braindump', title: 'Brain Dump', icon: Brain },
    { id: 'selection', title: 'Top 3 Focus', icon: Target },
    { id: 'ready', title: 'Ready to Flow', icon: CheckCircle2 },
];

export default function DailyRitual() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [mood, setMood] = useState<string | null>(null);
    const [brainDump, setBrainDump] = useState('');
    const [topTasks, setTopTasks] = useState(['', '', '']);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            // Finish
            router.push('/dashboard');
        }
    };

    const StepIcon = STEPS[currentStep].icon;

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* Progress Header */}
            <div className="flex justify-between items-center mb-12">
                {STEPS.map((step, idx) => (
                    <div key={step.id} className="flex flex-col items-center gap-2">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${idx <= currentStep ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                            <step.icon className="h-5 w-5" />
                        </div>
                        <span className={`text-xs font-medium ${idx <= currentStep ? 'text-blue-600' : 'text-slate-400'
                            }`}>{step.title}</span>
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 min-h-[400px] flex flex-col"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <StepIcon className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">{STEPS[currentStep].title}</h2>
                    </div>

                    <div className="flex-1">
                        {currentStep === 0 && (
                            <div className="space-y-6">
                                <p className="text-lg text-slate-600">How are you feeling today? Be honest.</p>
                                <div className="grid grid-cols-3 gap-4">
                                    {['⚡ Energetic', '😌 Calm', '🤯 Overwhelmed', '😴 Tired', '😤 Frustrated', '🧘 Focused'].map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setMood(m)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${mood === m
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <p className="text-lg text-slate-600">Get everything out of your head. Don't worry about order.</p>
                                <textarea
                                    value={brainDump}
                                    onChange={(e) => setBrainDump(e.target.value)}
                                    className="w-full h-48 p-4 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-slate-50"
                                    placeholder="- Email Sarah&#10;- Fix the bug&#10;- Buy groceries..."
                                />
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <p className="text-lg text-slate-600">Pick your absolute top 3 priorities.</p>
                                {topTasks.map((task, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                            {i + 1}
                                        </div>
                                        <Input
                                            value={task}
                                            onChange={(e) => {
                                                const newTasks = [...topTasks];
                                                newTasks[i] = e.target.value;
                                                setTopTasks(newTasks);
                                            }}
                                            placeholder={`Priority #${i + 1}`}
                                            className="h-12 text-lg"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="text-center space-y-6 py-8">
                                <div className="inline-block p-6 bg-teal-50 rounded-full text-teal-600 mb-4">
                                    <CheckCircle2 className="h-16 w-16" />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-800">You're all set!</h3>
                                <p className="text-slate-600 max-w-md mx-auto">
                                    Your plan is locked in. Focus on one thing at a time. You've got this.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-end">
                        <DopamineButton
                            size="lg"
                            onClick={handleNext}
                            className="w-full md:w-auto px-8"
                        >
                            {currentStep === STEPS.length - 1 ? "Start My Day" : (
                                <span className="flex items-center gap-2">
                                    Next Step <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </DopamineButton>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
