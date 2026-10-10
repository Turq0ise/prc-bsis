import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
    Droplet,
    User,
    LogOut,
    ChevronDown,
    Settings,
    Loader2,
} from "lucide-react";
import AccountModal from "./AccountModal";

export default function Layout() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
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
                .single();

            setProfile(data);
            setLoading(false);
        };
        checkAuth();
    }, [navigate]);

    const handleSignOut = async () => {
        setShowProfileMenu(false);
        await supabase.auth.signOut();
        navigate("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-prc-red" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="bg-slate-900 text-white shadow-md relative z-40">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Brand / Logo */}
                    <div
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
                        onClick={() => navigate(`/${profile?.role}`)}
                    >
                        <div className="bg-prc-red text-white p-1.5 rounded">
                            <Droplet className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                            <h1 className="font-black text-sm leading-tight tracking-wide">
                                PRC-BSIS
                            </h1>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                                {profile?.role} Portal
                            </p>
                        </div>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2 hover:bg-slate-800 p-2 rounded-lg transition"
                        >
                            <div className="w-8 h-8 bg-prc-red rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                {profile?.full_name ? (
                                    profile.full_name.charAt(0)
                                ) : (
                                    <User className="w-4 h-4" />
                                )}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-xs font-bold text-white leading-tight">
                                    {profile?.full_name || "User Account"}
                                </p>
                                <p className="text-[10px] text-slate-400 leading-tight">
                                    {profile?.din || "Manage Profile"}
                                </p>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 text-slate-400 transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
                            />
                        </button>

                        {showProfileMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowProfileMenu(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50">
                                    <button
                                        onClick={() => {
                                            setIsAccountModalOpen(true); // <-- Open Modal
                                            setShowProfileMenu(false); // <-- Close Dropdown
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition"
                                    >
                                        <Settings className="w-4 h-4 text-slate-400" />{" "}
                                        Account Settings
                                    </button>

                                    <div className="h-px bg-slate-100 w-full my-1"></div>

                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 transition"
                                    >
                                        <LogOut className="w-4 h-4 text-red-500" />{" "}
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Account Settings Popup */}
            <AccountModal
                profile={profile}
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
            />

            {/* Main Content Area */}
            <main className="flex-grow max-w-6xl mx-auto w-full p-4 md:p-8">
                {/* Passes profile context down to Dashboard, BookAppointment, etc. */}
                <Outlet context={{ profile }} />
            </main>
        </div>
    );
}
