import api from './client';
import type { User } from '../types';

export const getMe = () => api.get<User>('/users/me');

export const getAvailableDrivers = () => api.get<User[]>('/drivers/available');
