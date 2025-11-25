'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/store';
import { setToken, setUser, setLoading, logout } from '@/store/slices/userSlice';
import { api } from '@/lib/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const initAuth = async () => {
            try {
                dispatch(setLoading(true));

                // Check if token exists in localStorage
                const token = localStorage.getItem('access_token');

                if (token) {
                    dispatch(setToken(token));

                    try {
                        // Fetch user data to verify token is still valid
                        const userData = await api.getMe();
                        dispatch(setUser(userData));
                    } catch (error) {
                        // Token invalid/expired - clear it
                        console.log('Token validation failed, clearing auth state');
                        localStorage.removeItem('access_token');
                        dispatch(logout()); // Reset authentication state
                    }
                } else {
                    // No token found - ensure clean state
                    dispatch(logout());
                }
            } catch (error) {
                // Unexpected error during initialization
                console.error('Auth initialization error:', error);
                dispatch(logout());
            } finally {
                // Always set loading to false, even if errors occur
                dispatch(setLoading(false));
            }
        };

        initAuth();
    }, [dispatch]);

    return <>{children}</>;
}
