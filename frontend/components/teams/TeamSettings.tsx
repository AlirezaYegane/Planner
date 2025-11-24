import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { addTeamMember } from '../../store/slices/teamsSlice';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../ui/use-toast';
import PermissionGuard from '../auth/PermissionGuard';
import { UserPlus, Trash2, Shield } from 'lucide-react';

export default function TeamSettings() {
    const dispatch = useAppDispatch();
    const { currentTeam } = useAppSelector((state) => state.teams);
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [isLoading, setIsLoading] = useState(false);

    if (!currentTeam) return null;

    const handleInvite = async () => {
        if (!email) return;
        setIsLoading(true);
        try {
            await dispatch(addTeamMember({
                teamId: currentTeam.id,
                email,
                role
            })).unwrap();

            toast({
                title: "Member added",
                description: `${email} has been added to the team.`,
            });
            setEmail('');
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to add member",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-2">Team Settings</h2>
                <p className="text-gray-500">Manage your team members and permissions.</p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Members</h3>
                    <PermissionGuard requiredRole="ADMIN">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add Member
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Team Member</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <Input
                                            placeholder="colleague@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Role</label>
                                        <Select value={role} onValueChange={setRole}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="member">Member</SelectItem>
                                                <SelectItem value="viewer">Viewer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={handleInvite}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Adding..." : "Add Member"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </PermissionGuard>
                </div>

                <div className="border rounded-lg divide-y">
                    {currentTeam.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4">
                            <div className="flex items-center space-x-4">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <span className="font-medium text-gray-600">
                                        {member.user_email[0].toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium">{member.user_email}</p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Shield className="h-3 w-3 mr-1" />
                                        <span className="capitalize">{member.role}</span>
                                    </div>
                                </div>
                            </div>

                            <PermissionGuard requiredRole="OWNER">
                                {member.role !== 'owner' && (
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </PermissionGuard>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
