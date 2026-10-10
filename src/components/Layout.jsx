import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Layout() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
            <header className="bg-slate-900 text-white px-6 py-3 shadow-md flex justify-between items-center border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <span className="bg-prc-red text-white p-1 rounded font-black text-xs">
                        PRC
                    </span>
                    <span className="text-sm font-semibold tracking-wide">
                        PRC-BSIS Portal
                    </span>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-xs text-slate-300 hover:text-white"
                >
                    Sign Out
                </button>
            </header>
            <main className="p-6 md:p-8 max-w-7xl mx-auto">
                <Outlet />
            </main>
        </div>
    );
}
