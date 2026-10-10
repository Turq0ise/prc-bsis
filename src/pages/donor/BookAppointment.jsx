import { useNavigate } from "react-router-dom";

export default function BookAppointment() {
    const navigate = useNavigate();

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden max-w-5xl mx-auto">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">
                        Schedule Blood Donation Appointment
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Select your preferred venue, donation type, and complete
                        digital triage
                    </p>
                </div>
                <button
                    onClick={() => navigate("/donor")}
                    className="text-xs border border-slate-700 text-slate-300 hover:bg-slate-800 px-3 py-1.5 rounded-lg"
                >
                    &larr; Back
                </button>
            </div>

            <form
                className="p-6 md:p-8 space-y-8"
                onSubmit={(e) => {
                    e.preventDefault();
                    navigate("/donor");
                }}
            >
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
                        1. Select Venue & Donation Category
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Available Location / Drive Site
                            </label>
                            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold bg-white">
                                <option>
                                    Robinsons Galleria - Activity Center, Level
                                    1
                                </option>
                                <option>
                                    Rizal Chapter Headquarters - Pasig City
                                </option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Donation Procedure Type
                            </label>
                            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold bg-white">
                                <option>Whole Blood Donation (450 mL)</option>
                                <option>Apheresis Platelet Donation</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
                        2. Choose Date & Time
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Select Date
                            </label>
                            <input
                                type="date"
                                defaultValue="2026-10-10"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Available Slots
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    className="p-2 border-2 border-prc-red bg-red-50 text-prc-darkred rounded-lg text-center font-bold text-xs"
                                >
                                    09:30 - 10:00
                                </button>
                                <button
                                    type="button"
                                    className="p-2 border border-slate-200 rounded-lg text-center text-xs"
                                >
                                    10:30 - 11:00
                                </button>
                                <button
                                    type="button"
                                    className="p-2 border border-slate-200 rounded-lg text-center text-xs"
                                >
                                    11:30 - 12:00
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
                        3. Preliminary Health Self-Screening
                    </h3>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <span className="font-medium">
                                Are you feeling healthy, well, and fever-free
                                today?
                            </span>
                            <div className="flex gap-4">
                                <label>
                                    <input
                                        type="radio"
                                        name="q1"
                                        defaultChecked
                                    />{" "}
                                    Yes
                                </label>
                                <label>
                                    <input type="radio" name="q1" /> No
                                </label>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <span className="font-medium">
                                Have you consumed any alcoholic beverages in the
                                last 24 hours?
                            </span>
                            <div className="flex gap-4">
                                <label>
                                    <input type="radio" name="q2" /> Yes
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="q2"
                                        defaultChecked
                                    />{" "}
                                    No
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-prc-red hover:bg-prc-darkred text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-md transition"
                    >
                        Confirm & Generate Pass &rarr;
                    </button>
                </div>
            </form>
        </div>
    );
}
