import React from 'react';
import { Task } from '../../../lib/types';
import { format } from 'date-fns';
import { Card, CardContent } from '../../ui/card';

interface TimeBlocks {
    sleep: number;
    work: number;
    commute: number;
}

interface Step5ReviewProps {
    date: Date;
    selectedTasks: Task[];
    timeBlocks: TimeBlocks;
}

export default function Step5Review({ date, selectedTasks, timeBlocks }: Step5ReviewProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Review Your Plan</h3>
                <p className="text-sm text-muted-foreground">
                    Review your daily plan before saving.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardContent className="pt-6">
                        <h4 className="font-medium mb-2">Date</h4>
                        <p className="text-2xl font-bold">{format(date, 'MMMM do, yyyy')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <h4 className="font-medium mb-2">Time Allocation</h4>
                        <ul className="space-y-1 text-sm">
                            <li className="flex justify-between">
                                <span>Sleep:</span>
                                <span className="font-medium">{timeBlocks.sleep}h</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Work:</span>
                                <span className="font-medium">{timeBlocks.work}h</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Commute:</span>
                                <span className="font-medium">{timeBlocks.commute}h</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-3">
                <h4 className="font-medium">Selected Tasks ({selectedTasks.length})</h4>
                <div className="border rounded-md divide-y">
                    {selectedTasks.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">No tasks selected</div>
                    ) : (
                        selectedTasks.map((task) => (
                            <div key={task.id} className="p-3 flex justify-between items-center text-sm">
                                <span>{task.name}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs capitalize
                  ${task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                        task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                            task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                    {task.priority}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
