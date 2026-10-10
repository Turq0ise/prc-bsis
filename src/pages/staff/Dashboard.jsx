import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
    Database,
    ArrowDownLeft,
    ArrowUpRight,
    AlertOctagon,
} from "lucide-react";

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        total: 0,
        prbc: 0,
        platelets: 0,
        ffp: 0,
        wholeBlood: 0,
        inflowToday: 0,
        outflowToday: 0,
    });
    const [pendingRequests, setPendingRequests] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

            // Fetch live inventory
            const { data: units } = await supabase
                .from("blood_units")
                .select("*");

            if (units) {
                const clearedUnits = units.filter(
                    (u) => u.status === "cleared",
                );
                const inflow = units.filter(
                    (u) => u.collection_date === today,
                ).length;
                const outflow = units.filter(
                    (u) =>
                        u.status === "dispatched" &&
                        u.updated_at?.includes(today),
                ).length;

                setMetrics({
                    total: clearedUnits.length,
                    prbc: clearedUnits.filter(
                        (u) => u.component_type === "PRBC",
                    ).length,
                    platelets: clearedUnits.filter(
                        (u) => u.component_type === "Platelets",
                    ).length,
                    ffp: clearedUnits.filter((u) => u.component_type === "FFP")
                        .length,
                    wholeBlood: clearedUnits.filter(
                        (u) => u.component_type === "Whole Blood",
                    ).length,
                    inflowToday: inflow,
                    outflowToday: outflow,
                });
            }

            // Fetch pending requests
            const { data: requests } = await supabase
                .from("requests")
                .select("*")
                .eq("status", "pending")
                .limit(5);
            if (requests) setPendingRequests(requests);

            setLoading(false);
        };
        fetchDashboardData();
    }, []);

    const getStatusBadge = (count) => {
        if (count <= 5)
            return (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase">
                    Critical
                </span>
            );
        if (count > 20)
            return (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">
                    Surplus
                </span>
            );
        return (
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">
                Sufficient
            </span>
        );
    };

    if (loading)
        return (
            <div className="p-8 text-center text-slate-500">
                Loading Dashboard Data...
            </div>
        );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                        Stored Units{" "}
                        <Database className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-3">
                        {metrics.total}{" "}
                        <span className="text-sm font-normal text-slate-500">
                            units
                        </span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                        Today's Inflow{" "}
                        <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-black text-emerald-600 mt-3">
                        {metrics.inflowToday}{" "}
                        <span className="text-sm font-normal text-slate-500">
                            units
                        </span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                        Today's Outflow{" "}
                        <ArrowUpRight className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-3xl font-black text-amber-600 mt-3">
                        {metrics.outflowToday}{" "}
                        <span className="text-sm font-normal text-slate-500">
                            units
                        </span>
                    </div>
                </div>

                <div
                    className={`${metrics.platelets <= 5 ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"} p-5 rounded-xl border shadow-sm`}
                >
                    <div
                        className={`flex justify-between items-center text-xs font-bold uppercase tracking-wider ${metrics.platelets <= 5 ? "text-red-600" : "text-emerald-600"}`}
                    >
                        System Status <AlertOctagon className="w-4 h-4" />
                    </div>
                    <div
                        className={`text-xl font-black mt-3 ${metrics.platelets <= 5 ? "text-red-700" : "text-emerald-700"}`}
                    >
                        {metrics.platelets <= 5
                            ? "Platelets Critical"
                            : "Supplies Stable"}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">
                            Branch Supply by Component
                        </h3>
                    </div>
                    <div className="p-5">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="pb-3">Component Type</th>
                                    <th className="pb-3 text-center">
                                        Units in Storage
                                    </th>
                                    <th className="pb-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <tr>
                                    <td className="py-4">PRBC</td>
                                    <td className="py-4 text-center font-medium">
                                        {metrics.prbc}
                                    </td>
                                    <td className="py-4 text-center">
                                        {getStatusBadge(metrics.prbc)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4">Platelets</td>
                                    <td className="py-4 text-center font-medium">
                                        {metrics.platelets}
                                    </td>
                                    <td className="py-4 text-center">
                                        {getStatusBadge(metrics.platelets)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4">FFP</td>
                                    <td className="py-4 text-center font-medium">
                                        {metrics.ffp}
                                    </td>
                                    <td className="py-4 text-center">
                                        {getStatusBadge(metrics.ffp)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4">Whole Blood</td>
                                    <td className="py-4 text-center font-medium">
                                        {metrics.wholeBlood}
                                    </td>
                                    <td className="py-4 text-center">
                                        {getStatusBadge(metrics.wholeBlood)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="p-5 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800">
                            Pending Doctor Requests
                        </h3>
                    </div>
                    <div className="p-5 space-y-4">
                        {pendingRequests.length === 0 ? (
                            <div className="text-center text-slate-500 text-sm py-4">
                                No pending requests.
                            </div>
                        ) : (
                            pendingRequests.map((req) => (
                                <div
                                    key={req.id}
                                    className="p-4 bg-red-50 border border-red-100 rounded-lg"
                                >
                                    <h4 className="font-bold text-slate-900 text-sm">
                                        {req.doctor_name || "Attending"}
                                    </h4>
                                    <p className="text-xs text-slate-600 mt-1">
                                        {req.hospital_name} • {req.quantity}x{" "}
                                        {req.blood_type}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
