export default function TransferCoord() {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-sm font-bold mb-4">
                Inter-Chapter Transfer Coordination (UC-09)
            </h2>
            <table className="w-full text-left text-xs border-collapse">
                <thead>
                    <tr className="bg-slate-100 text-slate-700">
                        <th className="py-2 px-3">Requesting Branch</th>
                        <th className="py-2 px-3">Needed Component</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    <tr>
                        <td className="py-3 px-3 font-bold">Rizal Chapter</td>
                        <td className="py-3 px-3 font-semibold text-prc-red">
                            5x PRBC (O-)
                        </td>
                        <td className="py-3 px-3">
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                Pending Deficit
                            </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                            <button className="bg-slate-900 text-white px-3 py-1 rounded">
                                Dispatch Units
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
