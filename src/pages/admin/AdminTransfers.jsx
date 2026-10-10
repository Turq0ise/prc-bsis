import { useState } from "react";
import { useAdmin } from "../../lib/useAdmin";
import { useAdminQuery } from "../../lib/useAdminQuery";
import { ChapterFilter, QueryState, Pager } from "./AdminUI";

export default function AdminTransfers() {
    const { national } = useAdmin();
    const chapters = useAdminQuery("chapters");
    const [chapter, setChapter] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(0);
    const query = useAdminQuery("transfers", { p_chapter: chapter || null, p_status: status || null, p_page: page });
    return <section className="admin-panel space-y-5">
        <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-bold">Transfer oversight</h2><p className="text-sm text-slate-500 mt-1">Monitor replenishment requests and chapter-to-chapter coordination</p></div><button className="admin-button" onClick={query.reload}>Refresh</button></div>
        <div className="grid sm:grid-cols-2 gap-3"><ChapterFilter national={national} chapter={chapter} setChapter={(value) => { setChapter(value); setPage(0); }} chapters={chapters.data || []} /><label className="admin-field">Status<input value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} placeholder="Filter by recorded status" /></label></div>
        <QueryState query={query} empty={!query.data?.rows.length}>
            <div className="overflow-x-auto"><table className="admin-table"><thead><tr>{["Requested", "Requesting chapter", "Supplying chapter", "Component", "Status", "Reference"].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{(query.data?.rows || []).map((row) => <tr key={row.id}><td>{row.requested_at ? new Date(row.requested_at).toLocaleString("en-PH", { timeZone: "Asia/Manila" }) : "—"}</td><td>{row.requesting_chapter}</td><td>{row.supplying_chapter}</td><td>{row.component_needed || "—"}</td><td className="font-semibold">{row.status || "—"}</td><td className="text-xs break-all">{row.id}</td></tr>)}</tbody></table></div>
            <Pager page={page} size={25} total={query.data?.total || 0} onChange={setPage} />
        </QueryState>
        <p className="text-sm text-slate-500">Chapter staff record transfer requests and actual movements. Admins review their progress here; a request does not itself move inventory.</p>
    </section>;
}
