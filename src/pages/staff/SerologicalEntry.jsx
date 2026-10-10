import { CheckCircle } from "lucide-react";

export default function SerologicalEntry() {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-sm font-bold mb-4">
                Serological TTI Screening Log
            </h2>
            <div className="bg-slate-50 p-4 rounded-lg grid grid-cols-6 gap-4 items-end text-xs">
                <div>
                    <label className="block font-semibold mb-1">
                        ISBT Barcode
                    </label>
                    <input
                        type="text"
                        placeholder="Scan bag..."
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1">HIV</label>
                    <select className="w-full border p-2 rounded bg-white">
                        <option>Non-Reactive</option>
                        <option>Reactive</option>
                    </select>
                </div>
                <div>
                    <label className="block font-semibold mb-1">HBV</label>
                    <select className="w-full border p-2 rounded bg-white">
                        <option>Non-Reactive</option>
                        <option>Reactive</option>
                    </select>
                </div>
                <div>
                    <label className="block font-semibold mb-1">HCV</label>
                    <select className="w-full border p-2 rounded bg-white">
                        <option>Non-Reactive</option>
                        <option>Reactive</option>
                    </select>
                </div>
                <div>
                    <label className="block font-semibold mb-1">
                        Syphilis/Malaria
                    </label>
                    <select className="w-full border p-2 rounded bg-white">
                        <option>Non-Reactive</option>
                        <option>Reactive</option>
                    </select>
                </div>
                <button className="bg-emerald-600 text-white font-bold py-2 rounded flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Clear Unit
                </button>
            </div>
        </div>
    );
}
