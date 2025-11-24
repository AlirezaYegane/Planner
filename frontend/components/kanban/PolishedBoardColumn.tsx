import React, { useMemo } from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, Group } from '@/lib/types';
import PolishedTaskCard from './PolishedTaskCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DopamineButton } from '@/components/ui/dopamine-button';
import { Plus, MoreHorizontal } from 'lucide-react';

interface PolishedBoardColumnProps {
    group: Group;
    tasks: Task[];
}

export default function PolishedBoardColumn({ group, tasks }: PolishedBoardColumnProps) {
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
                className="bg-slate-100/50 border-2 border-dashed border-slate-300 w-[320px] h-[600px] rounded-2xl flex-shrink-0"
            />
        );
    }

    return (
        <div ref={setNodeRef} style={style} className="w-[320px] flex-shrink-0 flex flex-col h-full max-h-full">
            <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 h-full flex flex-col shadow-sm">
                {/* Column Header */}
                <div
                    className="p-4 flex items-center justify-between cursor-grab active:cursor-grabbing"
                    {...attributes}
                    {...listeners}
                >
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <h3 className="font-bold text-slate-700">{group.name}</h3>
                        <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                            {tasks.length}
                        </span>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600">
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>

                {/* Tasks Area */}
                <div className="flex-1 p-3 min-h-0 overflow-y-auto">
                    <div className="flex flex-col gap-3">
                        <SortableContext items={taskIds}>
                            {tasks.map((task) => (
                                <PolishedTaskCard key={task.id} task={task} />
                            ))}
                        </SortableContext>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-3 pt-0">
                    <DopamineButton
                        variant="ghost"
                        className="w-full justify-start text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                    </DopamineButton>
                </div>
            </div>
        </div>
    );
}
