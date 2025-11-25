import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
    User,
    Token,
    Task,
    Board,
    Plan,
    LoginRequest,
    SignupRequest,
    TaskCreateRequest,
    TaskUpdateRequest,
    BoardCreateRequest,
    GroupCreateRequest,
    PlanCreateRequest,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: `${API_URL}/api/v1`,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor to attach token
        this.client.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                // Don't automatically redirect on 401 - let components handle it
                // This prevents race conditions during auth initialization
                if (error.response?.status === 401) {
                    // Clear invalid token but don't force redirect
                    this.clearToken();
                }
                return Promise.reject(error);
            }
        );
    }

    // Token management
    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('access_token');
    }

    setToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', token);
        }
    }

    clearToken(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
        }
    }

    // Auth endpoints
    async signup(data: SignupRequest): Promise<User> {
        const response = await this.client.post<User>('/auth/signup', data);
        return response.data;
    }

    async login(data: LoginRequest): Promise<Token> {
        const formData = new URLSearchParams();
        formData.append('username', data.email); // OAuth2 form uses 'username'
        formData.append('password', data.password);

        const response = await this.client.post<Token>('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        this.setToken(response.data.access_token);
        return response.data;
    }

    logout(): void {
        this.clearToken();
    }

    async getMe(): Promise<User> {
        const response = await this.client.get<User>('/auth/me');
        return response.data;
    }

    // Email verification
    async verifyEmail(token: string): Promise<{ message: string }> {
        const response = await this.client.post<{ message: string }>('/auth/verify-email', { token });
        return response.data;
    }

    async resendVerification(email: string): Promise<{ message: string }> {
        const response = await this.client.post<{ message: string }>('/auth/resend-verification', { email });
        return response.data;
    }

    // Password reset
    async forgotPassword(email: string): Promise<{ message: string }> {
        const response = await this.client.post<{ message: string }>('/auth/forgot-password', { email });
        return response.data;
    }

    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        const response = await this.client.post<{ message: string }>('/auth/reset-password', {
            token,
            new_password: newPassword
        });
        return response.data;
    }

    // Task endpoints
    async getTasks(params?: { date?: string; status?: string }): Promise<Task[]> {
        const response = await this.client.get<Task[]>('/tasks/', { params });
        return response.data;
    }

    async getTask(id: number): Promise<Task> {
        const response = await this.client.get<Task>(`/tasks/${id}`);
        return response.data;
    }

    async createTask(data: TaskCreateRequest): Promise<Task> {
        const response = await this.client.post<Task>('/tasks/', data);
        return response.data;
    }

    async updateTask(id: number, data: TaskUpdateRequest): Promise<Task> {
        const response = await this.client.patch<Task>(`/tasks/${id}`, data);
        return response.data;
    }

    async deleteTask(id: number): Promise<void> {
        await this.client.delete(`/tasks/${id}`);
    }

    // Board endpoints
    async getBoards(): Promise<Board[]> {
        const response = await this.client.get<Board[]>('/boards/');
        return response.data;
    }

    async getBoard(id: number): Promise<Board> {
        const response = await this.client.get<Board>(`/boards/${id}`);
        return response.data;
    }

    async createBoard(data: BoardCreateRequest): Promise<Board> {
        const response = await this.client.post<Board>('/boards/', data);
        return response.data;
    }

    async deleteBoard(id: number): Promise<void> {
        await this.client.delete(`/boards/${id}`);
    }

    async createGroup(boardId: number, data: GroupCreateRequest): Promise<any> {
        const response = await this.client.post(`/boards/${boardId}/groups`, data);
        return response.data;
    }

    // Plan endpoints
    async getPlans(params?: { start_date?: string; end_date?: string }): Promise<Plan[]> {
        const response = await this.client.get<Plan[]>('/plans/', { params });
        return response.data;
    }

    async getPlanByDate(date: string): Promise<Plan> {
        const response = await this.client.get<Plan>(`/plans/${date}`);
        return response.data;
    }

    async createPlan(data: PlanCreateRequest): Promise<Plan> {
        const response = await this.client.post<Plan>('/plans/', data);
        return response.data;
    }

    async updatePlan(date: string, data: Partial<PlanCreateRequest>): Promise<Plan> {
        const response = await this.client.patch<Plan>(`/plans/${date}`, data);
        return response.data;
    }

    // Team endpoints
    async getTeams(): Promise<any[]> {
        const response = await this.client.get<any[]>('/teams/');
        return response.data;
    }

    async createTeam(data: { name: string }): Promise<any> {
        const response = await this.client.post<any>('/teams/', data);
        return response.data;
    }

    async addTeamMember(teamId: number, data: { email: string; role: string }): Promise<any> {
        const response = await this.client.post<any>(`/teams/${teamId}/members`, data);
        return response.data;
    }

    // Payment endpoints
    async createCheckoutSession(planId: string): Promise<{ sessionId: string; url: string }> {
        const response = await this.client.post<{ sessionId: string; url: string }>('/payments/create-checkout-session', null, {
            params: { plan_id: planId }
        });
        return response.data;
    }
}

// Export singleton instance
export const api = new ApiClient();
