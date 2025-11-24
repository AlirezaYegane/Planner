import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { format } from 'date-fns';

interface Step1InitProps {
    date: Date;
    setDate: (date: Date) => void;
}

export default function Step1Init({ date, setDate }: Step1InitProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Let's start planning your day</h3>
                <p className="text-sm text-muted-foreground">
                    Select the date you want to plan for. Usually, this is today or tomorrow.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                    id="date"
                    type="date"
                    value={format(date, 'yyyy-MM-dd')}
                    onChange={(e) => setDate(new Date(e.target.value))}
                    className="w-full max-w-xs"
                />
            </div>
        </div>
    );
}
