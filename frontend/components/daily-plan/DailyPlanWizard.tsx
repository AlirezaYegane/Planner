'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { createPlan, fetchPlanByDate } from '../../store/slices/plansSlice';
import { fetchTasks } from '../../store/slices/tasksSlice';
import { format } from 'date-fns';
import Step1Init from './steps/Step1Init';
import Step2SelectTasks from './steps/Step2SelectTasks';
import Step3Prioritize from './steps/Step3Prioritize';
import Step4TimeBlock from './steps/Step4TimeBlock';
import Step5Review from './steps/Step5Review';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../ui/use-toast';
import { Task } from '../../lib/types';

const steps = ['Date Selection', 'Select Tasks', 'Prioritize', 'Time Blocking', 'Review'];

export default function DailyPlanWizard() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [date, setDate] = useState<Date>(new Date());
    const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
    const [timeBlocks, setTimeBlocks] = useState({
        sleep: 8,
        work: 8,
        commute: 1,
    });

    // Fetch tasks on mount
    useEffect(() => {
        dispatch(fetchTasks());
    }, [dispatch]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSave = async () => {
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');
            await dispatch(createPlan({
                date: formattedDate,
                sleep_time: timeBlocks.sleep,
                work_time: timeBlocks.work,
                commute_time: timeBlocks.commute,
            })).unwrap();

            // Update tasks with the plan date
            // Note: In a real app, we might want to do this in a batch or let the backend handle it
            // For now, we'll just rely on the plan creation

            toast({
                title: "Plan created!",
                description: "Your daily plan has been successfully saved.",
            });

            router.push('/dashboard');
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create plan",
                variant: "destructive",
            });
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return <Step1Init date={date} setDate={setDate} />;
            case 1:
                return <Step2SelectTasks selectedTasks={selectedTasks} setSelectedTasks={setSelectedTasks} />;
            case 2:
                return <Step3Prioritize selectedTasks={selectedTasks} setSelectedTasks={setSelectedTasks} />;
            case 3:
                return <Step4TimeBlock timeBlocks={timeBlocks} setTimeBlocks={setTimeBlocks} />;
            case 4:
                return <Step5Review date={date} selectedTasks={selectedTasks} timeBlocks={timeBlocks} />;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Daily Planning - {steps[currentStep]}</CardTitle>
                    <div className="flex space-x-2 mt-4">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className={`h-2 flex-1 rounded-full ${index <= currentStep ? 'bg-primary' : 'bg-secondary'
                                    }`}
                            />
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="min-h-[400px] py-6">
                    {renderStep()}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                    >
                        Back
                    </Button>
                    {currentStep === steps.length - 1 ? (
                        <Button onClick={handleSave}>Save Plan</Button>
                    ) : (
                        <Button onClick={handleNext}>Next</Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
