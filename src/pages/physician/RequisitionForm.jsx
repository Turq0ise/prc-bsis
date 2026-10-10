import { FileUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RequisitionForm() {
    const navigate = useNavigate();

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                <div>
                    <span className="text-xs text-prc-red font-bold uppercase tracking-wider">
                        Hospital Liaison Portal
                    </span>
                    <h2 className="text-lg font-bold">
                        Submit Official Blood Requisition
                    </h2>
                </div>
                <div className="text-right text-xs">
                    <p className="font-bold text-white">
                        Dr. Carlos V. Mendoza
                    </p>
                    <p className="text-slate-400">PRC License: 0074129</p>
                </div>
            </div>

            <form
                className="p-6 md:p-8 space-y-6"
                onSubmit={(e) => {
                    e.preventDefault();
                    navigate("/physician/request");
                }}
            >
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        1. Admitted Patient Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Patient Full Name
                            </label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Hospital / Medical Center
                            </label>
                            <input
                                type="text"
                                defaultValue="The Medical City - Ortigas"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Clinical Diagnosis
                            </label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        2. Blood Specification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Target PRC Chapter
                            </label>
                            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                                <option>Rizal Chapter - Pasig</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Component Needed
                            </label>
                            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                                <option>Packed Red Blood Cells</option>
                                <option>Platelets</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Urgency
                            </label>
                            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-prc-red font-bold">
                                <option>STAT / Emergency</option>
                                <option>Urgent</option>
                                <option>Routine</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        3. Doctor's Signed Request Form
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 cursor-pointer">
                        <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-700">
                            Click or drag hospital requisition slip here
                        </p>
                    </div>
                </div>

                <div className="pt-4 flex items-center justify-end">
                    <button
                        type="submit"
                        className="bg-prc-red hover:bg-prc-darkred text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-md transition"
                    >
                        Submit Official Requisition &rarr;
                    </button>
                </div>
            </form>
        </div>
    );
}
