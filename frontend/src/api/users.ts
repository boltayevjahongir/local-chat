import apiClient from './client';
import { User } from '../types';

export async function getAllUsers(): Promise<User[]> {
  const { data } = await apiClient.get('/users/');
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get('/users/me');
  return data;
}
