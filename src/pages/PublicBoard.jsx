import { useState, useEffect } from "react";
import { MapPin, Droplet, Loader2, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useChapters } from "../hooks/useChapters";

// Helper function to map counts to UI badges
const getStatusBadge = (count) => {
    if (count === 0)
        return (
            <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded font-black shadow-sm block w-fit mx-auto">
                CRITICAL
            </span>
        );
    if (count <= 2)
        return (
            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded block w-fit mx-auto">
                LOW
            </span>
        );
    if (count <= 10)
        return (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded block w-fit mx-auto">
                SUFFICIENT
            </span>
        );
    return (
        <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded block w-fit mx-auto">
            SURPLUS
        </span>
    );
};

export default function PublicBoard({ isNested = false }) {
    const navigate = useNavigate();
    const { chapters, loadingChapters } = useChapters();
    const [loading, setLoading] = useState(true);
    const [inventoryGrid, setInventoryGrid] = useState({});
    const [selectedBranch, setSelectedBranch] = useState("All Locations");

    useEffect(() => {
        // Wait until chapters are loaded from cache/database before fetching inventory
        if (loadingChapters) return;

        const fetchLiveInventory = async () => {
            try {
                // 1. Dynamically build the initial grid using the fetched chapters
                const dynamicGrid = {};
                Object.values(chapters)
                    .flat()
                    .forEach((branchName) => {
                        dynamicGrid[branchName] = {
                            "O+": 0,
                            "O-": 0,
                            "A+": 0,
                            "A-": 0,
                            "B+": 0,
                            "B-": 0,
                            "AB+": 0,
                            "AB-": 0,
                        };
                    });

                // 2. Query only cleared units, joining profiles for blood type and appointments for venue[cite: 4]
                const { data, error } = await supabase
                    .from("blood_units")
                    .select(
                        `
                        unit_id,
                        profiles ( blood_group ),
                        appointments ( venue )
                        `,
                    )
                    .eq("status", "cleared"); //[cite: 4]

                if (error) throw error;

                // 3. Tally the counts into the dynamic grid
                if (data) {
                    data.forEach((unit) => {
                        const branch = unit.appointments?.venue;
                        const bloodType = unit.profiles?.blood_group;

                        // Only increment if the branch and blood type exist in our matrix[cite: 4]
                        if (
                            dynamicGrid[branch] &&
                            dynamicGrid[branch][bloodType] !== undefined
                        ) {
                            dynamicGrid[branch][bloodType] += 1; //[cite: 4]
                        }
                    });
                }

                setInventoryGrid(dynamicGrid);
            } catch (err) {
                console.error("Failed to fetch inventory:", err); //[cite: 4]
            } finally {
                setLoading(false);
            }
        };

        fetchLiveInventory();
    }, [chapters, loadingChapters]);

    // Apply the filter logic based on the selected dropdown value
    const filteredBranches = Object.entries(inventoryGrid).filter(
        ([branchName]) => {
            if (selectedBranch === "All Locations") return true;
            return branchName === selectedBranch;
        },
    );

    return (
        <div className={isNested ? "" : "min-h-screen bg-slate-50 p-8"}>
            {!isNested && (
                <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            <Droplet className="text-prc-red" /> PRC Public
                            Blood Directory
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-prc-red text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-prc-darkred"
                    >
                        Login / Register
                    </button>
                </header>
            )}

            <main
                className={`${isNested ? "" : "max-w-6xl mx-auto shadow-sm"} bg-white border border-slate-200 rounded-2xl p-6`}
            >
                {/* Updated Filter Section */}
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center">
                    <div className="relative flex-grow md:max-w-md">
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            disabled={loadingChapters}
                            className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-prc-red appearance-none cursor-pointer"
                        >
                            <option value="All Locations">
                                All Metro Manila Chapters
                            </option>
                            {!loadingChapters &&
                                Object.entries(chapters).map(
                                    ([category, names]) => (
                                        <optgroup
                                            key={category}
                                            label={category}
                                        >
                                            {names.map((name) => (
                                                <option key={name} value={name}>
                                                    {name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ),
                                )}
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {loading || loadingChapters ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-prc-red" />
                        <p className="text-sm font-bold">
                            Syncing live inventory from chapters...
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse text-center">
                            <thead>
                                <tr className="bg-slate-100 text-slate-700 font-bold">
                                    <th className="py-3 px-4 text-left rounded-l-lg whitespace-nowrap">
                                        Chapter Branch
                                    </th>
                                    <th className="w-16">O+</th>
                                    <th className="w-16">O-</th>
                                    <th className="w-16">A+</th>
                                    <th className="w-16">A-</th>
                                    <th className="w-16">B+</th>
                                    <th className="w-16">B-</th>
                                    <th className="w-16">AB+</th>
                                    <th className="w-16 rounded-r-lg">AB-</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-semibold">
                                {filteredBranches.length > 0 ? (
                                    filteredBranches.map(
                                        ([branchName, bloodTypes]) => (
                                            <tr
                                                key={branchName}
                                                className="hover:bg-slate-50 transition"
                                            >
                                                <td className="py-4 px-4 text-left font-bold text-slate-900">
                                                    {branchName}
                                                </td>
                                                <td>
                                                    {getStatusBadge(
                                                        bloodTypes["O+"],
                                                    )}
                                                </td>
                                                <td>
                                                    {getStatusBadge(
                                                        bloodTypes["O-"],
                                                    )}
                                                </td>
                                                <td>
                                                    {getStatusBadge(
                                                        bloodTypes["A+"],
                                                    )}
                                                </td>
                                                <td>
                                                    {getStatusBadge(
                                                        bloodTypes["A-"],
                                                    )}
                                                </td>
                                                <td>
                                                    {getStatusBadge(
                                                        bloodTypes["B+"],
                                                    )}
                                                </td>
                                                <td>
                                                    {getStatusBadge(
                                                        bloodTypes["B-"],
                                                    )}
                                                </td>
                                                <td>
                                                    {getStatusBadge(
                                                        bloodTypes["AB+"],
                                                    )}
                                                </td>
                                                <td>
                                                    {getStatusBadge(
                                                        bloodTypes["AB-"],
                                                    )}
                                                </td>
                                            </tr>
                                        ),
                                    )
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="py-8 text-center text-slate-500"
                                        >
                                            No inventory data available for the
                                            selected location.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
