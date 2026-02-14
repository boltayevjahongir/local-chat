import { useState } from 'react';
import { User } from '../../types';
import { createGroup } from '../../api/groups';
import { useChatStore } from '../../stores/chatStore';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: User[];
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  allUsers,
}: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addGroup, setActiveGroup } = useChatStore();

  const toggleUser = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Guruh nomi kiriting');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const group = await createGroup(name.trim(), Array.from(selectedIds));
      addGroup(group);
      setActiveGroup(group.id);
      // Reset
      setName('');
      setSelectedIds(new Set());
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yangi guruh yaratish">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Guruh nomi
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: Dasturchilar"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            A'zolar ({selectedIds.size} tanlangan)
          </label>
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
            {allUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => toggleUser(user.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition hover:bg-gray-50 ${
                  selectedIds.has(user.id) ? 'bg-blue-50' : ''
                }`}
              >
                <Avatar
                  name={user.display_name}
                  color={user.avatar_color}
                  size="sm"
                />
                <span className="text-sm text-gray-700 flex-1">
                  {user.display_name}
                </span>
                {selectedIds.has(user.id) && (
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
            {allUsers.length === 0 && (
              <p className="text-sm text-gray-400 p-3 text-center">
                Boshqa foydalanuvchilar yo'q
              </p>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm disabled:opacity-50"
          >
            {loading ? 'Yaratilmoqda...' : 'Yaratish'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
