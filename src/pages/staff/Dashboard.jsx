import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Database,
  ArrowDownLeft,
  ArrowUpRight,
  AlertOctagon,
  ArrowRight,
} from "lucide-react";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [storedUnits, setStoredUnits] = useState(0);

  useEffect(() => {
    const fetchInventoryCount = async () => {
      // Queries the blood_units table for the exact count of cleared/available units
      const { count, error } = await supabase
        .from("blood_units")
        .select("*", { count: "exact", head: true })
        .eq("status", "cleared");

      if (!error && count !== null) {
        setStoredUnits(count);
      } else if (error) {
        console.error("Error fetching inventory:", error);
      }
    };

    fetchInventoryCount();
  }, []);

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
            {storedUnits}{" "}
            <span className="text-sm font-normal text-slate-500">units</span>
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
            <span className="text-sm font-normal text-slate-500">units</span>
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
          <div className="text-3xl font-black text-slate-900 mt-3">
            -12{" "}
            <span className="text-sm font-normal text-slate-500">units</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Dispensed to 4 hospitals
          </p>
        </div>

        <div className="bg-red-50 p-5 rounded-xl border border-red-100 shadow-sm">
          <div className="flex justify-between items-center text-red-600 text-xs font-bold uppercase tracking-wider">
            Critical Alert{" "}
            <AlertOctagon className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl font-black text-red-700 mt-3">
            O-Neg: 2 Units
          </div>
          <p className="text-[11px] text-red-600 mt-1 font-medium">
            Flagged for targeted callouts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Supply by Component */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Branch Supply by Component</h3>
            <button className="text-xs font-bold text-red-600 hover:text-red-700">
              + Log Inflow/Outflow
            </button>
          </div>
          <div className="p-5">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="pb-3">Component Type</th>
                  <th className="pb-3 text-center">Units in Storage</th>
                  <th className="pb-3 text-center">Public Indicator</th>
                  <th className="pb-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr>
                  <td className="py-4 text-slate-700">Packed Red Blood Cells (PRBC)</td>
                  <td className="py-4 text-center font-medium">142 units</td>
                  <td className="py-4 text-center"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">Sufficient</span></td>
                  <td className="py-4 text-right text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-end gap-1">Log <ArrowRight className="w-3 h-3"/></td>
                </tr>
                <tr>
                  <td className="py-4 text-slate-700">Platelet Concentrates</td>
                  <td className="py-4 text-center font-bold text-red-600">18 units</td>
                  <td className="py-4 text-center"><span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase">Critical</span></td>
                  <td className="py-4 text-right text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-end gap-1">Log <ArrowRight className="w-3 h-3"/></td>
                </tr>
                <tr>
                  <td className="py-4 text-slate-700">Fresh Frozen Plasma (FFP)</td>
                  <td className="py-4 text-center font-medium">64 units</td>
                  <td className="py-4 text-center"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">Sufficient</span></td>
                  <td className="py-4 text-right text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-end gap-1">Log <ArrowRight className="w-3 h-3"/></td>
                </tr>
                <tr>
                  <td className="py-4 text-slate-700">Whole Blood</td>
                  <td className="py-4 text-center font-medium">45 units</td>
                  <td className="py-4 text-center"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">Surplus</span></td>
                  <td className="py-4 text-right text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-end gap-1">Log <ArrowRight className="w-3 h-3"/></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Doctor Requests */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Pending Doctor Requests</h3>
          </div>
          <div className="p-5 flex-1 space-y-4">
            
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-red-700">REQ-9021</span>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">STAT</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Sofia Isabel Alcantara</h4>
              <p className="text-xs text-slate-600 mt-1">The Medical City • 2x PRBC (O+)</p>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded shadow-sm hover:bg-red-700 transition">Allocate Unit</button>
                <button className="flex-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold py-2 rounded hover:bg-slate-50 transition">View Slip</button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-500">REQ-9018</span>
                <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">URGENT</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Eduardo Ramos</h4>
              <p className="text-xs text-slate-600 mt-1">Pasig City Gen • 1x Platelets (B-)</p>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 bg-slate-800 text-white text-xs font-bold py-2 rounded shadow-sm hover:bg-slate-900 transition">Process</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
