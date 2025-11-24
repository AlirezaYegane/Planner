import React, { useState } from 'react';
import { useAppDispatch } from '../../store/store';
import { createTeam } from '../../store/slices/teamsSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus } from 'lucide-react';

export default function CreateTeamDialog() {
    const dispatch = useAppDispatch();
    const [name, setName] = useState('');
    const [open, setOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            await dispatch(createTeam(name)).unwrap();
            setName('');
            setOpen(false);
        } catch (error) {
            console.error('Failed to create team:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Team
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Team Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Engineering, Marketing"
                        />
                    </div>
                    <Button type="submit" className="w-full">Create Team</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
