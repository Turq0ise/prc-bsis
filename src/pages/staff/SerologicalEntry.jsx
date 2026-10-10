import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { TestTube } from "lucide-react";

const quarantinedQuery = () => supabase.from("blood_units").select("*").eq("status", "quarantined");

export default function SerologicalEntry() {
  const [quarantinedUnits, setQuarantinedUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [notification, setNotification] = useState("");
  const [testResults, setTestResults] = useState({ hiv: "Pending", hbsag: "Pending", hcv: "Pending", syphilis: "Pending", malaria: "Pending" });

  const fetchUnits = async () => {
    const { data } = await quarantinedQuery();
    if (data) setQuarantinedUnits(data);
  };

  useEffect(() => {
    let active = true;
    void quarantinedQuery().then(({ data }) => { if (active && data) setQuarantinedUnits(data); });
    return () => { active = false; };
  }, []);

  const submitResults = async () => {
    if (Object.values(testResults).includes("Pending")) return alert("Complete all tests.");
    const finalStatus = Object.values(testResults).includes("Reactive") ? "discarded" : "cleared";
    
    const { error } = await supabase.from("blood_units").update({ status: finalStatus }).eq("id", selectedUnit.id);
    
    if (!error) {
      setNotification(`Unit ${selectedUnit.unit_id} marked as ${finalStatus.toUpperCase()}`);
      setTimeout(() => setNotification(""), 3000);
      setSelectedUnit(null);
      fetchUnits();
    }
  };

  return (
    <div className="space-y-6">
      {notification && <div className="p-4 bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200">{notification}</div>}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border p-4">
          <h3 className="font-bold flex items-center gap-2 mb-4"><TestTube className="w-4 h-4" /> Pending ({quarantinedUnits.length})</h3>
          <input type="text" placeholder="Search..." onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border rounded text-xs mb-2" />
          <div className="space-y-2 overflow-y-auto h-[400px]">
            {quarantinedUnits.filter(u => u.unit_id?.includes(searchTerm)).map(unit => (
              <div key={unit.id} onClick={() => setSelectedUnit(unit)} className="p-3 border rounded cursor-pointer hover:border-red-300">
                <div className="font-bold text-sm">{unit.unit_id} <span className="text-red-600 float-right">{unit.blood_group}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border p-6">
          {selectedUnit ? (
            <>
              <h3 className="font-black text-lg mb-6">Testing Unit: {selectedUnit.unit_id}</h3>
              <div className="space-y-4 mb-8">
                {Object.keys(testResults).map((test) => (
                  <div key={test} className="flex justify-between items-center p-3 border-b">
                    <span className="font-bold uppercase text-sm">{test}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setTestResults({...testResults, [test]: "Non-Reactive"})} className={`px-3 py-1 text-xs font-bold rounded ${testResults[test] === 'Non-Reactive' ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>Non-Reactive</button>
                      <button onClick={() => setTestResults({...testResults, [test]: "Reactive"})} className={`px-3 py-1 text-xs font-bold rounded ${testResults[test] === 'Reactive' ? 'bg-red-600 text-white' : 'bg-slate-100'}`}>Reactive</button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={submitResults} className="w-full py-3 bg-slate-900 text-white font-bold rounded">Submit Results</button>
            </>
          ) : <div className="text-center text-slate-400 py-20">Select a unit to begin</div>}
        </div>
      </div>
    </div>
  );
}
