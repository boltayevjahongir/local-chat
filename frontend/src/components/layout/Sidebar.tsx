import { useState, useEffect } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { getAllUsers } from '../../api/users';
import { User } from '../../types';
import Avatar from '../common/Avatar';
import CreateGroupModal from '../groups/CreateGroupModal';

export default function Sidebar() {
  const { groups, activeGroupId, setActiveGroup, onlineUserIds } = useChatStore();
  const currentUser = useAuthStore((s) => s.user);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    getAllUsers().then(setAllUsers).catch(() => {});
  }, []);

  const otherUsers = allUsers.filter((u) => u.id !== currentUser?.id);

  return (
    <>
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Guruhlar</h2>
        </div>

        {/* Groups list */}
        <div className="flex-1 overflow-y-auto">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => setActiveGroup(group.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50 ${
                activeGroupId === group.id
                  ? 'bg-blue-50 border-r-2 border-blue-500'
                  : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                  group.is_global ? 'bg-blue-500' : 'bg-purple-500'
                }`}
              >
                {group.is_global ? '#' : group.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {group.name}
                </p>
                {group.is_global && (
                  <p className="text-xs text-gray-400">Umumiy chat</p>
                )}
              </div>
            </button>
          ))}

          {/* Create group button */}
          <button
            onClick={() => setShowCreateGroup(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-500 hover:bg-gray-50 transition"
          >
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <span className="text-sm">Yangi guruh</span>
          </button>
        </div>

        {/* Online users */}
        <div className="border-t border-gray-100 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
            Online ({onlineUserIds.size})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {otherUsers
              .filter((u) => onlineUserIds.has(u.id))
              .map((user) => (
                <div key={user.id} className="flex items-center gap-2">
                  <Avatar
                    name={user.display_name}
                    color={user.avatar_color}
                    size="sm"
                    isOnline={true}
                  />
                  <span className="text-sm text-gray-700 truncate">
                    {user.display_name}
                  </span>
                </div>
              ))}
            {onlineUserIds.size <= 1 && (
              <p className="text-xs text-gray-400">Hech kim online emas</p>
            )}
          </div>
        </div>
      </div>

      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        allUsers={otherUsers}
      />
    </>
  );
}
