import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { User as UserIcon, LogOut } from "lucide-react";

export default function StaffLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      // Strict Role-Based Security: Kick out non-staff users
      if (data?.role !== "staff") {
        await supabase.auth.signOut();
        navigate("/");
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="p-8 text-center text-slate-500 font-bold">
          Loading Staff Command...
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Overview Dashboard", path: "/staff" },
    { name: "Inflow / Outflow Ledger", path: "/staff/inventory" },
    { name: "Serological Testing", path: "/staff/testing" }, 
    { name: "Transfer Coordination", path: "/staff/transfers" },
    { name: "Reports & Analytics", path: "/staff/reports" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              PRC-BSIS Staff Command
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Branch: Rizal Chapter - Pasig Branch
            </p>
          </div>

          {/* Dynamic User Badge & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm">
              <UserIcon className="w-4 h-4 text-red-600" />
              <span className="text-sm font-bold text-slate-700">
                {profile?.full_name || "Staff Member"}
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-l border-slate-200 pl-2 ml-2">
                STAFF
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition shadow-sm"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-2 flex overflow-x-auto">
          {navItems.map((item) => {
            // Strict match for dashboard, startsWith match for nested routes
            const isActive = item.path === "/staff" 
              ? location.pathname === "/staff" 
              : location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`whitespace-nowrap px-4 py-4 text-sm font-bold border-b-2 transition ${
                  isActive
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Dynamic Page Content rendered here */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
