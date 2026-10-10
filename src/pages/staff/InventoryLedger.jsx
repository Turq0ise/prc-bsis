import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Search, Filter, AlertTriangle } from "lucide-react";

export default function InventoryLedger() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("blood_units")
        .select("*")
        .order("collection_date", { ascending: false });

      if (!error && data) {
        setUnits(data);
      } else {
        console.error("Error fetching ledger:", error);
      }
      setLoading(false);
    };

    fetchInventory();
  }, []);

  const isExpiringSoon = (expirationDate) => {
    if (!expirationDate) return false;
    const daysUntil = (new Date(expirationDate) - new Date()) / (1000 * 60 * 60 * 24);
    return daysUntil > 0 && daysUntil <= 7;
  };

  const filteredUnits = units.filter((unit) => {
    const matchesSearch = unit.unit_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "All" || unit.component_type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-slate-900">Inventory Ledger</h2>
          <p className="text-sm text-slate-500">Master record of all blood units.</p>
        </div>
        <button className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold shadow-sm hover:bg-red-700">
          + Log New Unit
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Unit ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:border-red-500"
            >
              <option value="All">All Components</option>
              <option value="PRBC">PRBC</option>
              <option value="Platelets">Platelets</option>
              <option value="FFP">FFP</option>
              <option value="Whole Blood">Whole Blood</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase font-semibold border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Unit ID</th>
                <th className="px-4 py-3">Blood Group</th>
                <th className="px-4 py-3">Component</th>
                <th className="px-4 py-3">Collection Date</th>
                <th className="px-4 py-3">Expiration Date</th>
                <th className="px-4 py-3 rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">Loading ledger data...</td>
                </tr>
              ) : filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">No units match your search.</td>
                </tr>
              ) : (
                filteredUnits.map((unit) => {
                  const expiring = isExpiringSoon(unit.expiration_date);
                  return (
                    <tr key={unit.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-medium text-slate-900">{unit.unit_id || "N/A"}</td>
                      <td className="px-4 py-3 text-red-600 font-bold">{unit.blood_group}</td>
                      <td className="px-4 py-3 text-slate-700">{unit.component_type}</td>
                      <td className="px-4 py-3 text-slate-600">{unit.collection_date}</td>
                      <td className={`px-4 py-3 flex items-center gap-2 ${expiring ? "text-amber-600 font-bold" : "text-slate-600"}`}>
                        {unit.expiration_date}
                        {expiring && <AlertTriangle className="w-4 h-4" />}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          unit.status === 'cleared' ? 'bg-emerald-100 text-emerald-700' :
                          unit.status === 'quarantined' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {unit.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
