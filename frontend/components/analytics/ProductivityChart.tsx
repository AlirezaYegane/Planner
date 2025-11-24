import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';

interface ProductivityChartProps {
    tasks: Task[];
}

export default function ProductivityChart({ tasks }: ProductivityChartProps) {
    // Generate data for the last 14 days
    const today = new Date();
    const startDate = subDays(today, 13);

    const days = eachDayOfInterval({ start: startDate, end: today });

    const data = days.map(day => {
        const completedCount = tasks.filter(t =>
            t.status === 'done' &&
            t.updated_at &&
            isSameDay(new Date(t.updated_at), day)
        ).length;

        const createdCount = tasks.filter(t =>
            isSameDay(new Date(t.created_at), day)
        ).length;

        return {
            date: format(day, 'MMM dd'),
            completed: completedCount,
            created: createdCount,
        };
    });

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Productivity Trends</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="completed"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={false}
                                name="Completed Tasks"
                            />
                            <Line
                                type="monotone"
                                dataKey="created"
                                stroke="hsl(var(--muted-foreground))"
                                strokeWidth={2}
                                dot={false}
                                name="New Tasks"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
