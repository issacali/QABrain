import { useState } from "react";
import api from "../services/api";
import { exportToCsv, exportToPdf } from "../services/exporters";
import { useAppStore } from "../context/store";

const sample = `Feature: Login\nDescription: User should login using email and password.\nAcceptance Criteria:\n- Valid login should succeed\n- Invalid credentials should show error\n- Empty fields should show validation`;

export default function TestCaseGeneratorPage() {
  const [requirement, setRequirement] = useState(sample);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const activeModel = useAppStore((s) => s.settings.ai.activeModel);

  const onGenerate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/generate-testcases", { requirement, model: activeModel });
      setRows(data.testCases || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Test Case Generator</h2>
      <textarea className="w-full h-40 card p-3" value={requirement} onChange={(e) => setRequirement(e.target.value)} />
      <button className="btn-primary" onClick={onGenerate} disabled={loading}>{loading ? "Generating..." : "Generate Test Cases"}</button>
      {!!rows.length && (
        <div className="card p-4 overflow-auto">
          <div className="flex gap-2 mb-3">
            <button className="btn-primary" onClick={() => exportToCsv(rows)}>Export CSV</button>
            <button className="btn-primary" onClick={() => exportToPdf(rows)}>Export PDF</button>
            <button className="btn-primary" onClick={() => navigator.clipboard.writeText(JSON.stringify(rows, null, 2))}>Copy</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left"><th>ID</th><th>Scenario</th><th>Preconditions</th><th>Steps</th><th>Expected</th><th>Type</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td>{r.id}</td><td>{r.scenario}</td><td>{r.preconditions}</td><td>{(r.steps || []).join(" -> ")}</td><td>{r.expectedResult}</td><td>{r.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
