/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TextResponse } from '@/types/freedom';
import type { UserInterface } from '@/types/user';
import api from './api';

interface CredentialsProps {
    email: string;
    password: string
}

interface CredentialsResponse extends TextResponse {
    user: UserInterface | null;
}

export const signup = async ({ email, password }: CredentialsProps): Promise<CredentialsResponse> => {
    try {
        const res = await api.post('/auth/signup', {
            email, password
        });

        return { message: res.data.message, user: res.data.user, error: null };
    } catch (error) {
        return { message: null, user: null, error: (error as any).response.data.error };
    }
};

export const login = async ({ email, password }: CredentialsProps): Promise<CredentialsResponse> => {
    try {
        const res = await api.post('/auth/login', {
            email, password
        });

        return { message: res.data.message, user: res.data.user, error: null };
    }
    catch (error) {
        return { message: null, user: null, error: (error as any).response.data.error };
    }
};

export const logout = async () => {
    try {
        await api.post('/auth/logout');
    }
    catch (error) {
        return (error as any).response.data.error;
    }
};

interface CheckAuthResponse {
    user: UserInterface | null,
    error: string | null
}

export const checkAuth = async (): Promise<CheckAuthResponse> => {
    try {
        const res = await api.get('/auth/profile');
        return { user: res.data.user, error: null };
    }
    catch (error) {
        return { user: null, error: (error as any).response.data.error };
    }
};

export const refreshToken = async (): Promise<TextResponse> => {
    try {
        const res = await api.post('/auth/refresh-token');
        return { message: res.data.message, error: null };
    }
    catch (error) {
        return { message: null, error: (error as any).response.data.error };
    }
};