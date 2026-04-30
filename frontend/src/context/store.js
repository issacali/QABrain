import { create } from "zustand";
import api from "../services/api";

const defaultSettings = {
  ai: {
    activeModel: "chatgpt",
    openai: { apiKey: "", model: "gpt-4o-mini" },
    gemini: { apiKey: "", model: "gemini-1.5-flash" },
    ollama: { endpoint: "http://localhost:11434", model: "llama3.1" }
  },
  jira: { baseUrl: "", email: "", token: "", projectKey: "" }
};

export const useAppStore = create((set, get) => ({
  settings: defaultSettings,
  stats: { testCases: 0, defects: 0, jira: 0, activeModel: "chatgpt" },
  loading: false,
  setLoading: (loading) => set({ loading }),
  setSettings: (settings) => set({ settings }),
  fetchSettings: async () => {
    const { data } = await api.get("/settings");
    if (data) set({ settings: data });
  },
  saveSettings: async () => {
    await api.put("/settings", get().settings);
  },
  fetchStats: async () => {
    const { data } = await api.get("/dashboard/stats");
    set({ stats: data });
  }
}));
