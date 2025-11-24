import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

interface PricingCardProps {
    title: string;
    price: string;
    description: string;
    features: string[];
    buttonText: string;
    isPopular?: boolean;
    onAction: () => void;
    isLoading?: boolean;
}

export default function PricingCard({
    title,
    price,
    description,
    features,
    buttonText,
    isPopular,
    onAction,
    isLoading
}: PricingCardProps) {
    return (
        <Card className={`flex flex-col ${isPopular ? 'border-blue-500 shadow-lg scale-105' : ''}`}>
            <CardHeader>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="mb-6">
                    <span className="text-4xl font-bold">{price}</span>
                    <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-3">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    variant={(isPopular ? 'default' : 'outline') as "default" | "outline"}
                    onClick={onAction}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : buttonText}
                </Button>
            </CardFooter>
        </Card>
    );
}
