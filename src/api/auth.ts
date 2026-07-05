import api from './client';
import type { AuthResponse } from '../types';

export const register = (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'PASSENGER' | 'DRIVER';
}) => api.post<AuthResponse>('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
  api.post<AuthResponse>('/auth/login', data);
