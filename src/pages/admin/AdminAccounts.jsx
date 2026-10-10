import { useState } from "react";
import { useAdmin } from "../../lib/useAdmin";
import { useAdminQuery } from "../../lib/useAdminQuery";
import { roleLabel } from "../../lib/adminRoles";
import { QueryState, ChapterFilter, Pager } from "./AdminUI";

export default function AdminAccounts() {
    const { national } = useAdmin();
    const chapters = useAdminQuery("chapters");
    const [chapter, setChapter] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const query = useAdminQuery("accounts", { p_chapter: chapter || null, p_search: search.trim(), p_page: page });
    return <section className="admin-panel space-y-5">
        <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-bold">Account directory</h2><p className="text-sm text-slate-500 mt-1">{national ? "View registered accounts and their assigned roles." : "View staff records for your assigned chapter."}</p></div><button className="admin-button" onClick={query.reload}>Refresh</button></div>
        <div className="grid sm:grid-cols-2 gap-3"><ChapterFilter national={national} chapter={chapter} setChapter={(value) => { setChapter(value); setPage(0); }} chapters={chapters.data || []} /><label className="admin-field">Search name<input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} /></label></div>
        <QueryState query={query} empty={!query.data?.rows.length}>
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Registered accounts"><table className="admin-table"><thead><tr>{["User", "Role", "Chapter", "Registered"].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{(query.data?.rows || []).map((account) => <tr key={account.id}><td><p className="font-semibold">{account.full_name || "Unnamed user"}</p><p className="text-xs text-slate-500 break-all">{account.id}</p></td><td>{roleLabel(account.role)}</td><td>{account.chapter_id || "—"}</td><td>{account.created_at ? new Date(account.created_at).toLocaleDateString("en-PH", { timeZone: "Asia/Manila" }) : "Not recorded"}</td></tr>)}</tbody></table></div>
            <Pager page={page} size={25} total={query.data?.total || 0} onChange={setPage} />
        </QueryState>
        <p className="text-sm text-slate-600">This directory is read-only. Contact the project administrator for role, chapter, or account-access changes. Only records available to your signed-in account are shown.</p>
    </section>;
}
