'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function VerifyEmailPage() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setError('Invalid or missing verification token');
                return;
            }

            try {
                await api.verifyEmail(token);
                setStatus('success');
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } catch (err: any) {
                setStatus('error');
                setError(err.response?.data?.detail || 'Failed to verify email. The link may have expired.');
            }
        };

        verifyEmail();
    }, [searchParams, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen w-full bg-[#F7F9FC] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_8px_32px_rgba(36,107,253,0.08)] p-12 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="animate-spin h-8 w-8 text-[#246BFD]" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-[#1A202C] mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Verifying Your Email
                    </h1>

                    <p className="text-[#718096] text-[15px]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Please wait while we verify your email address...
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen w-full bg-[#F7F9FC] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_8px_32px_rgba(36,107,253,0.08)] p-12 text-center">
                    {/* Success Icon */}
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-[#1A202C] mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Email Verified!
                    </h1>

                    <p className="text-[#718096] text-[15px] mb-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Your email has been successfully verified. You can now log in to your account.
                    </p>

                    <p className="text-[#A0AEC0] text-[13px]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Redirecting to login...
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    return (
        <div className="min-h-screen w-full bg-[#F7F9FC] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_8px_32px_rgba(36,107,253,0.08)] p-12 text-center">
                {/* Error Icon */}
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-[#1A202C] mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    Verification Failed
                </h1>

                <p className="text-[#718096] text-[15px] mb-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {error}
                </p>

                <div className="space-y-3">
                    <Link
                        href="/login"
                        className="inline-block w-full bg-gradient-to-r from-[#246BFD] to-[#1E4DD8] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg shadow-[#246BFD]/20 hover:shadow-xl hover:shadow-[#246BFD]/30"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                        Go to Login
                    </Link>

                    <Link
                        href="/signup"
                        className="inline-block w-full text-[#246BFD] hover:text-[#1E4DD8] font-medium transition-colors py-3"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                        Create New Account
                    </Link>
                </div>
            </div>
        </div>
    );
}
