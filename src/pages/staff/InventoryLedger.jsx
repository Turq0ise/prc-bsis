import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Search, X } from "lucide-react";

const inventoryQuery = () => supabase.from("blood_units").select("*").order("created_at", { ascending: false });

export default function InventoryLedger() {
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUnit, setNewUnit] = useState({ unit_id: "", blood_group: "O+", component_type: "PRBC" });

  const fetchInventory = async () => {
    const { data } = await inventoryQuery();
    if (data) setUnits(data);
  };

  useEffect(() => {
    let active = true;
    void inventoryQuery().then(({ data }) => { if (active && data) setUnits(data); });
    return () => { active = false; };
  }, []);

  const handleLogUnit = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from("blood_units").insert([{
      unit_id: newUnit.unit_id,
      blood_group: newUnit.blood_group,
      component_type: newUnit.component_type,
      status: "quarantined",
      collection_date: today
    }]);

    if (!error) {
      setIsModalOpen(false);
      setNewUnit({ unit_id: "", blood_group: "O+", component_type: "PRBC" });
      fetchInventory(); // Refresh the table
    } else {
      alert("Failed to log unit. Make sure the Unit ID is unique.");
    }
  };

  const filteredUnits = units.filter(u => 
    u.unit_id?.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (filterType === "All" || u.component_type === filterType)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-slate-900">Inventory Ledger</h2>
          <p className="text-sm text-slate-500">Master record of all blood units.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold shadow-sm hover:bg-red-700">
          + Log New Unit
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96 relative">
            <button aria-label="Close new unit form" onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            <h3 className="font-black text-lg mb-4">Log New Unit</h3>
            <form onSubmit={handleLogUnit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Unit ID</label>
                <input required type="text" value={newUnit.unit_id} onChange={e => setNewUnit({...newUnit, unit_id: e.target.value})} className="w-full mt-1 p-2 border rounded" placeholder="e.g. UNIT-2026-101" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Blood Group</label>
                <select value={newUnit.blood_group} onChange={e => setNewUnit({...newUnit, blood_group: e.target.value})} className="w-full mt-1 p-2 border rounded">
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Component</label>
                <select value={newUnit.component_type} onChange={e => setNewUnit({...newUnit, component_type: e.target.value})} className="w-full mt-1 p-2 border rounded">
                  {['PRBC', 'Platelets', 'FFP', 'Whole Blood'].map(ct => <option key={ct} value={ct}>{ct}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-2 rounded mt-2 hover:bg-slate-800">Save to Quarantine</button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input type="text" placeholder="Search by Unit ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-4 py-2 border rounded-lg text-sm">
            <option value="All">All Components</option>
            <option value="PRBC">PRBC</option>
            <option value="Platelets">Platelets</option>
            <option value="FFP">FFP</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase font-semibold border-b bg-slate-50">
              <tr><th className="px-4 py-3">Unit ID</th><th className="px-4 py-3">Blood Group</th><th className="px-4 py-3">Component</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUnits.map((unit) => (
                <tr key={unit.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{unit.unit_id}</td>
                  <td className="px-4 py-3 text-red-600 font-bold">{unit.blood_group}</td>
                  <td className="px-4 py-3">{unit.component_type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${unit.status === 'cleared' ? 'bg-emerald-100 text-emerald-700' : unit.status === 'quarantined' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>{unit.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
