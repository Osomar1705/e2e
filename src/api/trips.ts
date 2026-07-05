import api from './client';
import type { Trip } from '../types';

export const createTrip = (data: { pickupAddress: string; dropoffAddress: string }) =>
  api.post<Trip>('/trips', data);

export const getMyTrips = () => api.get<Trip[]>('/trips');

export const getPendingTrips = () => api.get<Trip[]>('/trips/pending');

export const getDriverTrips = () => api.get<Trip[]>('/trips/my');

export const getTripById = (id: number) => api.get<Trip>(`/trips/${id}`);

export const acceptTrip = (id: number) => api.patch<Trip>(`/trips/${id}/accept`);

export const completeTrip = (id: number) => api.patch<Trip>(`/trips/${id}/complete`);

export const rateTrip = (id: number, data: { rating: number; comment?: string }) =>
  api.post<Trip>(`/trips/${id}/rate`, data);
