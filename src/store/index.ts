import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AnalysisReport, Notification, Theme, Agent } from '../types';

interface AppState {
  user: User | null;
  theme: Theme;
  currentAnalysis: AnalysisReport | null;
  analysisHistory: AnalysisReport[];
  notifications: Notification[];
  agents: Agent[];
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setTheme: (theme: Theme) => void;
  toggleDarkMode: () => void;
  setCurrentAnalysis: (analysis: AnalysisReport | null) => void;
  addToHistory: (analysis: AnalysisReport) => void;
  clearHistory: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  setAgents: (agents: Agent[]) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      theme: { mode: 'dark', primary_color: '#6366f1', accent_color: '#10b981' },
      currentAnalysis: null,
      analysisHistory: [],
      notifications: [],
      agents: [],
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),

      setTheme: (theme) => {
        set({ theme });
        if (theme.mode === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      toggleDarkMode: () => {
        const { theme } = get();
        const newMode = theme.mode === 'dark' ? 'light' : 'dark';
        set({ theme: { ...theme, mode: newMode } });
        if (newMode === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),

      addToHistory: (analysis) => set((state) => ({
        analysisHistory: [analysis, ...state.analysisHistory].slice(0, 50),
      })),

      clearHistory: () => set({ analysisHistory: [] }),

      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            read: false,
          },
          ...state.notifications,
        ].slice(0, 20),
      })),

      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
      })),

      clearNotifications: () => set({ notifications: [] }),

      setAgents: (agents) => set({ agents }),

      updateAgent: (id, updates) => set((state) => ({
        agents: state.agents.map((agent) =>
          agent.id === id ? { ...agent, ...updates } : agent
        ),
      })),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'scam-detector-storage',
      partialize: (state) => ({
        theme: state.theme,
        analysisHistory: state.analysisHistory,
        user: state.user,
      }),
    }
  )
);

export const initializeTheme = () => {
  const stored = localStorage.getItem('scam-detector-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.state?.theme?.mode === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch {
      document.documentElement.classList.add('dark');
    }
  } else {
    document.documentElement.classList.add('dark');
  }
};
