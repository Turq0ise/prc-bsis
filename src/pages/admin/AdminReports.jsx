import { useState } from "react";
import { useAdmin } from "../../lib/useAdmin";
import { useAdminQuery } from "../../lib/useAdminQuery";
import { monthDates, reportColumns, reportCsv, downloadFile, downloadReportPdf } from "../../lib/adminReports";
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
    const columns = report ? reportColumns(report) : [];
    async function exportPdf() {
        setExporting(true); setError("");
        try { await downloadReportPdf(report); } catch (err) { setError(`PDF export failed: ${err.message}`); } finally { setExporting(false); }
    }
    return <section className="admin-panel space-y-5">
        <div><h2 className="text-xl font-bold">Monthly reports</h2><p className="text-sm text-slate-500 mt-1">Recorded activity for the selected month · Philippine time</p></div>
        <div className="grid sm:grid-cols-2 gap-3"><ChapterFilter national={national} chapter={chapter} setChapter={setChapter} chapters={chapters.data || []} />
            <label className="admin-field">Reporting month<input type="month" min="1900-01" max="9999-12" value={month} onChange={(e) => { if (e.target.value) { try { monthDates(e.target.value); setMonth(e.target.value); setError(""); } catch (err) { setError(err.message); } } }} /></label></div>
        <QueryState query={query}>
            {report && <>
                <Metrics items={[["Recorded collections", report.totals.collections], ["Recorded dispenses", report.totals.dispensed], ["Recorded discards", report.totals.discarded], ["Requisitions", report.totals.requisitions]].filter(([,value]) => value !== null && value !== undefined)} />
                {report.screening && <div className="mt-5"><h3 className="font-semibold mb-3">Serological screening</h3><Metrics items={[["Units tested", report.screening.tested], ["Passed", report.screening.passed], ["Failed", report.screening.failed], ["Clearance rate", report.screening.clearance_rate === null ? null : `${report.screening.clearance_rate}%`]].filter(([,value]) => value !== null && value !== undefined)} /></div>}
                {columns.length > 0 && <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Component utilization"><table className="admin-table"><thead><tr><th scope="col">Component</th>{columns.map(([key,label]) => <th scope="col" key={key}>{label}</th>)}</tr></thead><tbody>{report.components.map((row) => <tr key={row.component}><td className="font-semibold">{row.component}</td>{columns.map(([key]) => <td key={key}>{row[key] ?? "—"}</td>)}</tr>)}</tbody></table></div>}
                {report.warnings.length > 0 && <div role="alert" className="admin-error"><p className="font-semibold">Some data could not be loaded. This report is partial.</p><ul className="mt-2 list-disc pl-5">{report.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div>}
                <p className="text-sm text-slate-600">{report.notes}</p>
                <p className="text-sm text-slate-500">This is an internal operational summary. The proposal’s certified DOH form requires an approved template and certification process.</p>
                <div className="flex flex-wrap gap-3"><button className="admin-button" onClick={() => downloadFile('\uFEFF' + reportCsv(report), "text/csv;charset=utf-8", `prc-summary-${month}.csv`)}>Export CSV</button><button className="admin-button admin-primary" disabled={exporting} onClick={exportPdf}>{exporting ? "Preparing PDF…" : "Export PDF"}</button><button className="admin-button" onClick={query.reload}>Refresh</button></div>
            </>}
        </QueryState>
        {error && <p role="alert" className="admin-error">{error}</p>}
    </section>;
}
