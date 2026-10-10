import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { TestTube, CheckCircle, XCircle, Search, AlertCircle } from "lucide-react";

export default function SerologicalEntry() {
  const [quarantinedUnits, setQuarantinedUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Standard blood screening tests
  const [testResults, setTestResults] = useState({
    hiv: "Pending",
    hbsag: "Pending", // Hepatitis B
    hcv: "Pending",   // Hepatitis C
    syphilis: "Pending",
    malaria: "Pending"
  });

  const fetchQuarantinedUnits = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blood_units")
      .select("*")
      .eq("status", "quarantined")
      .order("collection_date", { ascending: true });

    if (!error && data) {
      setQuarantinedUnits(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuarantinedUnits();
  }, []);

  const handleTestChange = (testName, result) => {
    setTestResults(prev => ({ ...prev, [testName]: result }));
  };

  const submitResults = async () => {
    if (!selectedUnit) return;
    setIsSubmitting(true);

    // If any test is "Reactive", the unit must be discarded. Otherwise, it is cleared.
    const hasReactive = Object.values(testResults).includes("Reactive");
    const hasPending = Object.values(testResults).includes("Pending");

    if (hasPending) {
      alert("Please complete all tests before submitting.");
      setIsSubmitting(false);
      return;
    }

    const finalStatus = hasReactive ? "discarded" : "cleared";

    const { error } = await supabase
      .from("blood_units")
      .update({ status: finalStatus })
      .eq("id", selectedUnit.id);

    if (!error) {
      // Remove the processed unit from the local state list
      setQuarantinedUnits(prev => prev.filter(unit => unit.id !== selectedUnit.id));
      setSelectedUnit(null);
      setTestResults({
        hiv: "Pending", hbsag: "Pending", hcv: "Pending", syphilis: "Pending", malaria: "Pending"
      });
    } else {
      console.error("Error updating unit status:", error);
      alert("Failed to save results. Check console for details.");
    }
    
    setIsSubmitting(false);
  };

  const filteredUnits = quarantinedUnits.filter(unit => 
    unit.unit_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900">Serological Testing</h2>
        <p className="text-sm text-slate-500">Screen quarantined units for transfusion-transmissible infections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pending Units List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <TestTube className="w-4 h-4 text-slate-500" />
              Pending Screening ({quarantinedUnits.length})
            </h3>
            <div className="mt-3 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Unit ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="text-center text-xs text-slate-500 p-4">Loading quarantine list...</div>
            ) : filteredUnits.length === 0 ? (
              <div className="text-center text-xs text-slate-500 p-4">No quarantined units found.</div>
            ) : (
              filteredUnits.map(unit => (
                <div 
                  key={unit.id}
                  onClick={() => {
                    setSelectedUnit(unit);
                    setTestResults({ hiv: "Pending", hbsag: "Pending", hcv: "Pending", syphilis: "Pending", malaria: "Pending" });
                  }}
                  className={`p-3 border rounded-lg cursor-pointer transition ${
                    selectedUnit?.id === unit.id 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-slate-200 hover:border-red-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 text-sm">{unit.unit_id || "Unknown ID"}</span>
                    <span className="text-red-600 font-black text-xs">{unit.blood_group}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{unit.component_type}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Testing Interface */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          {selectedUnit ? (
            <>
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-lg text-slate-900">Unit: {selectedUnit.unit_id}</h3>
                  <p className="text-sm text-slate-500">{selectedUnit.component_type} • {selectedUnit.blood_group}</p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase rounded border border-amber-200">
                  Quarantined
                </span>
              </div>

              <div className="p-5 flex-1">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex gap-2 items-start">
                  <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600">
                    Record the results for all 5 mandatory infectious disease markers. Marking any test as <span className="font-bold text-red-600">Reactive</span> will permanently flag this unit for safe disposal.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: "hiv", label: "HIV 1/2" },
                    { key: "hbsag", label: "Hepatitis B (HBsAg)" },
                    { key: "hcv", label: "Hepatitis C (HCV)" },
                    { key: "syphilis", label: "Syphilis" },
                    { key: "malaria", label: "Malaria" }
                  ].map((test) => (
                    <div key={test.key} className="flex items-center justify-between p-3 border-b border-slate-100">
                      <span className="font-bold text-slate-700 text-sm">{test.label}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTestChange(test.key, "Non-Reactive")}
                          className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition ${
                            testResults[test.key] === "Non-Reactive" 
                              ? 'bg-emerald-600 text-white shadow-inner' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle className="w-3 h-3" /> Non-Reactive
                        </button>
                        <button
                          onClick={() => handleTestChange(test.key, "Reactive")}
                          className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition ${
                            testResults[test.key] === "Reactive" 
                              ? 'bg-red-600 text-white shadow-inner' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <XCircle className="w-3 h-3" /> Reactive
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedUnit(null)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitResults}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded shadow hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Submit Final Results"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <TestTube className="w-16 h-16 text-slate-200 mb-4" />
              <p className="font-medium text-slate-500">Select a unit from the pending list to begin testing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
