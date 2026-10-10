import { Download } from "lucide-react";

export default function InventoryLedger() {
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                <div>
                    <h2 className="text-sm font-bold">
                        Chapter Inflow & Outflow Transaction Ledger
                    </h2>
                    <p className="text-xs text-slate-400">
                        Rizal Chapter - Pasig Branch
                    </p>
                </div>
                <button className="bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium">
                    <Download className="w-3.5 h-3.5" /> Export Audit
                </button>
            </div>

            <div className="bg-slate-50 border-b border-slate-200 p-5">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                    Record Supply Transaction
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Type
                        </label>
                        <select className="w-full text-xs border border-slate-300 rounded-md p-2 font-bold text-emerald-700">
                            <option>INFLOW</option>
                            <option>OUTFLOW</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Blood Type
                        </label>
                        <select className="w-full text-xs border border-slate-300 rounded-md p-2">
                            <option>O+</option>
                            <option>O-</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Component
                        </label>
                        <select className="w-full text-xs border border-slate-300 rounded-md p-2">
                            <option>Packed Red Blood Cells</option>
                            <option>Platelets</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Quantity
                        </label>
                        <input
                            type="number"
                            defaultValue="1"
                            className="w-full text-xs border border-slate-300 rounded-md p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Ref ID
                        </label>
                        <input
                            type="text"
                            className="w-full text-xs border border-slate-300 rounded-md p-2"
                        />
                    </div>
                    <button className="w-full bg-emerald-600 text-white text-xs font-bold py-2 rounded-md">
                        Commit Entry
                    </button>
                </div>
            </div>

            <div className="p-5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Recent History
                </h3>
                <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                            <th className="py-2 px-3">Log ID</th>
                            <th className="py-2 px-3">Type</th>
                            <th className="py-2 px-3">Component</th>
                            <th className="py-2 px-3">Qty</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        <tr>
                            <td className="py-2.5 px-3 font-bold text-slate-800">
                                LOG-4412
                            </td>
                            <td className="py-2.5 px-3">
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                                    INFLOW
                                </span>
                            </td>
                            <td className="py-2.5 px-3 font-sans font-semibold">
                                Platelets (O+)
                            </td>
                            <td className="py-2.5 px-3 font-bold text-emerald-700">
                                +6 Units
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
