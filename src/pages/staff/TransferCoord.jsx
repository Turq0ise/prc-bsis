import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function TransferCoord() {
  const [transfers, setTransfers] = useState([]);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const fetchTransfers = async () => {
      const { data } = await supabase.from("transfer_requests").select("*");
      if (data) setTransfers(data);
    };
    fetchTransfers();
  }, []);

  const handleDispatch = async (id, branch) => {
    const { error } = await supabase.from("transfer_requests").update({ status: "Dispatched" }).eq("id", id);
    if (!error) {
      setNotification(`Units successfully dispatched to ${branch}`);
      setTimeout(() => setNotification(""), 3000);
      setTransfers(transfers.map(req => req.id === id ? { ...req, status: "Dispatched" } : req));
    }
  };

  return (
    <div className="space-y-6">
      {notification && <div className="p-4 bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200">{notification}</div>}
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-black text-slate-900 mb-4">Inter-Chapter Transfer Coordination (UC-09)</h2>
        
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase border-b border-slate-100">
            <tr><th className="pb-3 px-4">Requesting Branch</th><th className="pb-3 px-4">Needed Component</th><th className="pb-3 px-4">Status</th><th className="pb-3 px-4 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transfers.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50 transition">
                <td className="py-4 px-4 font-medium">{req.requesting_branch}</td>
                <td className="py-4 px-4 text-red-600 font-bold">{req.quantity}x {req.component_needed} ({req.blood_type})</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${req.status === 'Dispatched' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {req.status || 'Pending Deficit'}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button onClick={() => handleDispatch(req.id, req.requesting_branch)} disabled={req.status === 'Dispatched'} className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded disabled:opacity-50">
                    {req.status === 'Dispatched' ? 'Units Dispatched' : 'Dispatch Units'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
