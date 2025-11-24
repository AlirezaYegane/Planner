'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAppDispatch } from '@/store/store';
import { setToken } from '@/store/slices/userSlice';
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Clear any stale state on mount
    useEffect(() => {
        setError('');
        console.log('Login Page Mounted - Premium UI Loaded');
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        console.log('Attempting login...');

        try {
            const token = await api.login({ email, password });
            console.log('Login response received:', token);

            if (token && token.access_token) {
                dispatch(setToken(token.access_token));
                console.log('Token dispatched, redirecting...');
                // Force a hard redirect to ensure dashboard loads cleanly
                window.location.href = '/dashboard';
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0F172A] text-white flex items-center justify-center p-4 lg:p-0 overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="w-full max-w-[1440px] h-screen lg:h-[90vh] lg:max-h-[900px] lg:m-8 bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden z-10 flex flex-col lg:flex-row">

                {/* Left Panel: Login Form */}
                <div className="w-full lg:w-1/2 h-full flex flex-col p-8 lg:p-16 xl:p-24 relative">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Deep Focus</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                        <div className="mb-8">
                            <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-white">Welcome back</h1>
                            <p className="text-slate-400">
                                Enter your credentials to access your workspace.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                                <div className="w-1.5 h-1.5 mt-2 bg-red-500 rounded-full shrink-0" />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-sm font-medium text-slate-300">Password</label>
                                    <a href="#" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">Forgot password?</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign in</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-slate-400 text-sm">
                                Don't have an account?{' '}
                                <a href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                                    Create account
                                </a>
                            </p>
                        </div>

                        {/* Demo Credentials */}
                        <div className="mt-8 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <p className="text-xs text-slate-400 text-center">
                                <span className="font-semibold text-slate-300">Demo Access:</span> admin@planner.app / admin123
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Visual/Marketing */}
                <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-900 relative overflow-hidden items-center justify-center p-12">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>

                    {/* Abstract Shapes */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full animate-[spin_60s_linear_infinite]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/20 rounded-full animate-[spin_40s_linear_infinite_reverse]" />

                    <div className="relative z-10 max-w-md text-center">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
                            Master your productivity with Deep Focus
                        </h2>
                        <p className="text-blue-100/80 text-lg leading-relaxed">
                            Join thousands of professionals who use our platform to organize their life and work efficiently.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
