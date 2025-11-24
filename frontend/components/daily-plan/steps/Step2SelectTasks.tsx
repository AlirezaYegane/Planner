import React from 'react';
import { useAppSelector } from '../../../store/store';
import { Task } from '../../../lib/types';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import { ScrollArea } from '../../ui/scroll-area';

interface Step2SelectTasksProps {
    selectedTasks: Task[];
    setSelectedTasks: (tasks: Task[]) => void;
}

export default function Step2SelectTasks({ selectedTasks, setSelectedTasks }: Step2SelectTasksProps) {
    const tasks = useAppSelector((state) => state.tasks.items);
    // Filter for backlog tasks (tasks without a date or status not done)
    const backlogTasks = tasks.filter(task => !task.date && task.status !== 'done');

    const handleToggleTask = (task: Task) => {
        if (selectedTasks.find(t => t.id === task.id)) {
            setSelectedTasks(selectedTasks.filter(t => t.id !== task.id));
        } else {
            setSelectedTasks([...selectedTasks, task]);
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Select Tasks</h3>
                <p className="text-sm text-muted-foreground">
                    Choose tasks from your backlog to work on today.
                </p>
            </div>

            <ScrollArea className="flex-1 border rounded-md p-4 h-[300px]">
                {backlogTasks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No backlog tasks found.</p>
                ) : (
                    <div className="space-y-4">
                        {backlogTasks.map((task) => (
                            <div key={task.id} className="flex items-start space-x-3 p-2 hover:bg-accent rounded-md transition-colors">
                                <Checkbox
                                    id={`task-${task.id}`}
                                    checked={!!selectedTasks.find(t => t.id === task.id)}
                                    onCheckedChange={() => handleToggleTask(task)}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label
                                        htmlFor={`task-${task.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {task.name}
                                    </Label>
                                    {task.description && (
                                        <p className="text-xs text-muted-foreground">
                                            {task.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <div className="text-sm text-muted-foreground text-right">
                {selectedTasks.length} tasks selected
            </div>
        </div>
    );
}
