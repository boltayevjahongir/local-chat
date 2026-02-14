import apiClient from './client';
import { Group } from '../types';

export async function getMyGroups(): Promise<Group[]> {
  const { data } = await apiClient.get('/groups/');
  return data;
}

export async function getGroupDetail(groupId: string): Promise<Group> {
  const { data } = await apiClient.get(`/groups/${groupId}`);
  return data;
}

export async function createGroup(
  name: string,
  memberIds: string[],
  description?: string
): Promise<Group> {
  const { data } = await apiClient.post('/groups/', {
    name,
    member_ids: memberIds,
    description,
  });
  return data;
}

export async function deleteGroup(groupId: string): Promise<void> {
  await apiClient.delete(`/groups/${groupId}`);
}

export async function addMembers(groupId: string, userIds: string[]): Promise<void> {
  await apiClient.post(`/groups/${groupId}/members`, { user_ids: userIds });
}
