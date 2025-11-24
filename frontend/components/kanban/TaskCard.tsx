import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TaskCardProps {
    task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
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
                className="opacity-30 bg-accent/50 border-2 border-primary/50 rounded-lg h-[100px]"
            />
        );
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors">
                <CardHeader className="p-3 pb-0">
                    <div className="flex justify-between items-start gap-2">
                        <span className="font-medium text-sm line-clamp-2">{task.name}</span>
                    </div>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                    <div className="flex justify-between items-center mt-2">
                        <Badge variant={
                            task.priority === 'urgent' ? 'destructive' :
                                task.priority === 'high' ? 'default' :
                                    task.priority === 'medium' ? 'secondary' : 'outline'
                        } className="text-[10px] px-1.5 py-0 h-5">
                            {task.priority}
                        </Badge>
                        {task.date && (
                            <span className="text-[10px] text-muted-foreground">
                                {new Date(task.date).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
