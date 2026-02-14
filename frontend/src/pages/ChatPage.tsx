import { useEffect } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { getMyGroups } from '../api/groups';
import { useWebSocket } from '../ws/useWebSocket';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import ChatArea from '../components/layout/ChatArea';

export default function ChatPage() {
  const { setGroups, setActiveGroup, groups, activeGroupId, setOnlineUserIds } =
    useChatStore();
  const currentUser = useAuthStore((s) => s.user);
  const { sendMessage } = useWebSocket();

  // Load groups on mount
  useEffect(() => {
    getMyGroups()
      .then((groups) => {
        setGroups(groups);
        // Auto-select the first group (usually Global)
        if (groups.length > 0 && !activeGroupId) {
          setActiveGroup(groups[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // Mark current user as online
  useEffect(() => {
    if (currentUser) {
      setOnlineUserIds([currentUser.id]);
    }
  }, [currentUser, setOnlineUserIds]);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ChatArea onSend={sendMessage} />
      </div>
    </div>
  );
}
