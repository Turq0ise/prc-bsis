import { MapPin, Droplet } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PublicBoard({ isNested = false }) {
    const navigate = useNavigate();

    return (
        <div className={isNested ? "" : "min-h-screen bg-slate-50 p-8"}>
            {/* Hide this standalone header if rendered inside a layout */}
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="relative col-span-2">
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <select className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-prc-red">
                            <option>All Metro Manila Chapters</option>
                            <option>Rizal Chapter (Pasig)</option>
                        </select>
                    </div>
                    <button className="col-span-2 md:col-span-1 bg-slate-900 text-white font-bold rounded-lg text-sm py-2 hover:bg-slate-800 transition shadow-sm">
                        Filter Status
                    </button>
                </div>

                <table className="w-full text-left text-xs border-collapse text-center">
                    <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold">
                            <th className="py-3 px-4 text-left rounded-l-lg">
                                Chapter Branch
                            </th>
                            <th>O+</th>
                            <th>O-</th>
                            <th>A+</th>
                            <th>B+</th>
                            <th className="rounded-r-lg">AB+</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold">
                        <tr>
                            <td className="py-4 px-4 text-left font-bold text-slate-900">
                                National HQ (Port Area)
                            </td>
                            <td>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded">
                                    SUFFICIENT
                                </span>
                            </td>
                            <td>
                                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded">
                                    LOW
                                </span>
                            </td>
                            <td>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded">
                                    SUFFICIENT
                                </span>
                            </td>
                            <td>
                                <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded">
                                    SURPLUS
                                </span>
                            </td>
                            <td>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded">
                                    SUFFICIENT
                                </span>
                            </td>
                        </tr>
                        <tr className="bg-red-50/50">
                            <td className="py-4 px-4 text-left font-bold text-slate-900">
                                Rizal Chapter (Pasig)
                            </td>
                            <td>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded">
                                    SUFFICIENT
                                </span>
                            </td>
                            <td>
                                <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded font-black shadow-sm">
                                    CRITICAL
                                </span>
                            </td>
                            <td>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded">
                                    SUFFICIENT
                                </span>
                            </td>
                            <td>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded">
                                    SUFFICIENT
                                </span>
                            </td>
                            <td>
                                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded">
                                    LOW
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </main>
        </div>
    );
}
