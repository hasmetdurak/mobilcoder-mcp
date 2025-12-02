import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'mcp';
  timestamp: number;
}

interface Store {
  user: User | null;
  connectionCode: string | null;
  isConnected: boolean;
  messages: Message[];
  theme: 'light' | 'dark';
  notifications: boolean;
  setUser: (user: User | null) => void;
  setConnectionCode: (code: string | null) => void;
  setConnected: (connected: boolean) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setNotifications: (enabled: boolean) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      user: null,
      connectionCode: null,
      isConnected: false,
      messages: [],
      theme: 'dark',
      notifications: true,
      setUser: (user) => set({ user }),
      setConnectionCode: (code) => set({ connectionCode: code }),
      setConnected: (connected) => set({ isConnected: connected }),
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: Date.now().toString(),
              timestamp: Date.now(),
            },
          ],
        })),
      clearMessages: () => set({ messages: [] }),
      setTheme: (theme) => set({ theme }),
      setNotifications: (enabled) => set({ notifications: enabled }),
    }),
    {
      name: 'mobilecoder-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        connectionCode: state.connectionCode,
        theme: state.theme,
        notifications: state.notifications,
      }),
    }
  )
);

