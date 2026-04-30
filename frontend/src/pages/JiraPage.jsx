import { useState } from "react";
import api from "../services/api";

export default function JiraPage() {
  const [form, setForm] = useState({ summary: "", description: "", priority: "High" });
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/create-jira-issue", form);
    setResult(data);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Jira Integration</h2>
      <form onSubmit={submit} className="card p-4 space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <textarea className="w-full border p-2 rounded h-28" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <select className="border p-2 rounded" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          <option>Highest</option><option>High</option><option>Medium</option><option>Low</option>
        </select>
        <button className="btn-primary" type="submit">Create Jira Bug</button>
      </form>
      {result && <div className="card p-4">Issue <strong>{result.issueKey}</strong> created. <a href={result.issueUrl} target="_blank">Open Jira</a></div>}
    </div>
  );
}
