// TypeScript types for the application

export interface User {
    id: number;
    email: string;
    full_name?: string;
    is_active: boolean;
    is_superuser: boolean;
    created_at: string;
    updated_at: string;
}

export interface Token {
    access_token: string;
    token_type: string;
}

export interface Subtask {
    id: number;
    name: string;
    is_done: boolean;
    order: number;
    task_id: number;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: number;
    name: string;
    description?: string;
    status: 'not_started' | 'in_progress' | 'done' | 'postponed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    date?: string;
    user_id: number;
    group_id?: number;
    created_at: string;
    updated_at: string;
    subtasks: Subtask[];
}

export interface Group {
    id: number;
    name: string;
    color: string;
    order: number;
    board_id: number;
    created_at: string;
    updated_at: string;
}

export interface Board {
    id: number;
    name: string;
    description?: string;
    user_id: number;
    created_at: string;
    updated_at: string;
    groups: Group[];
}

export interface Plan {
    id: number;
    date: string;
    sleep_time: number;
    commute_time: number;
    work_time: number;
    user_id: number;
    created_at: string;
    updated_at: string;
}

// Request types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
    password: string;
    full_name?: string;
}

export interface TaskCreateRequest {
    name: string;
    description?: string;
    status?: Task['status'];
    priority?: Task['priority'];
    date?: string;
    group_id?: number;
    subtasks?: Array<{ name: string; order: number }>;
}

export interface TaskUpdateRequest {
    name?: string;
    description?: string;
    status?: Task['status'];
    priority?: Task['priority'];
    date?: string;
    group_id?: number;
}

export interface BoardCreateRequest {
    name: string;
    description?: string;
}

export interface GroupCreateRequest {
    name: string;
    color?: string;
    order?: number;
}

export interface PlanCreateRequest {
    date: string;
    sleep_time?: number;
    commute_time?: number;
    work_time?: number;
}
