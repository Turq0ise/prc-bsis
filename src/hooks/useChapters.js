import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useChapters() {
    const [chapters, setChapters] = useState([]);
    const [loadingChapters, setLoadingChapters] = useState(true);

    useEffect(() => {
        const fetchChapters = async () => {
            // 1. Check if we already cached this in the browser session
            const cached = sessionStorage.getItem("prc_chapters");
            if (cached) {
                setChapters(JSON.parse(cached));
                setLoadingChapters(false);
                return;
            }

            // 2. If not cached, fetch from Supabase
            const { data, error } = await supabase
                .from("chapters")
                .select("name, category")
                .order("category", { ascending: true })
                .order("name", { ascending: true });

            if (!error && data) {
                // Group the data by category for easier rendering in the <select>
                const grouped = data.reduce((acc, curr) => {
                    if (!acc[curr.category]) acc[curr.category] = [];
                    acc[curr.category].push(curr.name);
                    return acc;
                }, {});

                // 3. Save to state and cache it in sessionStorage
                setChapters(grouped);
                sessionStorage.setItem("prc_chapters", JSON.stringify(grouped));
            }
            setLoadingChapters(false);
        };

        fetchChapters();
    }, []);

    return { chapters, loadingChapters };
}
