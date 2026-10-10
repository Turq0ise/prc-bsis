import { useState } from "react";
import { useAdmin } from "../../lib/useAdmin";
import { useAdminQuery } from "../../lib/useAdminQuery";
import { QueryState, ChapterFilter, Pager } from "./AdminUI";

const timestamp = (value) => value ? new Date(value).toLocaleString("en-PH", { timeZone: "Asia/Manila" }) : "—";
export default function AuditLogs() {
    const { national } = useAdmin();
    const chapters = useAdminQuery("chapters");
    const [filters, setFilters] = useState({ chapter: "", action: "", table: "", user: "", from: "", to: "" });
    const [page, setPage] = useState(0);
    const [snapshot, setSnapshot] = useState(() => new Date().toISOString());
    const [selected, setSelected] = useState(null);
    const query = useAdminQuery("audit", {
        p_chapter: filters.chapter || null, p_action: filters.action || null, p_table: filters.table || null,
        p_user: filters.user.trim() || null, p_from: filters.from || null, p_to: filters.to || null,
        p_page: page, p_snapshot: snapshot,
    });
    const update = (key, value) => { setFilters((old) => ({ ...old, [key]: value })); setPage(0); setSelected(null); setSnapshot(new Date().toISOString()); };
    const rows = query.data?.rows || [];
    const hasChapter = rows.some((log) => log.chapter_id || log.related_chapter_id);
    return <section className="admin-panel">
        <div className="flex flex-wrap justify-between gap-3 mb-5"><div><h2 className="text-xl font-bold">Transaction audit logs</h2><p className="text-sm text-slate-500 mt-1">UC-10 · Recorded activity · Philippine time (UTC+8)</p></div>
            <button className="admin-button" onClick={() => { setPage(0); setSelected(null); setSnapshot(new Date().toISOString()); }}>Refresh</button></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <ChapterFilter national={national} chapter={filters.chapter} setChapter={(value) => update("chapter", value)} chapters={chapters.data || []} />
            <label className="admin-field">Action<select value={filters.action} onChange={(e) => update("action", e.target.value)}><option value="">All actions</option>{["INSERT", "UPDATE", "DELETE", "READ", "ACCESS"].map((action) => <option key={action}>{action}</option>)}</select></label>
            <label className="admin-field">Table<select value={filters.table} onChange={(e) => update("table", e.target.value)}><option value="">All tables</option>{["blood_units", "requisitions", "transfers", "serological_tests", "profiles", "audit_logs"].map((table) => <option key={table}>{table}</option>)}</select></label>
            <label className="admin-field">Full user ID<input value={filters.user} onChange={(e) => update("user", e.target.value)} placeholder="Paste the complete user UUID" /></label>
            <label className="admin-field">From date<input type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => update("from", e.target.value)} /></label>
            <label className="admin-field">Through date<input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => update("to", e.target.value)} /></label>
        </div>
        <QueryState query={query} empty={rows.length === 0}>
            <p className="sm:hidden text-xs text-slate-500 mb-2">Scroll the table sideways to view all columns.</p>
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Audit transactions"><table className="admin-table"><thead><tr>{["Timestamp", "User", ...(hasChapter ? ["Chapter"] : []), "Action", "Table", "Details"].map((title) => <th scope="col" key={title}>{title}</th>)}</tr></thead><tbody>
                {rows.map((log) => <tr key={log.log_id}><td className="whitespace-nowrap">{timestamp(log.logged_at)}</td><td>{log.actor_name && <p>{log.actor_name}</p>}<p className="font-mono text-xs text-slate-500 break-all">{log.user_id || "—"}</p></td>{hasChapter && <td>{log.chapter_id || "—"}{log.related_chapter_id && <p className="text-xs text-slate-500">↔ {log.related_chapter_id}</p>}</td>}<td className="font-semibold">{log.action_type}</td><td>{log.table_name}</td><td><button aria-expanded={selected?.log_id === log.log_id} className="admin-button" onClick={() => setSelected(selected?.log_id === log.log_id ? null : log)}>View</button></td></tr>)}
            </tbody></table></div>
            <Pager page={page} size={25} total={query.data?.total || 0} onChange={(next) => { setPage(next); setSelected(null); }} />
        </QueryState>
        {selected && !query.loading && !query.error && <section aria-label="Audit record details" className="mt-6 border-t pt-5">
            <div className="flex justify-between gap-3"><h3 className="font-bold">Record details</h3><button className="admin-button" onClick={() => setSelected(null)}>Close details</button></div>
            <p className="text-sm text-slate-600 mt-3 break-all">Log {selected.log_id}{selected.ip_address && ` · IP: ${selected.ip_address}`}{selected.device_info && ` · Device: ${selected.device_info}`}</p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">{[["Before", selected.old_data], ["After", selected.new_data]].map(([label, data]) => <div key={label}><h4 className="font-semibold mb-2">{label}</h4><pre className="text-xs bg-slate-50 rounded-lg p-4 overflow-auto max-h-80">{JSON.stringify(data, null, 2) || "No value"}</pre></div>)}</div>
        </section>}
    </section>;
}
