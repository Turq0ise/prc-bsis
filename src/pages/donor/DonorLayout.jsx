import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

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

    const navItems = [
        { name: "Donor Dashboard", path: "/donor" },
        { name: "Book Donation Slot", path: "/donor/book" },
        // { name: "Active Medical Requests", path: "donor/requisitions"},
        { name: "National Blood Board", path: "/donor/board" },
    ];

    return (
        <div className="space-y-6">
            {/* Dynamic Welcome Header */}
            <div className="flex justify-between items-end mb-2">
                <div className="flex w-full justify-between items-center pb-4">
                    <h2 className="text-xl font-black text-slate-900">
                        PRC Voluntary Donor Portal
                    </h2>
                    <p className="text-sm text-slate-500">
                        Home Branch: <strong>Rizal Chapter - Pasig</strong>
                    </p>
                </div>
            </div>

            {/* Persistent Top Navigation */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-2 flex overflow-x-auto">
                {navItems.map((item) => {
                    // Strict match for dashboard, startsWith match for nested routes
                    const isActive =
                        item.path === "/donor"
                            ? location.pathname === "/donor"
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

            {/* Dynamic Page Content Renders Here */}
            <Outlet context={{ profile }} />
        </div>
    );
}
