import React from 'react';
import { Task } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Step3PrioritizeProps {
    selectedTasks: Task[];
    setSelectedTasks: (tasks: Task[]) => void;
}

export default function Step3Prioritize({ selectedTasks, setSelectedTasks }: Step3PrioritizeProps) {

    const handlePriorityChange = (taskId: number, priority: 'low' | 'medium' | 'high' | 'urgent') => {
        const updatedTasks = selectedTasks.map(task =>
            task.id === taskId ? { ...task, priority } : task
        );
        setSelectedTasks(updatedTasks);
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Prioritize Tasks</h3>
                <p className="text-sm text-muted-foreground">
                    Set the priority for your selected tasks.
                </p>
            </div>

            <ScrollArea className="flex-1 border rounded-md p-4 h-[300px]">
                {selectedTasks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No tasks selected.</p>
                ) : (
                    <div className="space-y-4">
                        {selectedTasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                                <span className="font-medium truncate mr-4">{task.name}</span>
                                <Select
                                    value={task.priority}
                                    onValueChange={(value) => handlePriorityChange(task.id, value as 'low' | 'medium' | 'high' | 'urgent')}
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
