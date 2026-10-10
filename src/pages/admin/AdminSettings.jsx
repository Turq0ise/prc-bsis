import { useAdmin } from "../../lib/useAdmin";
import { useAdminQuery } from "../../lib/useAdminQuery";
import { roleLabel } from "../../lib/adminRoles";
import { QueryState } from "./AdminUI";

export default function AdminSettings() {
    const { national, profile } = useAdmin();
    const query = useAdminQuery("chapters");
    if (!national) return <section className="admin-panel"><h2 className="font-bold">National administrator access required</h2><p className="mt-3">Portal information is available to national administrators.</p></section>;
    const details = [["Name", profile.full_name], ["User ID", profile.id], ["Role", roleLabel(profile.role)], ["Assigned chapter", profile.chapter_id]].filter(([,value]) => value);
    return <section className="admin-panel space-y-5">
        <div><h2 className="text-xl font-bold">Portal information</h2><p className="text-sm text-slate-500 mt-1">Your administrator profile and chapter identifiers found in accessible records.</p></div>
        <section><h3 className="font-semibold mb-3">Signed-in administrator</h3><dl className="grid sm:grid-cols-2 gap-3">{details.map(([label,value]) => <div className="admin-metric" key={label}><dt className="text-sm text-slate-600">{label}</dt><dd className="mt-2 font-semibold break-all">{value}</dd></div>)}</dl></section>
        <section><h3 className="font-semibold mb-3">Recorded chapters</h3><QueryState query={query} empty={!query.data?.length}><ul className="grid sm:grid-cols-2 gap-2">{(query.data || []).map((chapter) => <li key={chapter.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">{chapter.name}</li>)}</ul></QueryState></section>
    </section>;
}
