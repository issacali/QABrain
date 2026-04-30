import jsPDF from "jspdf";

export function exportToCsv(rows) {
  const header = ["id", "scenario", "preconditions", "steps", "expectedResult", "type"];
  const lines = rows.map((r) => [r.id, r.scenario, r.preconditions, (r.steps || []).join(" | "), r.expectedResult, r.type]);
  const csv = [header, ...lines].map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "test-cases.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToPdf(rows) {
  const doc = new jsPDF();
  let y = 10;
  rows.forEach((r, i) => {
    doc.text(`${i + 1}. ${r.id} - ${r.scenario}`, 10, y);
    y += 8;
    doc.text(`Expected: ${r.expectedResult}`, 10, y);
    y += 10;
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });
  doc.save("test-cases.pdf");
}
