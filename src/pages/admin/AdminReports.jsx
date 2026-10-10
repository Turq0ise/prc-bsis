import { useState } from "react";
import { useAdmin } from "../../lib/useAdmin";
import { useAdminQuery } from "../../lib/useAdminQuery";
import { monthDates, reportCsv, downloadFile, downloadReportPdf } from "../../lib/adminReports";
import { ChapterFilter, QueryState, Metrics } from "./AdminUI";

export default function AdminReports() {
    const { national } = useAdmin();
    const chapters = useAdminQuery("chapters");
    const [chapter, setChapter] = useState("");
    const [month, setMonth] = useState(() => {
        const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit" }).formatToParts(new Date());
        return `${parts.find((p) => p.type === "year").value}-${parts.find((p) => p.type === "month").value}`;
    });
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState("");
    const period = monthDates(month);
    const query = useAdminQuery("report", { p_chapter: chapter || null, p_start: period.start, p_end: period.end });
    const report = query.data;
    async function exportPdf() {
        setExporting(true); setError("");
        try { await downloadReportPdf(report); } catch (err) { setError(`PDF export failed: ${err.message}`); } finally { setExporting(false); }
    }
    return <section className="admin-panel space-y-5">
        <div><h2 className="text-xl font-bold">Branch utilization reports</h2><p className="text-sm text-slate-500 mt-1">UC-11 · Monthly operational summaries</p></div>
        <div className="grid sm:grid-cols-2 gap-3"><ChapterFilter national={national} chapter={chapter} setChapter={setChapter} chapters={chapters.data || []} />
            <label className="admin-field">Reporting month<input type="month" min="1900-01" max="9999-12" value={month} onChange={(e) => { if (e.target.value) { try { monthDates(e.target.value); setMonth(e.target.value); setError(""); } catch (err) { setError(err.message); } } }} /></label></div>
        <QueryState query={query}>
            {report && <>
                <Metrics items={[["Recorded collections", report.totals.collections ?? "Unavailable"], ["Recorded dispenses", report.totals.dispensed ?? "Unavailable"], ["Recorded discards", report.totals.discarded ?? "Unavailable"], ["Requisitions", report.totals.requisitions ?? "Unavailable"]]} />
                {report.screening && <div className="mt-5"><h3 className="font-semibold mb-3">Serological screening</h3><Metrics items={[["Units tested", report.screening.tested], ["Passed", report.screening.passed], ["Failed", report.screening.failed], ["Clearance rate", report.screening.clearance_rate === null ? "No tests" : `${report.screening.clearance_rate}%`]]} /></div>}
                <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Component utilization"><table className="admin-table"><thead><tr>{["Component", "Collections", "Recorded dispenses", "Recorded discards", "Requests", "Requested units", "Current stock"].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{report.components.map((row) => <tr key={row.component}><td className="font-semibold">{row.component}</td>{["collections", "dispensed", "discarded", "requisitions", "units_requested", "remaining"].map((key) => <td key={key}>{row[key] ?? "Unavailable"}</td>)}</tr>)}</tbody></table></div>
                {report.warnings.length > 0 && <div role="status" className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900"><p className="font-semibold">Some report sections are unavailable.</p><ul className="mt-2 list-disc pl-5">{report.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div>}
                <p className="text-sm text-slate-600">{report.notes}</p>
                <p className="text-sm text-slate-500">This is an internal operational summary. The proposal’s certified DOH form requires an approved template and certification process.</p>
                <div className="flex flex-wrap gap-3"><button className="admin-button" onClick={() => downloadFile('\uFEFF' + reportCsv(report), "text/csv;charset=utf-8", `prc-summary-${month}.csv`)}>Export CSV</button><button className="admin-button admin-primary" disabled={exporting} onClick={exportPdf}>{exporting ? "Preparing PDF…" : "Export PDF"}</button><button className="admin-button" onClick={query.reload}>Refresh</button></div>
            </>}
        </QueryState>
        {error && <p role="alert" className="admin-error">{error}</p>}
    </section>;
}
