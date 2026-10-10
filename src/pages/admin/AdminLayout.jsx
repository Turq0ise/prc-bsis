import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { adminAccess, isNationalAdmin, roleLabel } from "../../lib/adminRoles";

export default function AdminLayout() {
    const [access, setAccess] = useState({ status: "loading", profile: null, error: "" });
    useEffect(() => {
        let active = true;
        let generation = 0;
        let channel;
        async function verify(session) {
            const request = ++generation;
            if (channel) { void supabase.removeChannel(channel); channel = null; }
            if (!session) {
                if (active) setAccess({ status: "signed-out", profile: null, error: "" });
                return;
            }
            if (active) setAccess({ status: "loading", profile: null, error: "" });
            try {
                const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
                if (error) throw error;
                if (!active || request !== generation) return;
                setAccess({ status: adminAccess(profile) ? "allowed" : "denied", profile, error: "" });
                channel = supabase.channel(`admin-profile-${session.user.id}`).on("postgres_changes", {
                    event: "*", schema: "public", table: "profiles", filter: `id=eq.${session.user.id}`,
                }, () => { if (active) void verify(session); }).subscribe();
            } catch (err) {
                if (active && request === generation) setAccess({ status: "error", profile: null, error: err.message });
            }
        }
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // Do not issue database requests inside Supabase's auth lock.
            setTimeout(() => { if (active) void verify(session); }, 0);
        });
        const onFocus = () => { void supabase.auth.getSession().then(({ data }) => { if (active) void verify(data.session); }); };
        window.addEventListener("focus", onFocus);
        return () => { active = false; subscription.unsubscribe(); window.removeEventListener("focus", onFocus); if (channel) void supabase.removeChannel(channel); };
    }, []);
    if (access.status === "loading") return <p role="status" className="admin-panel">Checking administrator access…</p>;
    if (access.status === "signed-out") return <Navigate to="/" replace />;
    if (access.status !== "allowed") return <section className="admin-panel">
        <h1 className="text-xl font-bold">{access.status === "error" ? "Unable to verify access" : "Administrator access required"}</h1>
        <p role="alert" className="mt-3">{access.error || (access.profile?.role === "chapter_admin" && !access.profile.chapter_id ? "Your account needs an assigned chapter before you can use the admin portal." : "Your account does not have active administrator permissions.")}</p>
        <NavLink to="/" className="admin-button mt-4">Return to sign in</NavLink>
    </section>;
    const national = isNationalAdmin(access.profile.role);
    const links = [["audit", "Audit logs"], ["reports", "Reports"], ["supply", "Inventory"], ["accounts", "Accounts"], ["transfers", "Transfers"]];
    if (national) links.push(["settings", "Portal information"]);
    return <div className="space-y-6">
        <header className="admin-heading">
            <div className="flex items-center gap-3"><ShieldCheck size={28} aria-hidden="true" /><div>
                <p className="text-xs uppercase tracking-widest text-red-200">Administration</p>
                <h1 className="text-2xl font-bold">Blood services oversight</h1>
                <p className="mt-2 text-sm text-slate-200">{access.profile.full_name || "Administrator"} · {roleLabel(access.profile.role)} · {national ? "National view" : access.profile.chapter_id}</p>
            </div></div>
        </header>
        <nav aria-label="Admin pages" className="flex flex-wrap gap-2">
            {links.map(([path, label]) => <NavLink key={path} to={`/admin/${path}`} className={({ isActive }) => `admin-tab ${isActive ? "admin-tab-active" : ""}`}>{label}</NavLink>)}
        </nav>
        <Outlet context={{ profile: access.profile, national }} />
    </div>;
}
