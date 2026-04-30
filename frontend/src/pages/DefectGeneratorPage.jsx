import { useState } from "react";
import api from "../services/api";

export default function DefectGeneratorPage() {
  const [scenario, setScenario] = useState("Login fails with valid credentials");
  const [defect, setDefect] = useState(null);
  const [loading, setLoading] = useState(false);

  const onGenerate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/generate-defect", { scenario });
      setDefect(data.defect);
    } finally {
      setLoading(false);
    }
  };

  const onCreateJira = async () => {
    if (!defect) return;
    await api.post("/create-jira-issue", {
      summary: defect.summary,
      description: `Steps: ${(defect.stepsToReproduce || []).join("\\n")}\\nExpected: ${defect.expectedResult}\\nActual: ${defect.actualResult}`,
      priority: defect.priority || "High"
    });
    alert("Jira bug created");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">AI Defect Generator</h2>
      <textarea className="w-full h-36 card p-3" value={scenario} onChange={(e) => setScenario(e.target.value)} />
      <button className="btn-primary" onClick={onGenerate} disabled={loading}>{loading ? "Generating..." : "Generate Defect"}</button>
      {defect && (
        <div className="card p-4 space-y-2">
          <p><strong>Summary:</strong> {defect.summary}</p>
          <p><strong>Steps:</strong> {(defect.stepsToReproduce || []).join(" -> ")}</p>
          <p><strong>Expected:</strong> {defect.expectedResult}</p>
          <p><strong>Actual:</strong> {defect.actualResult}</p>
          <p><strong>Severity:</strong> {defect.severity} | <strong>Priority:</strong> {defect.priority}</p>
          <p><strong>Environment:</strong> {defect.environment}</p>
          <p><strong>Root Cause:</strong> {defect.rootCause}</p>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={() => navigator.clipboard.writeText(JSON.stringify(defect, null, 2))}>Copy</button>
            <button className="btn-primary" onClick={onCreateJira}>Create Jira Bug</button>
          </div>
        </div>
      )}
    </div>
  );
}
