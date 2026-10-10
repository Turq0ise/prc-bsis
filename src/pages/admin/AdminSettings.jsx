import { useAdmin } from "../../lib/useAdmin";
import { useAdminQuery } from "../../lib/useAdminQuery";
import { DISPLAY_THRESHOLDS } from "../../lib/adminData";
import { QueryState } from "./AdminUI";

export default function AdminSettings() {
    const { national } = useAdmin();
    const query = useAdminQuery("chapters");
    if (!national) return <section className="admin-panel"><h2 className="font-bold">National administrator access required</h2><p className="mt-3">Portal settings are available to national administrators.</p></section>;
    return <section className="admin-panel space-y-5">
        <div><h2 className="text-xl font-bold">Portal settings</h2><p className="text-sm text-slate-500 mt-1">View the supply display guide and chapter identifiers used by the admin pages.</p></div>
        <section><h3 className="font-semibold mb-3">Supply display guide</h3><div className="grid sm:grid-cols-3 gap-3">{[["Critical", `Below ${DISPLAY_THRESHOLDS.critical_below} units`], ["Low", `Below ${DISPLAY_THRESHOLDS.low_below} units`], ["Surplus", `${DISPLAY_THRESHOLDS.surplus_at} units or more`]].map(([label, value]) => <div className="admin-metric" key={label}><h4 className="font-semibold">{label}</h4><p className="text-sm mt-2">{value}</p></div>)}</div><p className="text-sm text-slate-600 mt-3">These fixed viewing labels are not clinical thresholds or shared inventory rules. Configuration changes are managed by the project owner.</p></section>
        <section><h3 className="font-semibold mb-3">Chapters found in accessible records</h3><QueryState query={query} empty={!query.data?.length}><ul className="grid sm:grid-cols-2 gap-2">{(query.data || []).map((chapter) => <li key={chapter.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">{chapter.name}</li>)}</ul></QueryState></section>
    </section>;
}
