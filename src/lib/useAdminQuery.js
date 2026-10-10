import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useAdmin } from "./useAdmin";
import { loadAdminData } from "./adminData";

export function useAdminQuery(method, params = {}) {
    const { profile } = useAdmin();
    const key = JSON.stringify({ params, profile: { id: profile.id, role: profile.role, chapter_id: profile.chapter_id, is_active: profile.is_active } });
    const [revision, setRevision] = useState(0);
    const [result, setResult] = useState({ data: null, error: "", loading: true, key: "" });
    useEffect(() => {
        let active = true;
        async function load() {
            setResult({ data: null, error: "", loading: true, key });
            try {
                const request = JSON.parse(key);
                const data = await loadAdminData(supabase, method, request.params, request.profile);
                if (active) setResult({ data, error: "", loading: false, key });
            } catch (err) {
                const message = err.message || "Unable to load data. Please try again.";
                if (active) setResult({ data: null, error: message, loading: false, key });
            }
        }
        void load();
        return () => { active = false; };
    }, [method, key, revision]);
    return { ...result, loading: result.loading || result.key !== key, reload: () => setRevision((value) => value + 1) };
}
