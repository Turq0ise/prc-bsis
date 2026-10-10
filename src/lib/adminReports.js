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
export function reportColumns(report) {
    return [["collections", "Recorded collections"], ["dispensed", "Recorded dispenses"], ["discarded", "Recorded discards"], ["requisitions", "Requisitions"], ["units_requested", "Units requested"], ["remaining", "Current available stock"]].filter(([key]) => report.components.some((row) => row[key] !== null && row[key] !== undefined));
}
export function reportRows(report) {
    const columns = reportColumns(report);
    return [["Component", ...columns.map(([, label]) => label)],
        ...report.components.map((row) => [row.component, ...columns.map(([key]) => row[key] ?? "—")])];
}
export function reportCsv(report) {
    return [["PRC-BSIS Operational Summary"], ["Scope", report.chapter || "Accessible records"], ["From", report.start], ["Through", report.end],
        ...reportRows(report), ...Object.entries(report.screening || {}).filter(([,value]) => value !== null && value !== undefined).map(([label,value]) => [`Screening ${label}`,value]), ["Generated", report.generated_at], ...report.warnings.map((warning) => ["Data loading issue", warning]), ["Notes", report.notes],
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
    const subtitle = doc.splitTextToSize(`${report.chapter || "Accessible records"} | ${report.start} through ${report.end} | Philippine time`, 265);
    doc.text(subtitle, 14, 27);
    const [head, ...body] = reportRows(report);
    autoTable(doc, { startY: Math.max(34, 27 + subtitle.length * 5), head: [head], body, styles: { fontSize: 9 }, headStyles: { fillColor: [237, 27, 36] }, margin: { bottom: 30 } });
    if (report.screening) {
        const entries = [["Units tested", report.screening.tested], ["Passed", report.screening.passed], ["Failed", report.screening.failed], ["Clearance rate", report.screening.clearance_rate === null ? null : `${report.screening.clearance_rate}%`]].filter(([,value]) => value !== null && value !== undefined);
        autoTable(doc, { startY: doc.lastAutoTable.finalY + 10, head: [entries.map(([label]) => label)], body: [entries.map(([,value]) => value)], styles: { fontSize: 9 }, headStyles: { fillColor: [15, 23, 42] }, margin: { bottom: 30 } });
    }
    const notes = `${report.notes} ${report.warnings.join(" ")} Internal operational summary; not a certified regulatory form.`;
    const lines = doc.splitTextToSize(notes, 265);
    let y = doc.lastAutoTable.finalY + 12;
    if (y + lines.length * 5 > 195) { doc.addPage(); y = 20; }
    doc.text(lines, 14, y);
    doc.save(`prc-summary-${report.start}.pdf`);
}
