'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.forgotPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
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
                        Check Your Email
                    </h1>

                    <p className="text-[#718096] text-[15px] mb-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        If an account exists with <strong>{email}</strong>, you'll receive password reset instructions shortly.
                    </p>

                    <Link
                        href="/login"
                        className="inline-block bg-gradient-to-r from-[#246BFD] to-[#1E4DD8] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg shadow-[#246BFD]/20 hover:shadow-xl hover:shadow-[#246BFD]/30"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#F7F9FC] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_8px_32px_rgba(36,107,253,0.08)] p-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-[32px] font-bold text-[#1A202C] mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Forgot Password?
                    </h1>
                    <p className="text-[#718096] text-[15px]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        No worries! Enter your email and we'll send you reset instructions.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div>
                        <label className="block text-[#4A5568] text-[13px] font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-lg text-[#2D3748] placeholder-[#A0AEC0] focus:outline-none focus:border-[#246BFD] focus:ring-2 focus:ring-[#246BFD]/10 transition-all"
                            placeholder="Enter your email"
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#246BFD] to-[#1E4DD8] hover:from-[#1E4DD8] hover:to-[#246BFD] text-white font-semibold py-3.5 rounded-lg transition-all duration-200 shadow-lg shadow-[#246BFD]/20 hover:shadow-xl hover:shadow-[#246BFD]/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                            </span>
                        ) : 'Send Reset Link'}
                    </button>

                    {/* Back to login */}
                    <div className="text-center pt-2">
                        <Link href="/login" className="text-[13px] text-[#246BFD] hover:text-[#1E4DD8] font-medium transition-colors" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                            ← Back to login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
