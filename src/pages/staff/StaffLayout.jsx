import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { User as UserIcon } from "lucide-react";

export default function StaffLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                navigate("/");
                return;
            }

            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .maybeSingle();

            setProfile(data);
            setLoading(false);
        };
        fetchProfile();
    }, [navigate]);

    if (loading)
        return (
            <div className="p-8 text-center text-slate-500 font-bold">
                Loading Staff Command...
            </div>
        );

    return (
        <div className="space-y-6">
            {/* Dynamic Welcome Header */}
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h2 className="text-xl font-black text-slate-900">
                        PRC-BSIS Staff Command
                    </h2>
                    <p className="text-sm text-slate-500">
                        Branch: <strong>Rizal Chapter - Pasig Branch</strong>
                    </p>
                </div>
                {profile && (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                        <UserIcon className="w-4 h-4 text-prc-red" />
                        <span className="capitalize">{profile.full_name}</span>
                        <span className="text-slate-300">|</span>
                        <span className="uppercase text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                            {profile.role}
                        </span>
                    </div>
                )}
            </div>

            {/* Persistent Top Navigation */}
            <nav className="bg-white border border-slate-200 px-6 py-3 flex flex-wrap gap-6 text-xs font-semibold text-slate-600 rounded-xl shadow-sm">
                <button
                    onClick={() => navigate("/staff")}
                    className={
                        location.pathname === "/staff"
                            ? "text-prc-red border-b-2 border-prc-red pb-1"
                            : "hover:text-slate-900 transition"
                    }
                >
                    Overview Dashboard
                </button>
                <button
                    onClick={() => navigate("/staff/ledger")}
                    className={
                        location.pathname === "/staff/ledger"
                            ? "text-prc-red border-b-2 border-prc-red pb-1"
                            : "hover:text-slate-900 transition"
                    }
                >
                    Inflow / Outflow Ledger
                </button>
                <button
                    onClick={() => navigate("/staff/serology")}
                    className={
                        location.pathname === "/staff/serology"
                            ? "text-prc-red border-b-2 border-prc-red pb-1"
                            : "hover:text-slate-900 transition"
                    }
                >
                    Serological Testing
                </button>
                <button
                    onClick={() => navigate("/staff/transfers")}
                    className={
                        location.pathname === "/staff/transfers"
                            ? "text-prc-red border-b-2 border-prc-red pb-1"
                            : "hover:text-slate-900 transition"
                    }
                >
                    Transfer Coordination
                </button>
                <button
                    onClick={() => navigate("/staff/board")}
                    className={
                        location.pathname === "/staff/board"
                            ? "text-prc-red border-b-2 border-prc-red pb-1"
                            : "hover:text-slate-900 transition"
                    }
                >
                    Reports & Analytics
                </button>
            </nav>

            {/* Dynamic Page Content Renders Here */}
            <Outlet context={{ profile }} />
        </div>
    );
}
