import apiClient from './client';
import { AuthResponse } from '../types';

export async function login(username: string, password: string): Promise<AuthResponse> {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  const { data } = await apiClient.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return data;
}

export async function register(
  username: string,
  password: string,
  displayName: string
): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/register', {
    username,
    password,
    display_name: displayName,
  });
  return data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await apiClient.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
}
