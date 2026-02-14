import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);
  const { addMessage, setUserOnline, setUserTyping } = useChatStore();
  const token = useAuthStore((s) => s.token);
  const serverUrl = useAuthStore((s) => s.serverUrl);

  const connect = useCallback(() => {
    if (!serverUrl || !token) return;

    const ws = new WebSocket(`ws://${serverUrl}/ws?token=${token}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'chat_message':
          addMessage({
            id: data.id,
            group_id: data.group_id,
            sender_id: data.sender_id,
            sender: data.sender,
            content: data.content,
            message_type: data.message_type,
            created_at: data.created_at,
            file_attachment: data.file_attachment,
          });
          break;
        case 'user_status':
          setUserOnline(data.user_id, data.is_online);
          break;
        case 'typing':
          setUserTyping(data.group_id, data.user_id, data.is_typing);
          // Auto-clear typing after 3 seconds
          setTimeout(() => {
            setUserTyping(data.group_id, data.user_id, false);
          }, 3000);
          break;
      }
    };

    ws.onclose = () => {
      reconnectTimeout.current = window.setTimeout(connect, 3000);
    };

    wsRef.current = ws;
  }, [token, serverUrl, addMessage, setUserOnline, setUserTyping]);

  const sendMessage = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const joinRoom = useCallback((groupId: string) => {
    sendMessage({ type: 'join_room', group_id: groupId });
  }, [sendMessage]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { sendMessage, joinRoom };
}
