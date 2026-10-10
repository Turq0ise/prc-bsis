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
  const [loading, setLoading] = useState(true);
  
  // State for inventory numbers
  const [inventory, setInventory] = useState({
    total: 0,
    prbc: 0,
    platelets: 0,
    ffp: 0,
    wholeBlood: 0,
  });

  // State for pending requests
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      // 1. Fetch live inventory
      const { data: units, error: unitsError } = await supabase
        .from("blood_units")
        .select("component_type")
        .eq("status", "cleared");

      if (!unitsError && units) {
        const counts = {
          total: units.length,
          prbc: units.filter(u => u.component_type === "PRBC").length,
          platelets: units.filter(u => u.component_type === "Platelets").length,
          ffp: units.filter(u => u.component_type === "FFP").length,
          wholeBlood: units.filter(u => u.component_type === "Whole Blood").length,
        };
        setInventory(counts);
      }

      // 2. Fetch pending doctor requests (assumes a 'requests' table exists)
      const { data: requests, error: requestsError } = await supabase
        .from("requests")
        .select("*")
        .eq("status", "pending")
        .limit(5); // Show top 5 recent requests

      if (!requestsError && requests) {
        setPendingRequests(requests);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  // Helper function to dynamically style the inventory status
  const getStatusBadge = (count) => {
    if (count <= 5) return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase">Critical</span>;
    if (count > 20) return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">Surplus</span>;
    return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">Sufficient</span>;
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Dashboard Data...</div>;
  }

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
            {inventory.total}{" "}
            <span className="text-sm font-normal text-slate-500">units</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">Live Database Count</p>
        </div>

        {/* Note: Inflow and Outflow require complex date queries, left static for layout structure */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            Today's Inflow{" "}
            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-3">
            --{" "}
            <span className="text-sm font-normal text-slate-500">units</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pending Tracking Setup</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            Today's Outflow{" "}
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">
            --{" "}
            <span className="text-sm font-normal text-slate-500">units</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pending Tracking Setup</p>
        </div>

        {/* Dynamic Critical Alert based on Platelets (example) */}
        <div className={`${inventory.platelets <= 5 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'} p-5 rounded-xl border shadow-sm`}>
          <div className={`flex justify-between items-center text-xs font-bold uppercase tracking-wider ${inventory.platelets <= 5 ? 'text-red-600' : 'text-emerald-600'}`}>
            System Status{" "}
            <AlertOctagon className={`w-4 h-4 ${inventory.platelets <= 5 ? 'text-red-500' : 'text-emerald-500'}`} />
          </div>
          <div className={`text-xl font-black mt-3 ${inventory.platelets <= 5 ? 'text-red-700' : 'text-emerald-700'}`}>
            {inventory.platelets <= 5 ? 'Platelets Critical' : 'Supplies Stable'}
          </div>
          <p className={`text-[11px] mt-1 font-medium ${inventory.platelets <= 5 ? 'text-red-600' : 'text-emerald-600'}`}>
            {inventory.platelets <= 5 ? 'Flagged for callouts' : 'No urgent shortages'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Supply by Component */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Branch Supply by Component</h3>
            <button onClick={() => navigate('/staff/inventory')} className="text-xs font-bold text-red-600 hover:text-red-700">
              View Full Ledger →
            </button>
          </div>
          <div className="p-5">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="pb-3">Component Type</th>
                  <th className="pb-3 text-center">Units in Storage</th>
                  <th className="pb-3 text-center">Public Indicator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr>
                  <td className="py-4 text-slate-700">Packed Red Blood Cells (PRBC)</td>
                  <td className="py-4 text-center font-medium">{inventory.prbc} units</td>
                  <td className="py-4 text-center">{getStatusBadge(inventory.prbc)}</td>
                </tr>
                <tr>
                  <td className="py-4 text-slate-700">Platelet Concentrates</td>
                  <td className="py-4 text-center font-medium">{inventory.platelets} units</td>
                  <td className="py-4 text-center">{getStatusBadge(inventory.platelets)}</td>
                </tr>
                <tr>
                  <td className="py-4 text-slate-700">Fresh Frozen Plasma (FFP)</td>
                  <td className="py-4 text-center font-medium">{inventory.ffp} units</td>
                  <td className="py-4 text-center">{getStatusBadge(inventory.ffp)}</td>
                </tr>
                <tr>
                  <td className="py-4 text-slate-700">Whole Blood</td>
                  <td className="py-4 text-center font-medium">{inventory.wholeBlood} units</td>
                  <td className="py-4 text-center">{getStatusBadge(inventory.wholeBlood)}</td>
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
            
            {pendingRequests.length === 0 ? (
              <div className="text-center text-slate-500 text-sm py-4">
                No pending requests in the system.
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div key={request.id} className="p-4 bg-red-50 border border-red-100 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-red-700">REQ-{request.id.substring(0,4)}</span>
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {request.priority || 'URGENT'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{request.doctor_name || 'Attending Physician'}</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {request.hospital_name} • {request.quantity}x {request.blood_type}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded shadow-sm hover:bg-red-700 transition">
                      Allocate Unit
                    </button>
                  </div>
                </div>
              ))
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
