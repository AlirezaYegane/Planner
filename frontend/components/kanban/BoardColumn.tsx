import React, { useMemo } from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, Group } from '@/lib/types';
import TaskCard from './TaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BoardColumnProps {
    group: Group;
    tasks: Task[];
}

export default function BoardColumn({ group, tasks }: BoardColumnProps) {
    const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: group.id,
        data: {
            type: 'Column',
            group,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-accent/50 opacity-30 border-2 border-primary/50 w-[300px] h-[500px] rounded-lg flex-shrink-0"
            />
        );
    }

    return (
        <div ref={setNodeRef} style={style} className="w-[300px] flex-shrink-0 flex flex-col h-full max-h-full">
            <Card className="h-full flex flex-col bg-secondary/20">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
                    <CardTitle className="text-sm font-medium">
                        {group.name}
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                            {tasks.length}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-2 flex-1 flex flex-col min-h-0">
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col gap-2 p-1">
                            <SortableContext items={taskIds}>
                                {tasks.map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </SortableContext>
                        </div>
                    </ScrollArea>
                    <Button variant="ghost" className="w-full mt-2 justify-start text-muted-foreground hover:text-foreground">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
