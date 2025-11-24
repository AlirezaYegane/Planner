import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plan } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TimeDistributionChartProps {
    plans: Plan[];
}

export default function TimeDistributionChart({ plans }: TimeDistributionChartProps) {
    // Calculate average time distribution
    const totalPlans = plans.length;

    if (totalPlans === 0) {
        return (
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Time Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No plan data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    const totals = plans.reduce((acc, plan) => ({
        sleep: acc.sleep + (plan.sleep_time || 0),
        work: acc.work + (plan.work_time || 0),
        commute: acc.commute + (plan.commute_time || 0),
    }), { sleep: 0, work: 0, commute: 0 });

    const averages = {
        sleep: totals.sleep / totalPlans,
        work: totals.work / totalPlans,
        commute: totals.commute / totalPlans,
    };

    const freeTime = 24 - (averages.sleep + averages.work + averages.commute);

    const data = [
        { name: 'Sleep', value: parseFloat(averages.sleep.toFixed(1)) },
        { name: 'Work', value: parseFloat(averages.work.toFixed(1)) },
        { name: 'Commute', value: parseFloat(averages.commute.toFixed(1)) },
        { name: 'Free Time', value: parseFloat(Math.max(0, freeTime).toFixed(1)) },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Average Daily Time Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => [`${value} hours`, 'Average Time']}
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
