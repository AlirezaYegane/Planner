import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types';
import { FocusCard } from '@/components/ui/focus-card';

interface PolishedTaskCardProps {
    task: Task;
}

export default function PolishedTaskCard({ task }: PolishedTaskCardProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
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
                className="opacity-30"
            >
                <FocusCard
                    title={task.name}
                    description={task.description}
                    status={task.status === 'in_progress' ? 'in-progress' : task.status === 'done' ? 'done' : 'todo'}
                    priority={task.priority === 'urgent' ? 'high' : task.priority || 'medium'}
                    className="cursor-grabbing"
                />
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <FocusCard
                title={task.name}
                description={task.description}
                status={task.status === 'in_progress' ? 'in-progress' : task.status === 'done' ? 'done' : 'todo'}
                priority={task.priority === 'urgent' ? 'high' : task.priority || 'medium'}
                className="cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors"
            />
        </div>
    );
}
