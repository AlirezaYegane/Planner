'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const getPasswordStrength = (pwd: string) => {
        if (pwd.length === 0) return { label: '', color: 'text-neutral-400', width: '0%' };
        if (pwd.length < 6) return { label: 'Too short', color: 'text-red-500', width: '25%' };
        if (pwd.length < 8) return { label: 'Weak', color: 'text-orange-500', width: '50%' };
        if (pwd.length < 12) return { label: 'Good', color: 'text-emerald-500', width: '75%' };
        return { label: 'Strong', color: 'text-emerald-600', width: '100%' };
    };

    const passwordStrength = getPasswordStrength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.signup({ email, password, full_name: fullName });
            // Auto-login after signup
            await api.login({ email, password });
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* LEFT SIDE - Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    {/* Icon */}
                    <div className="mb-12 animate-fade-in">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold font-display mb-2">Start Your Journey</h1>
                        <p className="text-xl text-white/90">
                            Join the productivity revolution
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-6 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-4xl md:text-5xl font-bold font-display leading-tight">
                            Your best days<br />start here
                        </h2>
                        <p className="text-lg text-white/90 leading-relaxed max-w-md">
                            Experience the planning system that grows with you. No overwhelm, just progress.
                        </p>
                    </div>

                    {/* What you get */}
                    <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">What you'll get</h3>
                        {[
                            { icon: '🎁', text: '14-day free trial, no credit card required' },
                            { icon: '💎', text: 'All premium features unlocked ' },
                            { icon: '🔒', text: 'Your data stays private & secure' },
                            { icon: '💪', text: 'Cancel anytime, keep your progress' }
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3 group">
                                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{benefit.icon}</span>
                                <span className="text-white/90 group-hover:text-white transition-colors">{benefit.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Testimonial */}
                    <div className="mt-16 pt-8 border-t border-white/20 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                        <blockquote className="text-white/90 italic mb-3">
                            "Finally, a planner that actually helps me stay focused. Game changer for my ADHD brain."
                        </blockquote>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20" />
                            <div>
                                <div className="text-sm font-semibold">Sarah Chen</div>
                                <div className="text-xs text-white/70">Product Designer</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - Signup Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-emerald-50/20">
                <div className="w-full max-w-md animate-scale-in">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-display">
                            Deep Focus Planner
                        </h1>
                        <p className="text-neutral-600 mt-2">Your productivity companion</p>
                    </div>

                    {/* Welcome message */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-neutral-900 font-display mb-2">
                            Let's get started! 🚀
                        </h2>
                        <p className="text-neutral-600">
                            Create your account in 30 seconds
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-slide-up">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Signup form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-semibold text-neutral-700 mb-2">
                                Full name <span className="text-neutral-400 font-normal">(optional)</span>
                            </label>
                            <Input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full bg-white border-neutral-200"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                                Email address
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className="w-full bg-white border-neutral-200"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-2">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="Create a strong password"
                                className="w-full bg-white border-neutral-200"
                            />
                            {/* Password strength indicator */}
                            {password && (
                                <div className="mt-2 animate-fade-in">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-neutral-500">Password strength</span>
                                        <span className={`text-xs font-semibold ${passwordStrength.color}`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${passwordStrength.label === 'Strong' ? 'bg-emerald-500' :
                                                    passwordStrength.label === 'Good' ? 'bg-emerald-400' :
                                                        passwordStrength.label === 'Weak' ? 'bg-orange-400' :
                                                            'bg-red-400'
                                                }`}
                                            style={{ width: passwordStrength.width }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200"
                            size="lg"
                        >
                            {loading ? 'Creating your account...' : 'Create free account →'}
                        </Button>

                        <p className="text-xs text-center text-neutral-500">
                            By signing up, you agree to our{' '}
                            <a href="#" className="text-emerald-600 hover:text-emerald-500 font-medium">Terms</a>
                            {' '}and{' '}
                            <a href="#" className="text-emerald-600 hover:text-emerald-500 font-medium">Privacy Policy</a>
                        </p>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-gradient-to-br from-slate-50 to-emerald-50/20 text-neutral-500">
                                Already have an account?
                            </span>
                        </div>
                    </div>

                    {/* Sign in link */}
                    <div className="text-center">
                        <a
                            href="/login"
                            className="text-emerald-600 hover:text-emerald-500 transition-colors font-semibold"
                        >
                            Sign in instead →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}


