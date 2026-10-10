import { useNavigate } from "react-router-dom";
import {
    Database,
    ArrowDownLeft,
    ArrowUpRight,
    AlertOctagon,
    ArrowRight,
} from "lucide-react";

export default function StaffDashboard() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                        Stored Units{" "}
                        <Database className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-3">
                        284{" "}
                        <span className="text-sm font-normal text-slate-500">
                            units
                        </span>
                    </div>
                    <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                        Capacity normal (72%)
                    </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                        Today's Inflow{" "}
                        <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-black text-emerald-600 mt-3">
                        +18{" "}
                        <span className="text-sm font-normal text-slate-500">
                            units
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                        From Robinsons MBD Drive
                    </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                        Today's Outflow{" "}
                        <ArrowUpRight className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-3xl font-black text-slate-800 mt-3">
                        -12{" "}
                        <span className="text-sm font-normal text-slate-500">
                            units
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                        Dispensed to 4 hospitals
                    </p>
                </div>

                <div className="bg-red-50 p-5 rounded-xl border border-red-200 shadow-sm">
                    <div className="flex justify-between items-center text-prc-red text-xs font-bold uppercase tracking-wider">
                        Critical Alert <AlertOctagon className="w-4 h-4" />
                    </div>
                    <div className="text-xl font-black text-prc-darkred mt-3">
                        O-Neg: 2 Units
                    </div>
                    <p className="text-[11px] text-red-700 font-semibold mt-1">
                        Flagged for targeted callouts
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Branch Supply Table */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">
                            Branch Supply by Component
                        </h3>
                        <button
                            onClick={() => navigate("/staff/ledger")}
                            className="text-xs font-bold text-prc-red hover:underline"
                        >
                            + Log Inflow/Outflow
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="py-2.5 px-3 rounded-l-lg">
                                        Component Type
                                    </th>
                                    <th className="py-2.5 px-3">
                                        Units in Storage
                                    </th>
                                    <th className="py-2.5 px-3">
                                        Public Indicator
                                    </th>
                                    <th className="py-2.5 px-3 text-right rounded-r-lg">
                                        Quick Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="py-3 px-3 font-semibold text-slate-900">
                                        Packed Red Blood Cells (PRBC)
                                    </td>
                                    <td className="py-3 px-3">142 units</td>
                                    <td className="py-3 px-3">
                                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                                            SUFFICIENT
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                        <button
                                            onClick={() =>
                                                navigate("/staff/ledger")
                                            }
                                            className="text-slate-500 hover:text-prc-red font-bold flex items-center justify-end gap-1 w-full"
                                        >
                                            Log{" "}
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-3 font-semibold text-slate-900">
                                        Platelet Concentrates
                                    </td>
                                    <td className="py-3 px-3 font-bold text-prc-red">
                                        18 units
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                                            CRITICAL
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                        <button
                                            onClick={() =>
                                                navigate("/staff/ledger")
                                            }
                                            className="text-slate-500 hover:text-prc-red font-bold flex items-center justify-end gap-1 w-full"
                                        >
                                            Log{" "}
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-3 font-semibold text-slate-900">
                                        Fresh Frozen Plasma (FFP)
                                    </td>
                                    <td className="py-3 px-3">64 units</td>
                                    <td className="py-3 px-3">
                                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                                            SUFFICIENT
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                        <button
                                            onClick={() =>
                                                navigate("/staff/ledger")
                                            }
                                            className="text-slate-500 hover:text-prc-red font-bold flex items-center justify-end gap-1 w-full"
                                        >
                                            Log{" "}
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-3 font-semibold text-slate-900">
                                        Whole Blood
                                    </td>
                                    <td className="py-3 px-3">45 units</td>
                                    <td className="py-3 px-3">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                                            SURPLUS
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                        <button
                                            onClick={() =>
                                                navigate("/staff/ledger")
                                            }
                                            className="text-slate-500 hover:text-prc-red font-bold flex items-center justify-end gap-1 w-full"
                                        >
                                            Log{" "}
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar: Pending Doctor Requests */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                        Pending Doctor Requests
                    </h3>
                    <div className="space-y-3">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-prc-darkred">
                                    REQ-9021
                                </span>
                                <span className="bg-prc-red text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                    STAT
                                </span>
                            </div>
                            <p className="text-sm font-bold text-slate-900">
                                Sofia Isabel Alcantara
                            </p>
                            <p className="text-[11px] text-slate-600 mb-3">
                                The Medical City &bull; 2x PRBC (O+)
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() =>
                                        alert("Allocation process started.")
                                    }
                                    className="bg-prc-red hover:bg-prc-darkred text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                >
                                    Allocate Unit
                                </button>
                                <button className="text-xs text-slate-600 hover:text-slate-900 font-bold px-2 border border-slate-300 bg-white rounded-lg">
                                    View Slip
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-slate-700">
                                    REQ-9018
                                </span>
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                    URGENT
                                </span>
                            </div>
                            <p className="text-sm font-bold text-slate-900">
                                Eduardo Ramos
                            </p>
                            <p className="text-[11px] text-slate-600 mb-3">
                                Pasig City Gen &bull; 1x Platelets (B-)
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => alert("Process started.")}
                                    className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                >
                                    Process
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
