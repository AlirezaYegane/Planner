'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAppSelector } from '@/store/store';
import { OAuthButton } from '@/components/auth/OAuthButton';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldValidation, setFieldValidation] = useState({
        name: false,
        email: false,
        mobile: false,
        password: false
    });
    const { isAuthenticated, loading: authLoading } = useAppSelector((state) => state.user);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, authLoading, router]);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return 0;
        if (password.length < 6) return 1;
        if (password.length < 10) return 2;
        if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 3;
        return 2;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.signup({
                email: formData.email,
                password: formData.password,
                full_name: formData.name
            });
            // Auto-login after signup
            const token = await api.login({
                email: formData.email,
                password: formData.password
            });
            if (token?.access_token) {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/google`;
    };

    const handleAppleLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/apple`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Real-time validation
        let isValid = false;
        switch (name) {
            case 'name':
                isValid = value.trim().length >= 2;
                break;
            case 'email':
                isValid = validateEmail(value);
                break;
            case 'mobile':
                isValid = value.trim().length >= 10;
                break;
            case 'password':
                isValid = value.length >= 6;
                break;
        }

        setFieldValidation(prev => ({
            ...prev,
            [name]: isValid
        }));
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <div className="min-h-screen w-full bg-[#F7F9FC] flex items-center justify-center p-4 md:p-8">
            {/* Main Card Container */}
            <div className="w-full max-w-[940px] bg-white rounded-[24px] shadow-[0_8px_32px_rgba(36,107,253,0.08)] overflow-hidden flex flex-col md:flex-row">

                {/* LEFT PANEL - Form Area */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="max-w-[360px] mx-auto w-full">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-[28px] md:text-[32px] font-bold text-[#1A202C] mb-2 leading-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                Create an account
                            </h1>
                            <p className="text-[#718096] text-[15px]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                Let's get started with your 30-day free trial.
                            </p>
                            {/* Trust Badge */}
                            <div className="flex items-center gap-2 mt-3">
                                <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="text-[12px] text-[#718096]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    No credit card required
                                </span>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 animate-shake">
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name Field */}
                            <div>
                                <label className="block text-[#4A5568] text-[13px] font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    Name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-[#2D3748] placeholder-[#A0AEC0] focus:outline-none focus:border-[#246BFD] focus:ring-2 focus:ring-[#246BFD]/10 transition-all ${formData.name && (fieldValidation.name ? 'border-[#10B981] pr-12' : 'border-[#E2E8F0]')
                                            } ${!formData.name && 'border-[#E2E8F0]'}`}
                                        placeholder="Enter your name"
                                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                                    />
                                    {formData.name && fieldValidation.name && (
                                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#10B981] animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-[#4A5568] text-[13px] font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    Email
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-[#2D3748] placeholder-[#A0AEC0] focus:outline-none focus:border-[#246BFD] focus:ring-2 focus:ring-[#246BFD]/10 transition-all ${formData.email && (fieldValidation.email ? 'border-[#10B981] pr-12' : 'border-[#E2E8F0]')
                                            } ${!formData.email && 'border-[#E2E8F0]'}`}
                                        placeholder="Enter your email"
                                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                                    />
                                    {formData.email && fieldValidation.email && (
                                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#10B981] animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Mobile Field */}
                            <div>
                                <label className="block text-[#4A5568] text-[13px] font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    Mobile
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-[#2D3748] placeholder-[#A0AEC0] focus:outline-none focus:border-[#246BFD] focus:ring-2 focus:ring-[#246BFD]/10 transition-all ${formData.mobile && (fieldValidation.mobile ? 'border-[#10B981] pr-12' : 'border-[#E2E8F0]')
                                            } ${!formData.mobile && 'border-[#E2E8F0]'}`}
                                        placeholder="Enter your mobile"
                                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                                    />
                                    {formData.mobile && fieldValidation.mobile && (
                                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#10B981] animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-[#4A5568] text-[13px] font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-[#2D3748] placeholder-[#A0AEC0] focus:outline-none focus:border-[#246BFD] focus:ring-2 focus:ring-[#246BFD]/10 transition-all ${formData.password && (fieldValidation.password ? 'border-[#10B981] pr-12' : 'border-[#E2E8F0]')
                                            } ${!formData.password && 'border-[#E2E8F0]'}`}
                                        placeholder="Enter your password"
                                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                                    />
                                    {formData.password && fieldValidation.password && (
                                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#10B981] animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1.5 mb-1">
                                            <div className={`h-1 flex-1 rounded-full transition-all ${passwordStrength >= 1 ? (passwordStrength === 1 ? 'bg-red-400' : passwordStrength === 2 ? 'bg-yellow-400' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                                            <div className={`h-1 flex-1 rounded-full transition-all ${passwordStrength >= 2 ? (passwordStrength === 2 ? 'bg-yellow-400' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                                            <div className={`h-1 flex-1 rounded-full transition-all ${passwordStrength >= 3 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                        </div>
                                        <p className="text-[11px] text-[#718096]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                            {passwordStrength === 1 && 'Weak password'}
                                            {passwordStrength === 2 && 'Good password'}
                                            {passwordStrength === 3 && 'Strong password'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Create Account Button */}
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
                                        Creating account...
                                    </span>
                                ) : 'Create account'}
                            </button>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[#E2E8F0]"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-[#718096]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Or continue with</span>
                                </div>
                            </div>

                            {/* OAuth Buttons */}
                            <div className="space-y-3">
                                <OAuthButton provider="google" onClick={handleGoogleLogin} />
                                <OAuthButton provider="apple" onClick={handleAppleLogin} />
                            </div>

                            {/* Already have account link */}
                            <div className="text-center pt-4 border-t border-gray-100">
                                <p className="text-[13px] text-[#718096]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-[#246BFD] hover:text-[#1E4DD8] font-semibold transition-colors">
                                        Log in instead
                                    </Link>
                                </p>
                            </div>

                            {/* Footer Attribution */}
                            <div className="pt-3 text-center">
                                <p className="text-[11px] text-[#A0AEC0]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    Designed by <span className="font-medium text-[#718096]">Alireza Yegane</span>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>


                {/* RIGHT PANEL - Premium Rocket Launch Animation */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-[#246BFD] via-[#1E4DD8] to-[#1956C7] relative overflow-hidden min-h-[400px] md:min-h-full flex items-center justify-center p-8">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
                    </div>

                    {/* Main Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center">
                        {/* Rocket Launch Animation */}
                        <div className="relative mb-12">
                            {/* Rocket SVG */}
                            <svg className="w-40 h-40 animate-rocket-launch" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Rocket Body */}
                                <g className="rocket-body">
                                    {/* Main Body */}
                                    <path d="M85 80 L85 140 L100 155 L115 140 L115 80 Q100 50 85 80Z" fill="white" stroke="white" strokeWidth="2" />

                                    {/* Window */}
                                    <circle cx="100" cy="90" r="12" fill="#246BFD" opacity="0.3" />
                                    <circle cx="100" cy="90" r="8" fill="#246BFD" opacity="0.5" />

                                    {/* Wings */}
                                    <path d="M85 120 L60 145 L85 140 Z" fill="white" opacity="0.9" />
                                    <path d="M115 120 L140 145 L115 140 Z" fill="white" opacity="0.9" />

                                    {/* Top Cone */}
                                    <path d="M85 80 Q100 45 115 80" fill="white" stroke="white" strokeWidth="2" />
                                    <path d="M85 80 Q100 55 115 80" fill="#246BFD" opacity="0.2" />
                                </g>

                                {/* Fire/Exhaust */}
                                <g className="rocket-fire">
                                    <path d="M90 155 Q100 175 110 155" fill="#FFD700" opacity="0.8" className="animate-fire-1" />
                                    <path d="M92 155 Q100 170 108 155" fill="#FFA500" opacity="0.7" className="animate-fire-2" />
                                    <path d="M95 155 Q100 165 105 155" fill="#FF6B6B" opacity="0.6" className="animate-fire-3" />
                                </g>

                                {/* Stars */}
                                <g className="stars">
                                    <circle cx="40" cy="40" r="2" fill="white" className="animate-twinkle" style={{ animationDelay: '0s' }} />
                                    <circle cx="160" cy="50" r="2" fill="white" className="animate-twinkle" style={{ animationDelay: '0.5s' }} />
                                    <circle cx="30" cy="90" r="1.5" fill="white" className="animate-twinkle" style={{ animationDelay: '1s' }} />
                                    <circle cx="170" cy="100" r="1.5" fill="white" className="animate-twinkle" style={{ animationDelay: '1.5s' }} />
                                    <circle cx="50" cy="140" r="2" fill="white" className="animate-twinkle" style={{ animationDelay: '2s' }} />
                                    <circle cx="150" cy="150" r="2" fill="white" className="animate-twinkle" style={{ animationDelay: '2.5s' }} />
                                </g>

                                {/* Trail Particles */}
                                <g className="particles">
                                    <circle cx="95" cy="170" r="3" fill="white" opacity="0.4" className="animate-particle-1" />
                                    <circle cx="105" cy="175" r="2.5" fill="white" opacity="0.3" className="animate-particle-2" />
                                    <circle cx="100" cy="180" r="2" fill="white" opacity="0.2" className="animate-particle-3" />
                                </g>
                            </svg>
                        </div>

                        {/* Motivational Text */}
                        <div className="text-center space-y-4 max-w-sm">
                            <h3 className="text-white text-3xl font-bold leading-tight animate-fade-in-up" style={{ fontFamily: 'Inter, system-ui, sans-serif', animationDelay: '0.2s' }}>
                                Launch Your Success
                            </h3>
                            <p className="text-white/90 text-base leading-relaxed animate-fade-in-up" style={{ fontFamily: 'Inter, system-ui, sans-serif', animationDelay: '0.4s' }}>
                                Join thousands achieving more with focused planning and clear goals
                            </p>

                            {/* Feature Pills */}
                            <div className="flex flex-wrap gap-2 justify-center pt-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                                <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm border border-white/20" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    ✓ Free forever
                                </div>
                                <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm border border-white/20" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    ✓ No credit card
                                </div>
                                <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm border border-white/20" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    ✓ 30-day trial
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom CSS Animations */}
            <style jsx>{`
                @keyframes rocket-launch {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(-2deg); }
                }
                @keyframes fire-1 {
                    0%, 100% { opacity: 0.8; transform: scaleY(1); }
                    50% { opacity: 0.4; transform: scaleY(1.3); }
                }
                @keyframes fire-2 {
                    0%, 100% { opacity: 0.7; transform: scaleY(1); }
                    50% { opacity: 0.3; transform: scaleY(1.4); }
                }
                @keyframes fire-3 {
                    0%, 100% { opacity: 0.6; transform: scaleY(1); }
                    50% { opacity: 0.2; transform: scaleY(1.5); }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.5); }
                }
                @keyframes particle-1 {
                    0% { opacity: 0.4; transform: translateY(0px); }
                    100% { opacity: 0; transform: translateY(30px); }
                }
                @keyframes particle-2 {
                    0% { opacity: 0.3; transform: translateY(0px); }
                    100% { opacity: 0; transform: translateY(35px); }
                }
                @keyframes particle-3 {
                    0% { opacity: 0.2; transform: translateY(0px); }
                    100% { opacity: 0; transform: translateY(40px); }
                }
                @keyframes scale-in {
                    0% { opacity: 0; transform: scale(0); }
                    50% { transform: scale(1.2); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-rocket-launch {
                    animation: rocket-launch 3s ease-in-out infinite;
                }
                .animate-fire-1 {
                    animation: fire-1 0.3s ease-in-out infinite;
                    transform-origin: top center;
                }
                .animate-fire-2 {
                    animation: fire-2 0.4s ease-in-out infinite;
                    transform-origin: top center;
                }
                .animate-fire-3 {
                    animation: fire-3 0.5s ease-in-out infinite;
                    transform-origin: top center;
                }
                .animate-twinkle {
                    animation: twinkle 2s ease-in-out infinite;
                }
                .animate-particle-1 {
                    animation: particle-1 1.5s ease-out infinite;
                }
                .animate-particle-2 {
                    animation: particle-2 1.7s ease-out infinite;
                }
                .animate-particle-3 {
                    animation: particle-3 1.9s ease-out infinite;
                }
                .animate-scale-in {
                    animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
}
