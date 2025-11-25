'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setToken, setUser } from '@/store/slices/userSlice';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldValidation, setFieldValidation] = useState({
        email: false,
        password: false
    });
    const { isAuthenticated, loading: authLoading } = useAppSelector((state) => state.user);
    const router = useRouter();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        setError('');
    }, []);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        setFieldValidation(prev => ({
            ...prev,
            email: validateEmail(value)
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        setFieldValidation(prev => ({
            ...prev,
            password: value.length >= 6
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = await api.login({ email, password });

            if (token && token.access_token) {
                dispatch(setToken(token.access_token));

                // Fetch user data to set isAuthenticated
                const userData = await api.getMe();
                dispatch(setUser(userData));

                // Use router.push for proper Next.js client-side navigation
                router.push('/dashboard');
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
            setLoading(false);
        }
    };

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
                                Welcome back
                            </h1>
                            <p className="text-[#718096] text-[15px]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                Continue your planning journey.
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 animate-shake">
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Field */}
                            <div>
                                <label className="block text-[#4A5568] text-[13px] font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    Email
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        required
                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-[#2D3748] placeholder-[#A0AEC0] focus:outline-none focus:border-[#246BFD] focus:ring-2 focus:ring-[#246BFD]/10 transition-all ${email && (fieldValidation.email ? 'border-[#10B981] pr-12' : 'border-[#E2E8F0]')
                                            } ${!email && 'border-[#E2E8F0]'}`}
                                        placeholder="Enter your email"
                                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                                    />
                                    {email && fieldValidation.email && (
                                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#10B981] animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-[#4A5568] text-[13px] font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                        Password
                                    </label>
                                    <a href="#" className="text-[12px] text-[#246BFD] hover:text-[#1E4DD8] font-medium transition-colors" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={handlePasswordChange}
                                        required
                                        className={`w-full px-4 py-3 bg-white border rounded-lg text-[#2D3748] placeholder-[#A0AEC0] focus:outline-none focus:border-[#246BFD] focus:ring-2 focus:ring-[#246BFD]/10 transition-all pr-20 ${password && (fieldValidation.password ? 'border-[#10B981]' : 'border-[#E2E8F0]')
                                            } ${!password && 'border-[#E2E8F0]'}`}
                                        placeholder="Enter your password"
                                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        {password && fieldValidation.password && (
                                            <svg className="w-5 h-5 text-[#10B981] animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-[#718096] hover:text-[#246BFD] transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Login Button */}
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
                                        Signing in...
                                    </span>
                                ) : 'Log in'}
                            </button>

                            {/* Sign up link */}
                            <div className="text-center">
                                <p className="text-[13px] text-[#718096]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    Don't have an account?{' '}
                                    <a href="/signup" className="text-[#246BFD] hover:text-[#1E4DD8] font-semibold transition-colors">
                                        Create account
                                    </a>
                                </p>
                            </div>

                            {/* Footer Attribution */}
                            <div className="pt-4 text-center border-t border-gray-100">
                                <p className="text-[11px] text-[#A0AEC0]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    Designed by <span className="font-medium text-[#718096]">Alireza Yegane</span>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                {/* RIGHT PANEL - Premium Dashboard Preview Animation */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-[#246BFD] via-[#1E4DD8] to-[#1956C7] relative overflow-hidden min-h-[400px] md:min-h-full flex items-center justify-center p-8">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
                    </div>

                    {/* Main Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center">
                        {/* Dashboard Preview Animation */}
                        <div className="relative mb-12">
                            {/* Animated Dashboard Elements */}
                            <svg className="w-48 h-48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Calendar/Schedule Grid */}
                                <g className="animate-float" style={{ animationDelay: '0s' }}>
                                    <rect x="30" y="30" width="140" height="140" rx="8" fill="white" opacity="0.15" stroke="white" strokeWidth="2" />
                                    <rect x="30" y="30" width="140" height="30" rx="8" fill="white" opacity="0.25" />

                                    {/* Grid Lines */}
                                    <line x1="30" y1="80" x2="170" y2="80" stroke="white" strokeWidth="1" opacity="0.3" />
                                    <line x1="30" y1="110" x2="170" y2="110" stroke="white" strokeWidth="1" opacity="0.3" />
                                    <line x1="30" y1="140" x2="170" y2="140" stroke="white" strokeWidth="1" opacity="0.3" />

                                    <line x1="100" y1="60" x2="100" y2="170" stroke="white" strokeWidth="1" opacity="0.3" />
                                </g>

                                {/* Checkmarks - Tasks Complete */}
                                <g className="tasks">
                                    <circle cx="60" cy="95" r="8" fill="#10B981" className="animate-check-pop" style={{ animationDelay: '0.5s' }} />
                                    <path d="M56 95 L59 98 L64 92" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-check-pop" style={{ animationDelay: '0.6s' }} />

                                    <circle cx="60" cy="125" r="8" fill="#10B981" className="animate-check-pop" style={{ animationDelay: '0.8s' }} />
                                    <path d="M56 125 L59 128 L64 122" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-check-pop" style={{ animationDelay: '0.9s' }} />

                                    <circle cx="130" cy="95" r="8" fill="#246BFD" opacity="0.3" className="animate-pulse" />
                                    <circle cx="130" cy="125" r="8" fill="#246BFD" opacity="0.3" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                                </g>

                                {/* Progress Bar */}
                                <g className="animate-float" style={{ animationDelay: '0.3s' }}>
                                    <rect x="50" y="155" width="100" height="8" rx="4" fill="white" opacity="0.2" />
                                    <rect x="50" y="155" width="70" height="8" rx="4" fill="#10B981" className="animate-progress" />
                                </g>
                            </svg>
                        </div>

                        {/* Welcome Text */}
                        <div className="text-center space-y-4 max-w-sm">
                            <h3 className="text-white text-3xl font-bold leading-tight animate-fade-in-up" style={{ fontFamily: 'Inter, system-ui, sans-serif', animationDelay: '0.2s' }}>
                                Welcome Back
                            </h3>
                            <p className="text-white/90 text-base leading-relaxed animate-fade-in-up" style={{ fontFamily: 'Inter, system-ui, sans-serif', animationDelay: '0.4s' }}>
                                Your tasks and goals are waiting. Let's continue where you left off.
                            </p>

                            {/* Stats Pills */}
                            <div className="flex flex-wrap gap-2 justify-center pt-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                                <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm border border-white/20" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    ✓ Stay focused
                                </div>
                                <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm border border-white/20" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    ✓ Track progress
                                </div>
                                <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm border border-white/20" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    ✓ Achieve goals
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom CSS Animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes check-pop {
                    0% { opacity: 0; transform: scale(0); }
                    50% { transform: scale(1.2); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes progress {
                    from { width: 0; }
                    to { width: 70px; }
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
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animate-check-pop {
                    animation: check-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                    opacity: 0;
                }
                .animate-progress {
                    animation: progress 2s ease-out forwards;
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
