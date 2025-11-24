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
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchBoards, fetchBoard, createGroup } from '../../store/slices/boardsSlice';
import { fetchTasks, updateTask } from '../../store/slices/tasksSlice';
import { Task, Group, Board } from '../../lib/types';
import BoardColumn from './BoardColumn';
import TaskCard from './TaskCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function KanbanBoard() {
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
                distance: 5, // Require 5px movement to start drag
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
            // Select the first board by default if none selected
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
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';
        const isOverColumn = over.data.current?.type === 'Column';

        if (!isActiveTask) return;

        // Implements drag over logic for tasks
        // In a real app with local state optimization, we would update the local state here
        // to show the task moving in real-time before the API call
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveTask(null);
        setActiveGroup(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const isActiveTask = active.data.current?.type === 'Task';

        if (isActiveTask) {
            const activeTask = active.data.current?.task as Task;

            // Find the destination group
            let destinationGroupId: number | undefined;

            if (over.data.current?.type === 'Column') {
                destinationGroupId = over.data.current.group.id;
            } else if (over.data.current?.type === 'Task') {
                destinationGroupId = over.data.current.task.group_id;
            }
        }
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
            dispatch(fetchBoard(currentBoard.id)); // Refresh board
        } catch (error) {
            console.error('Failed to create group:', error);
        }
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    if (boardStatus === 'loading' && !currentBoard) {
        return <div className="flex justify-center items-center h-64">Loading board...</div>;
    }

    if (!currentBoard && boards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <p className="text-muted-foreground">No boards found.</p>
                <Button>Create First Board</Button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{currentBoard?.name || 'Board'}</h2>
                <Dialog open={isNewGroupDialogOpen} onOpenChange={setIsNewGroupDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Group
                        </Button>
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
                            <Button onClick={handleCreateGroup} className="w-full">Create Group</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div className="flex h-full space-x-4 pb-4">
                        <SortableContext items={groupIds} strategy={horizontalListSortingStrategy}>
                            {groups.map((group) => (
                                <BoardColumn
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
                        <TaskCard task={activeTask} />
                    ) : activeGroup ? (
                        <BoardColumn group={activeGroup} tasks={tasksByGroup[activeGroup.id] || []} />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
