import { useState } from "react";
import { useAdmin } from "../../lib/useAdmin";
import { useAdminQuery } from "../../lib/useAdminQuery";
import { bloodGroup, componentName } from "../../lib/adminData";
import { ChapterFilter, QueryState, Metrics, Pager } from "./AdminUI";

const badge = { Critical: "bg-red-100 text-red-800", Low: "bg-amber-100 text-amber-900", Sufficient: "bg-emerald-100 text-emerald-800", Surplus: "bg-blue-100 text-blue-800" };
const dateLabel = (value) => value && Number.isFinite(new Date(value).getTime()) ? new Date(value).toLocaleDateString("en-PH", { timeZone: "Asia/Manila" }) : "—";
export default function SupplyMonitor() {
    const { national } = useAdmin();
    const chapters = useAdminQuery("chapters");
    const [chapter, setChapter] = useState("");
    const [component, setComponent] = useState("");
    const [tier, setTier] = useState("");
    const [blood, setBlood] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(0);
    const query = useAdminQuery("supply", { p_chapter: chapter || null });
    const data = query.data;
    const overview = data?.breakdown_unavailable;
    const inventoryRows = (data?.inventory_rows || []).filter((unit) => (!search.trim() || String(unit.unit_id || unit.isbt_barcode || "").toLowerCase().includes(search.trim().toLowerCase())) && (!component || componentName(unit.component_type) === component) && (!status || String(unit.status).toLowerCase() === status.toLowerCase()));
    const supplyRows = (data?.rows || []).filter((row) => (!component || row.component === component) && (!tier || row.tier === tier) && (!blood || row.blood_group === blood));
    const rows = overview ? inventoryRows : supplyRows;
    const currentPage = Math.min(page, Math.max(0, Math.ceil(rows.length / 25) - 1));
    const update = (setter, value) => { setter(value); setPage(0); };
    const components = overview ? [...new Set((data.inventory_rows || []).map((unit) => componentName(unit.component_type)))].sort() : ["Whole Blood", "PRBC", "Platelets", "FFP", "Cryoprecipitate", "Other"];
    const hasChapter = data?.inventory_rows?.some((unit) => unit.current_chapter);
    const hasGroup = data?.inventory_rows?.some((unit) => bloodGroup(unit) || unit.blood_group || unit.blood_type);
    const hasExpiry = data?.inventory_rows?.some((unit) => unit.expiration_date);
    return <section className="admin-panel space-y-5">
        <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-bold">Inventory overview</h2><p className="text-sm text-slate-500 mt-1">Recorded blood units, components, and statuses</p></div><button className="admin-button" onClick={query.reload}>Refresh</button></div>
        <QueryState query={query}>
            {overview ? <>
                <Metrics items={[["Recorded units", data.recorded_units], ["Cleared / available status", data.cleared_units], ["Dispensed / dispatched status", data.dispensed_units], ["Quarantined status", data.quarantined_units]]} />
                <p className="text-sm text-slate-600">These totals describe the recorded statuses of the inventory units.</p>
                <div className="grid sm:grid-cols-3 gap-3">
                    <label className="admin-field">Search unit ID<input value={search} onChange={(event) => update(setSearch, event.target.value)} placeholder="Enter a unit ID" /></label>
                    <label className="admin-field">Component<select value={component} onChange={(event) => update(setComponent, event.target.value)}><option value="">All components</option>{components.map((value) => <option key={value}>{value}</option>)}</select></label>
                    <label className="admin-field">Recorded status<select value={status} onChange={(event) => update(setStatus, event.target.value)}><option value="">All statuses</option>{data.statuses.map((value) => <option key={value}>{value}</option>)}</select></label>
                </div>
                {rows.length ? <>
                    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Recorded inventory"><table className="admin-table"><thead><tr><th scope="col">Unit ID</th><th scope="col">Component</th><th scope="col">Recorded status</th><th scope="col">Collection date</th>{hasChapter && <th scope="col">Chapter</th>}{hasGroup && <th scope="col">Blood group</th>}{hasExpiry && <th scope="col">Expiry date</th>}</tr></thead><tbody>{rows.slice(currentPage * 25, (currentPage + 1) * 25).map((unit) => <tr key={unit.unit_id}><td>{unit.unit_id}</td><td>{unit.component_type || "—"}</td><td>{unit.status || "—"}</td><td>{dateLabel(unit.collection_date)}</td>{hasChapter && <td>{unit.current_chapter || "—"}</td>}{hasGroup && <td>{bloodGroup(unit) || unit.blood_group || unit.blood_type || "—"}</td>}{hasExpiry && <td>{dateLabel(unit.expiration_date)}</td>}</tr>)}</tbody></table></div>
                    <Pager page={currentPage} size={25} total={rows.length} onChange={setPage} />
                </> : <p className="py-6 text-slate-600">No inventory records match this selection.</p>}
            </> : <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <ChapterFilter national={national} chapter={chapter} setChapter={(value) => update(setChapter, value)} chapters={chapters.data || []} />
                    <label className="admin-field">Component<select value={component} onChange={(event) => update(setComponent, event.target.value)}><option value="">All components</option>{components.map((value) => <option key={value}>{value}</option>)}</select></label>
                    <label className="admin-field">Blood group<select value={blood} onChange={(event) => update(setBlood, event.target.value)}><option value="">All blood groups</option>{["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((value) => <option key={value}>{value}</option>)}</select></label>
                    <label className="admin-field">Supply tier<select value={tier} onChange={(event) => update(setTier, event.target.value)}><option value="">All tiers</option>{Object.keys(badge).map((value) => <option key={value}>{value}</option>)}</select></label>
                </div>
                <Metrics items={[["Available units", data?.total_available], ["Critical combinations", data?.critical_count], ["Low combinations", data?.low_count], ["Chapters", data?.chapter_count]]} />
                <p className="text-sm text-slate-600">Counts include available or cleared units with valid future expiry dates. Display guide: Critical below {data?.thresholds.critical_below}, Low below {data?.thresholds.low_below}, Surplus at {data?.thresholds.surplus_at} units. {data?.unknown_expiry || 0} units have no valid expiry date and are excluded. {data?.invalid_group || 0} units have an unrecognized blood group and are excluded.</p>
                {rows.length ? <><div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Supply breakdown"><table className="admin-table"><thead><tr>{["Chapter", "Blood group", "Component", "Available units", "Supply tier"].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{rows.slice(currentPage * 25, (currentPage + 1) * 25).map((row) => <tr key={`${row.chapter_id}-${row.blood_group}-${row.component}`}><td>{row.chapter_name}</td><td className="font-semibold">{row.blood_group}</td><td>{row.component}</td><td>{row.units}</td><td><span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${badge[row.tier]}`}>{row.tier}</span></td></tr>)}</tbody></table></div><Pager page={currentPage} size={25} total={rows.length} onChange={setPage} /></> : <p className="py-6 text-slate-600">No inventory records match this selection.</p>}
            </>}
        </QueryState>
    </section>;
}
