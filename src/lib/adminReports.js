export function monthDates(month) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error("Choose a valid month.");
    const [year, value] = month.split("-").map(Number);
    if (year < 1900) throw new Error("Choose a year from 1900 onward.");
    const last = new Date(Date.UTC(year, value, 0)).getUTCDate();
    return { start: `${month}-01`, end: `${month}-${String(last).padStart(2, "0")}` };
}
export function csvCell(value) {
    let text = String(value ?? "");
    if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
}
export function reportRows(report) {
    return [["Component", "Recorded collections", "Recorded dispenses", "Recorded discards", "Requisitions", "Units requested", "Current available stock"],
        ...report.components.map((row) => [row.component, ...["collections", "dispensed", "discarded", "requisitions", "units_requested", "remaining"].map((key) => row[key] ?? "Unavailable")])];
}
export function reportCsv(report) {
    return [["PRC-BSIS Operational Summary"], ["Chapter", report.chapter || "All chapters"], ["From", report.start], ["Through", report.end],
        ...reportRows(report), ...Object.entries(report.screening || {}).map(([label,value]) => [`Screening ${label}`,value ?? "Unavailable"]), ["Generated", report.generated_at], ...report.warnings.map((warning) => ["Unavailable section", warning]), ["Notes", report.notes],
    ].map((row) => row.map(csvCell).join(",")).join("\r\n");
}
export function downloadFile(content, type, name) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a"); link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function downloadReportPdf(report) {
    const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(18); doc.text("PRC-BSIS Operational Summary", 14, 18);
    doc.setFontSize(10);
    const subtitle = doc.splitTextToSize(`${report.chapter || "All chapters"} | ${report.start} through ${report.end} | Philippine time`, 265);
    doc.text(subtitle, 14, 27);
    const [head, ...body] = reportRows(report);
    autoTable(doc, { startY: Math.max(34, 27 + subtitle.length * 5), head: [head], body, styles: { fontSize: 9 }, headStyles: { fillColor: [237, 27, 36] }, margin: { bottom: 30 } });
    if (report.screening) {
        autoTable(doc, { startY: doc.lastAutoTable.finalY + 10, head: [["Units tested", "Passed", "Failed", "Clearance rate"]], body: [[report.screening.tested, report.screening.passed, report.screening.failed, report.screening.clearance_rate === null ? "No tests" : `${report.screening.clearance_rate}%`]], styles: { fontSize: 9 }, headStyles: { fillColor: [15, 23, 42] }, margin: { bottom: 30 } });
    }
    const notes = `${report.notes} ${report.warnings.join(" ")} Internal operational summary; not a certified regulatory form.`;
    const lines = doc.splitTextToSize(notes, 265);
    let y = doc.lastAutoTable.finalY + 12;
    if (y + lines.length * 5 > 195) { doc.addPage(); y = 20; }
    doc.text(lines, 14, y);
    doc.save(`prc-summary-${report.start}.pdf`);
}
