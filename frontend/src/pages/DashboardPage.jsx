import { useEffect } from "react";
import { useAppStore } from "../context/store";

function Card({ title, value }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { stats, fetchStats } = useAppStore();
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Total Test Cases Generated" value={stats.testCases} />
        <Card title="Total Defects Created" value={stats.defects} />
        <Card title="Jira Bugs Logged" value={stats.jira} />
        <Card title="Active AI Model" value={stats.activeModel} />
      </div>
    </div>
  );
}
