import { useEffect } from "react";
import { useAppStore } from "../context/store";

export default function SettingsPage() {
  const { settings, setSettings, fetchSettings, saveSettings } = useAppStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const update = (path, value) => {
    const copy = structuredClone(settings);
    const keys = path.split(".");
    let node = copy;
    while (keys.length > 1) node = node[keys.shift()];
    node[keys[0]] = value;
    setSettings(copy);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Settings</h2>
      <div className="card p-4 space-y-4">
        <label className="block">Active Model
          <select className="border p-2 rounded ml-2" value={settings.ai.activeModel} onChange={(e) => update("ai.activeModel", e.target.value)}>
            <option value="chatgpt">ChatGPT</option>
            <option value="gemini">Gemini</option>
            <option value="ollama">Ollama</option>
          </select>
        </label>

        <h3 className="font-medium">OpenAI</h3>
        <input className="w-full border p-2 rounded" placeholder="API Key" value={settings.ai.openai.apiKey} onChange={(e) => update("ai.openai.apiKey", e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Model" value={settings.ai.openai.model} onChange={(e) => update("ai.openai.model", e.target.value)} />

        <h3 className="font-medium">Gemini</h3>
        <input className="w-full border p-2 rounded" placeholder="API Key" value={settings.ai.gemini.apiKey} onChange={(e) => update("ai.gemini.apiKey", e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Model" value={settings.ai.gemini.model} onChange={(e) => update("ai.gemini.model", e.target.value)} />

        <h3 className="font-medium">Ollama</h3>
        <input className="w-full border p-2 rounded" placeholder="Endpoint" value={settings.ai.ollama.endpoint} onChange={(e) => update("ai.ollama.endpoint", e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Model" value={settings.ai.ollama.model} onChange={(e) => update("ai.ollama.model", e.target.value)} />

        <h3 className="font-medium">Jira</h3>
        <input className="w-full border p-2 rounded" placeholder="Base URL" value={settings.jira.baseUrl} onChange={(e) => update("jira.baseUrl", e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Email" value={settings.jira.email} onChange={(e) => update("jira.email", e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="API Token" value={settings.jira.token} onChange={(e) => update("jira.token", e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Project Key" value={settings.jira.projectKey} onChange={(e) => update("jira.projectKey", e.target.value)} />

        <button className="btn-primary" onClick={saveSettings}>Save Settings</button>
      </div>
    </div>
  );
}
