import { useState } from "react";
import { useAdmin } from "../../lib/useAdmin";
import { useAdminQuery } from "../../lib/useAdminQuery";
import { ChapterFilter, QueryState, Metrics, Pager } from "./AdminUI";

const badge = { Critical: "bg-red-100 text-red-800", Low: "bg-amber-100 text-amber-900", Sufficient: "bg-emerald-100 text-emerald-800", Surplus: "bg-blue-100 text-blue-800" };
export default function SupplyMonitor() {
    const { national } = useAdmin();
    const chapters = useAdminQuery("chapters");
    const [chapter, setChapter] = useState("");
    const [component, setComponent] = useState("");
    const [tier, setTier] = useState("");
    const [blood, setBlood] = useState("");
    const [page, setPage] = useState(0);
    const query = useAdminQuery("supply", { p_chapter: chapter || null });
    const rows = (query.data?.rows || []).filter((row) => (!component || row.component === component) && (!tier || row.tier === tier) && (!blood || row.blood_group === blood));
    const update = (setter, value) => { setter(value); setPage(0); };
    return <section className="admin-panel space-y-5">
        <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-bold">Supply monitoring</h2><p className="text-sm text-slate-500 mt-1">Recorded inventory and available supply breakdowns</p></div><button className="admin-button" onClick={query.reload}>Refresh</button></div>
        {!query.data?.breakdown_unavailable && <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <ChapterFilter national={national} chapter={chapter} setChapter={(value) => update(setChapter, value)} chapters={chapters.data || []} />
            <label className="admin-field">Component<select value={component} onChange={(e) => update(setComponent, e.target.value)}><option value="">All components</option>{["Whole Blood", "PRBC", "Platelets", "FFP", "Cryoprecipitate", "Other"].map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="admin-field">Blood group<select value={blood} onChange={(e) => update(setBlood, e.target.value)}><option value="">All blood groups</option>{["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="admin-field">Supply tier<select value={tier} onChange={(e) => update(setTier, e.target.value)}><option value="">All tiers</option>{Object.keys(badge).map((value) => <option key={value}>{value}</option>)}</select></label>
        </div>}
        <QueryState query={query}>
            {query.data?.breakdown_unavailable ? <>
                <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">The existing inventory table has no chapter, blood-group, or expiry fields. A usable supply breakdown is unavailable. Below are the recorded inventory units.</p>
                <Metrics items={[["Recorded inventory units", query.data.recorded_units]]} />
                {query.data.inventory_rows.length ? <div className="overflow-x-auto"><table className="admin-table"><thead><tr>{["Unit ID", "Component", "Recorded status", "Collection date"].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{query.data.inventory_rows.slice(page * 25, (page + 1) * 25).map((unit) => <tr key={unit.unit_id}><td>{unit.unit_id}</td><td>{unit.component_type || "Not recorded"}</td><td>{unit.status || "Not recorded"}</td><td>{unit.collection_date ? new Date(unit.collection_date).toLocaleDateString("en-PH", { timeZone: "Asia/Manila" }) : "Not recorded"}</td></tr>)}</tbody></table><Pager page={page} size={25} total={query.data.recorded_units} onChange={setPage} /></div> : <p className="text-sm text-slate-600">No inventory records are visible to your account.</p>}
            </> : <>
            <Metrics items={[["Available units", query.data?.total_available], ["Critical combinations", query.data?.critical_count], ["Low combinations", query.data?.low_count], ["Chapters", query.data?.chapter_count]]} />
            <p className="text-sm text-slate-600 my-4">Display guide: Critical below {query.data?.thresholds.critical_below}, Low below {query.data?.thresholds.low_below}, Surplus at {query.data?.thresholds.surplus_at} units. These labels are a viewing guide for this portal. {query.data?.unknown_expiry || 0} available units have no valid expiry date and are excluded. {query.data?.invalid_group || 0} available units have an unrecognized blood group and need correction.</p>
            {rows.length === 0 ? <p className="py-6 text-slate-500">No supply records match these filters.</p> : <><div className="overflow-x-auto"><table className="admin-table"><thead><tr>{["Chapter", "Blood group", "Component", "Available units", "Supply tier"].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{rows.slice(page * 25, (page + 1) * 25).map((row) => <tr key={`${row.chapter_id}-${row.blood_group}-${row.component}`}><td>{row.chapter_name}</td><td className="font-semibold">{row.blood_group}</td><td>{row.component}</td><td>{row.units}</td><td><span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${badge[row.tier]}`}>{row.tier}</span></td></tr>)}</tbody></table></div><Pager page={page} size={25} total={rows.length} onChange={setPage} /></>}
            </>}
        </QueryState>
    </section>;
}
