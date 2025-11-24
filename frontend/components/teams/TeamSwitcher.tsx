import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchTeams, setCurrentTeam, Team } from '../../store/slices/teamsSlice';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import CreateTeamDialog from './CreateTeamDialog';

export default function TeamSwitcher() {
    const dispatch = useAppDispatch();
    const { items: teams, currentTeam, status } = useAppSelector((state) => state.teams);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchTeams());
        }
    }, [status, dispatch]);

    const handleTeamChange = (teamId: string) => {
        const team = teams.find((t) => t.id === parseInt(teamId));
        if (team) {
            dispatch(setCurrentTeam(team));
        }
    };

    return (
        <div className="space-y-2 mb-6">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Team
            </label>
            <Select
                value={currentTeam?.id.toString() || ''}
                onValueChange={handleTeamChange}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                    {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <CreateTeamDialog />
        </div>
    );
}
