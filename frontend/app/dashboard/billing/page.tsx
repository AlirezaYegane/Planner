'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PricingCard from '@/components/billing/PricingCard';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

function BillingContent() {
    const [loading, setLoading] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Show success/cancel messages based on URL params
    React.useEffect(() => {
        if (searchParams.get('success')) {
            toast({
                title: "Subscription Successful!",
                description: "Thank you for subscribing to Pro.",
            });
        }
        if (searchParams.get('canceled')) {
            toast({
                title: "Subscription Canceled",
                description: "Your subscription process was canceled.",
                variant: "destructive",
            });
        }
    }, [searchParams, toast]);

    const handleSubscribe = async (planId: string) => {
        try {
            setLoading(planId);
            const response = await api.createCheckoutSession(planId);

            if (response.url) {
                window.location.href = response.url;
            }
        } catch (error) {
            console.error('Subscription error:', error);
            toast({
                title: "Error",
                description: "Failed to start subscription process.",
                variant: "destructive",
            });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PricingCard
                title="Free"
                price="$0"
                description="Essential features for individuals."
                features={[
                    "Unlimited Tasks",
                    "3 Boards",
                    "Basic Analytics",
                    "7-day History"
                ]}
                buttonText="Current Plan"
                onAction={() => { }}
                isLoading={false}
            />
            <PricingCard
                title="Pro"
                price="$9"
                description="Advanced features for power users."
                features={[
                    "Everything in Free",
                    "Unlimited Boards",
                    "Team Collaboration",
                    "Advanced Analytics",
                    "Unlimited History",
                    "Priority Support"
                ]}
                buttonText="Upgrade to Pro"
                isPopular={true}
                onAction={() => handleSubscribe('pro')}
                isLoading={loading === 'pro'}
            />
        </div>
    );
}

export default function BillingPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h1>
                <p className="text-gray-600">Choose the plan that works best for you.</p>
            </div>

            <Suspense fallback={<div className="flex justify-center p-8">Loading pricing plans...</div>}>
                <BillingContent />
            </Suspense>
        </div>
    );
}
