import apiClient from './client';
import { FileAttachment } from '../types';

export async function uploadFile(file: File): Promise<FileAttachment> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export function getFileDownloadUrl(fileId: string): string {
  const serverUrl = localStorage.getItem('SERVER_URL');
  const token = localStorage.getItem('access_token');
  return `http://${serverUrl}/api/files/${fileId}?token=${token}`;
}
