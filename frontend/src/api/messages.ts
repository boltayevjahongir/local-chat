import apiClient from './client';
import { Message } from '../types';

export async function getMessages(
  groupId: string,
  before?: string,
  limit: number = 50
): Promise<Message[]> {
  const params: Record<string, string | number> = { limit };
  if (before) params.before = before;
  const { data } = await apiClient.get(`/messages/${groupId}`, { params });
  return data;
}
