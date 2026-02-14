import { useEffect, useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { getMessages } from '../../api/messages';
import { getGroupDetail } from '../../api/groups';
import { User } from '../../types';
import MessageList from '../chat/MessageList';
import MessageInput from '../chat/MessageInput';

interface ChatAreaProps {
  onSend: (data: Record<string, unknown>) => void;
}

export default function ChatArea({ onSend }: ChatAreaProps) {
  const { activeGroupId, setMessages, groups, typingUsers } = useChatStore();
  const currentUser = useAuthStore((s) => s.user);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);

  const activeGroup = groups.find((g) => g.id === activeGroupId);

  // Load messages when group changes
  useEffect(() => {
    if (!activeGroupId) return;

    getMessages(activeGroupId)
      .then((msgs) => setMessages(activeGroupId, msgs))
      .catch(console.error);

    getGroupDetail(activeGroupId)
      .then((detail) => setGroupMembers(detail.members || []))
      .catch(() => {});
  }, [activeGroupId, setMessages]);

  // Typing users for active group
  const typingUserIds = activeGroupId
    ? Array.from(typingUsers[activeGroupId] || []).filter(
        (id) => id !== currentUser?.id
      )
    : [];
  const typingNames = typingUserIds
    .map((id) => groupMembers.find((m) => m.id === id)?.display_name || 'Kimdir')
    .join(', ');

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full">
      {/* Group header */}
      {activeGroup && (
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-3 ${
              activeGroup.is_global ? 'bg-blue-500' : 'bg-purple-500'
            }`}
          >
            {activeGroup.is_global ? '#' : activeGroup.name[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">
              {activeGroup.name}
            </h3>
            <p className="text-xs text-gray-400">
              {groupMembers.length} a'zo
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <MessageList />

      {/* Typing indicator */}
      {typingNames && (
        <div className="px-4 py-1 text-xs text-gray-400 italic">
          {typingNames} yozmoqda...
        </div>
      )}

      {/* Input */}
      <MessageInput onSend={onSend} />
    </div>
  );
}
