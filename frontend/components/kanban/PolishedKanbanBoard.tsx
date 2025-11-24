'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    DropAnimation,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { fetchBoards, fetchBoard, createGroup } from '@/store/slices/boardsSlice';
import { fetchTasks } from '@/store/slices/tasksSlice';
import { Task, Group } from '@/lib/types';
import PolishedBoardColumn from './PolishedBoardColumn';
import PolishedTaskCard from './PolishedTaskCard';
import { FocusCard } from '@/components/ui/focus-card';
import { DopamineButton } from '@/components/ui/dopamine-button';
import { Plus, Layout, Settings2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function PolishedKanbanBoard() {
    const dispatch = useAppDispatch();
    const { items: boards, currentBoard, status: boardStatus } = useAppSelector((state) => state.boards);
    const { items: tasks } = useAppSelector((state) => state.tasks);

    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [activeGroup, setActiveGroup] = useState<Group | null>(null);
    const [newGroupName, setNewGroupName] = useState('');
    const [isNewGroupDialogOpen, setIsNewGroupDialogOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        dispatch(fetchBoards());
        dispatch(fetchTasks());
    }, [dispatch]);

    useEffect(() => {
        if (boards.length > 0 && !currentBoard) {
            dispatch(fetchBoard(boards[0].id));
        }
    }, [boards, currentBoard, dispatch]);

    const groups = useMemo(() => currentBoard?.groups || [], [currentBoard]);
    const groupIds = useMemo(() => groups.map((g) => g.id), [groups]);

    const tasksByGroup = useMemo(() => {
        const grouped: Record<number, Task[]> = {};
        groups.forEach(group => {
            grouped[group.id] = tasks.filter(task => task.group_id === group.id);
        });
        return grouped;
    }, [groups, tasks]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const activeData = active.data.current;

        if (activeData?.type === 'Task') {
            setActiveTask(activeData.task);
        } else if (activeData?.type === 'Column') {
            setActiveGroup(activeData.group);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        // Logic handled by dnd-kit, real-time updates would go here
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveTask(null);
        setActiveGroup(null);
        // Implementation for persisting changes would go here
    };

    const handleCreateGroup = async () => {
        if (!currentBoard || !newGroupName.trim()) return;
        try {
            await dispatch(createGroup({
                boardId: currentBoard.id,
                data: { name: newGroupName, order: groups.length }
            })).unwrap();
            setNewGroupName('');
            setIsNewGroupDialogOpen(false);
            dispatch(fetchBoard(currentBoard.id));
        } catch (error) {
            console.error('Failed to create group:', error);
        }
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: { opacity: '0.5' },
            },
        }),
    };

    if (boardStatus === 'loading' && !currentBoard) {
        return <div className="flex justify-center items-center h-64 text-slate-400">Loading board...</div>;
    }

    if (!currentBoard && boards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <p className="text-slate-500">No boards found.</p>
                <DopamineButton>Create First Board</DopamineButton>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-50/50 -m-6 p-6">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                        <Layout className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{currentBoard?.name || 'Board'}</h2>
                        <p className="text-sm text-slate-500">Drag cards to organize your flow</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <DopamineButton variant="ghost" size="icon">
                        <Settings2 className="h-5 w-5 text-slate-400" />
                    </DopamineButton>

                    <Dialog open={isNewGroupDialogOpen} onOpenChange={setIsNewGroupDialogOpen}>
                        <DialogTrigger asChild>
                            <DopamineButton>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Group
                            </DopamineButton>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Group</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Group Name</Label>
                                    <Input
                                        id="name"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        placeholder="e.g., To Do, In Progress"
                                    />
                                </div>
                                <DopamineButton onClick={handleCreateGroup} className="w-full">Create Group</DopamineButton>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                    <div className="flex h-full space-x-6 px-2">
                        <SortableContext items={groupIds} strategy={horizontalListSortingStrategy}>
                            {groups.map((group) => (
                                <PolishedBoardColumn
                                    key={group.id}
                                    group={group}
                                    tasks={tasksByGroup[group.id] || []}
                                />
                            ))}
                        </SortableContext>
                    </div>
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeTask ? (
                        <div className="w-[300px]">
                            <FocusCard
                                title={activeTask.name}
                                description={activeTask.description}
                                status={activeTask.status === 'in_progress' ? 'in-progress' : activeTask.status === 'done' ? 'done' : 'todo'}
                                priority={activeTask.priority === 'urgent' ? 'high' : activeTask.priority || 'medium'}
                            />
                        </div>
                    ) : activeGroup ? (
                        <PolishedBoardColumn group={activeGroup} tasks={tasksByGroup[activeGroup.id] || []} />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
