export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_color: string;
  is_online: boolean;
  last_seen: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  is_global: boolean;
  created_by: string | null;
  created_at: string;
  members?: User[];
}

export interface FileAttachment {
  id: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
}

export interface Message {
  id: string;
  group_id: string;
  sender_id: string | null;
  sender?: User | null;
  content: string | null;
  message_type: 'text' | 'file' | 'image' | 'system';
  created_at: string;
  file_attachment: FileAttachment | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
