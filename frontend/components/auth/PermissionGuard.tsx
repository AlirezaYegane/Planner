import React from 'react';
import { useAppSelector } from '@/store/store';

interface PermissionGuardProps {
    children: React.ReactNode;
    /**
     * Required role for the wrapped component. Must be one of the defined roles.
     */
    requiredRole: keyof typeof ROLE_HIERARCHY;
    fallback?: React.ReactNode;
}

// Define role hierarchy with explicit numeric values for comparison.
const ROLE_HIERARCHY = {
    OWNER: 4,
    ADMIN: 3,
    MEMBER: 2,
    VIEWER: 1,
} as const;

export default function PermissionGuard({
    children,
    requiredRole,
    fallback = null,
}: PermissionGuardProps) {
    const { currentTeam } = useAppSelector((state) => state.teams);
    const { user } = useAppSelector((state) => state.user);

    // If team or user data is missing, render fallback.
    if (!currentTeam || !user) {
        return <>{fallback}</>;
    }

    // Find the membership record for the current user within the team.
    const membership = currentTeam.members.find((m) => m.user_id === user.id);
    if (!membership) {
        return <>{fallback}</>;
    }

    // Guard against unexpected role values.
    const userRoleLevel = ROLE_HIERARCHY[membership.role as keyof typeof ROLE_HIERARCHY] ?? 0;
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole];

    // Render children only if the user's role meets or exceeds the required role.
    if (userRoleLevel >= requiredRoleLevel) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}
