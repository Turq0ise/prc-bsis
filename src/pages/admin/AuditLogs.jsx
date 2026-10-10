export default function AuditLogs() {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-sm font-bold mb-4">
                System Transaction Audit Logs (UC-10)
            </h2>
            <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                    <tr className="bg-slate-100 text-slate-700">
                        <th className="py-2 px-3">Timestamp</th>
                        <th className="py-2 px-3">User ID</th>
                        <th className="py-2 px-3">Action</th>
                        <th className="py-2 px-3">Table</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    <tr>
                        <td className="py-3 px-3">2026-10-10 14:20:00</td>
                        <td className="py-3 px-3 text-slate-500">
                            M. Reyes (Staff)
                        </td>
                        <td className="py-3 px-3 text-emerald-600 font-bold">
                            UPDATE
                        </td>
                        <td className="py-3 px-3">blood_units</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
