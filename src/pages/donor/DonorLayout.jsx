import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { User as UserIcon } from "lucide-react";

export default function DonorLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            // getSession() is faster and prevents the login redirect race condition
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
                Loading Donor Portal...
            </div>
        );

    return (
        <div className="space-y-6">
            {/* Dynamic Welcome Header */}
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h2 className="text-xl font-black text-slate-900">
                        PRC Voluntary Donor Portal
                    </h2>
                    <p className="text-sm text-slate-500">
                        Home Branch: <strong>Rizal Chapter - Pasig</strong>
                    </p>
                </div>
                {profile && (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                        <UserIcon className="w-4 h-4 text-prc-red" />
                        <span className="capitalize">{profile.full_name}</span>
                        <span className="text-slate-300">|</span>
                        <span className="uppercase text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                            {profile.din || "NO-DIN"}
                        </span>
                    </div>
                )}
            </div>

            {/* Persistent Top Navigation */}
            <nav className="bg-white border border-slate-200 px-6 py-3 flex flex-wrap gap-6 text-xs font-semibold text-slate-600 rounded-xl shadow-sm">
                <button
                    onClick={() => navigate("/donor")}
                    className={
                        location.pathname === "/donor"
                            ? "text-prc-red border-b-2 border-prc-red pb-1"
                            : "hover:text-slate-900 transition"
                    }
                >
                    Donor Dashboard
                </button>
                <button
                    onClick={() => navigate("/donor/book")}
                    className={
                        location.pathname === "/donor/book"
                            ? "text-prc-red border-b-2 border-prc-red pb-1"
                            : "hover:text-slate-900 transition"
                    }
                >
                    Book Donation Slot
                </button>
                <button
                    onClick={() => navigate("/donor/board")}
                    className={
                        location.pathname === "/donor/board"
                            ? "text-prc-red border-b-2 border-prc-red pb-1"
                            : "hover:text-slate-900 transition"
                    }
                >
                    National Blood Board
                </button>
            </nav>

            {/* Dynamic Page Content Renders Here */}
            <Outlet context={{ profile }} />
        </div>
    );
}
