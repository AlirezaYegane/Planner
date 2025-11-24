import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface TimeBlocks {
    sleep: number;
    work: number;
    commute: number;
}

interface Step4TimeBlockProps {
    timeBlocks: TimeBlocks;
    setTimeBlocks: (blocks: TimeBlocks) => void;
}

export default function Step4TimeBlock({ timeBlocks, setTimeBlocks }: Step4TimeBlockProps) {

    const handleChange = (key: keyof TimeBlocks, value: number) => {
        setTimeBlocks({
            ...timeBlocks,
            [key]: value,
        });
    };

    const totalHours = timeBlocks.sleep + timeBlocks.work + timeBlocks.commute;
    const remainingHours = 24 - totalHours;

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Time Blocking</h3>
                <p className="text-sm text-muted-foreground">
                    Allocate time for your main activities.
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <Label>Sleep ({timeBlocks.sleep} hours)</Label>
                    </div>
                    <Slider
                        value={[timeBlocks.sleep]}
                        min={0}
                        max={12}
                        step={0.5}
                        onValueChange={(vals: number[]) => handleChange('sleep', vals[0])}
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <Label>Work ({timeBlocks.work} hours)</Label>
                    </div>
                    <Slider
                        value={[timeBlocks.work]}
                        min={0}
                        max={16}
                        step={0.5}
                        onValueChange={(vals: number[]) => handleChange('work', vals[0])}
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <Label>Commute ({timeBlocks.commute} hours)</Label>
                    </div>
                    <Slider
                        value={[timeBlocks.commute]}
                        min={0}
                        max={6}
                        step={0.5}
                        onValueChange={(vals: number[]) => handleChange('commute', vals[0])}
                    />
                </div>

                <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Remaining Free Time:</span>
                        <span className={`text-lg font-bold ${remainingHours < 0 ? 'text-destructive' : 'text-primary'}`}>
                            {remainingHours} hours
                        </span>
                    </div>
                    {remainingHours < 0 && (
                        <p className="text-xs text-destructive mt-1">
                            You have allocated more than 24 hours! Please adjust.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
