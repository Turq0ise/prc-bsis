export function QueryState({ query, empty, children }) {
    if (query.loading) return <p role="status" className="py-8 text-slate-600">Loading…</p>;
    if (query.error) return <div role="alert" className="admin-error"><p>{query.error}</p><button className="admin-button mt-3" onClick={query.reload}>Try again</button></div>;
    if (empty) return <p className="py-8 text-slate-600">No records match this selection.</p>;
    return children;
}
export function ChapterFilter({ national, chapter, setChapter, chapters = [] }) {
    if (!national || !chapters.length) return null;
    return <label className="admin-field">Chapter<select value={chapter} onChange={(event) => setChapter(event.target.value)}><option value="">All chapters</option>{chapters.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>;
}
export function Pager({ page, total, size, onChange }) {
    const pages = Math.max(1, Math.ceil(total / size));
    return <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-sm">
        <p>{total} records · Page {page + 1} of {pages}</p><div className="flex gap-2">
            <button className="admin-button" disabled={page === 0} onClick={() => onChange(page - 1)}>Previous</button>
            <button className="admin-button" disabled={page + 1 >= pages} onClick={() => onChange(page + 1)}>Next</button>
        </div>
    </div>;
}
export function Metrics({ items }) {
    return <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{items.map(([label, value]) => <div key={label} className="admin-metric"><p className="text-sm text-slate-600">{label}</p><p className="text-2xl font-bold mt-2">{value ?? "—"}</p></div>)}</div>;
}
