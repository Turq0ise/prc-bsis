import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Reports() {
  const [data, setData] = useState([]);
  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  useEffect(() => {
    const fetchStats = async () => {
      const { data: units } = await supabase.from("blood_units").select("component_type").eq("status", "cleared");
      if (units) {
        setData([
          { name: 'PRBC', value: units.filter(u => u.component_type === "PRBC").length },
          { name: 'Platelets', value: units.filter(u => u.component_type === "Platelets").length },
          { name: 'FFP', value: units.filter(u => u.component_type === "FFP").length },
          { name: 'Whole Blood', value: units.filter(u => u.component_type === "Whole Blood").length }
        ]);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900">Reports & Analytics</h2>
        <p className="text-sm text-slate-500">Visual breakdown of current branch resources.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm h-80">
          <h3 className="font-bold text-slate-800 mb-4">Cleared Inventory Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm h-80">
          <h3 className="font-bold text-slate-800 mb-4">Stock Levels</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" fill="#0f172a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
