import { create } from 'zustand';
import { Group, Message } from '../types';

interface ChatState {
  groups: Group[];
  activeGroupId: string | null;
  messages: Record<string, Message[]>;
  onlineUserIds: Set<string>;
  typingUsers: Record<string, Set<string>>;

  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
  setActiveGroup: (groupId: string) => void;
  addMessage: (message: Message) => void;
  setMessages: (groupId: string, messages: Message[]) => void;
  prependMessages: (groupId: string, messages: Message[]) => void;
  setUserOnline: (userId: string, isOnline: boolean) => void;
  setOnlineUserIds: (ids: string[]) => void;
  setUserTyping: (groupId: string, userId: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  groups: [],
  activeGroupId: null,
  messages: {},
  onlineUserIds: new Set(),
  typingUsers: {},

  setGroups: (groups) => set({ groups }),

  addGroup: (group) => set((state) => ({
    groups: [...state.groups, group],
  })),

  setActiveGroup: (groupId) => set({ activeGroupId: groupId }),

  addMessage: (message) =>
    set((state) => {
      const groupMessages = state.messages[message.group_id] || [];
      return {
        messages: {
          ...state.messages,
          [message.group_id]: [...groupMessages, message],
        },
      };
    }),

  setMessages: (groupId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [groupId]: messages },
    })),

  prependMessages: (groupId, messages) =>
    set((state) => {
      const existing = state.messages[groupId] || [];
      return {
        messages: {
          ...state.messages,
          [groupId]: [...messages, ...existing],
        },
      };
    }),

  setUserOnline: (userId, isOnline) =>
    set((state) => {
      const newSet = new Set(state.onlineUserIds);
      if (isOnline) newSet.add(userId);
      else newSet.delete(userId);
      return { onlineUserIds: newSet };
    }),

  setOnlineUserIds: (ids) => set({ onlineUserIds: new Set(ids) }),

  setUserTyping: (groupId, userId, isTyping) =>
    set((state) => {
      const groupTyping = new Set(state.typingUsers[groupId] || []);
      if (isTyping) groupTyping.add(userId);
      else groupTyping.delete(userId);
      return {
        typingUsers: { ...state.typingUsers, [groupId]: groupTyping },
      };
    }),
}));
