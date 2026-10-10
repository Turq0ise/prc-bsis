import { useNavigate, useOutletContext } from "react-router-dom";
import {
    BellRing,
    Stethoscope,
    CheckCircle,
    Clock,
    CalendarPlus,
    QrCode,
    ChevronRight,
    Droplet,
    User as UserIcon,
} from "lucide-react";

export default function DonorDashboard() {
    const navigate = useNavigate();
    const { profile } = useOutletContext(); // Grabs the profile passed down from DonorLayout

    return (
        <div className="space-y-6">
            {/* Urgent Alert Banner */}
            <div className="bg-gradient-to-r from-red-600 to-prc-red rounded-xl p-5 text-white flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-sm">
                <div>
                    <div className="inline-flex items-center gap-1.5 bg-white/20 text-[10px] font-black uppercase px-2 py-0.5 rounded-full mb-2">
                        <BellRing className="w-3 h-3" /> Urgent Appeal For Your
                        Blood Group
                    </div>
                    <h2 className="text-lg font-bold">
                        Rizal Chapter needs O-Positive and Platelet Donors!
                    </h2>
                    <p className="text-xs text-red-100 mt-0.5">
                        Your home branch has reached Low Reserves for PRBC (O+).
                        You are fully eligible to donate today.
                    </p>
                </div>
                <button
                    onClick={() => navigate("/donor/book")}
                    className="bg-white text-prc-darkred text-xs font-bold px-5 py-2.5 rounded-lg shadow hover:bg-red-50 transition whitespace-nowrap"
                >
                    Book Appointment Slot &rarr;
                </button>
            </div>

            {/* 4-Column Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Blood Group
                        </p>
                        <h3 className="text-2xl font-black text-prc-red mt-1">
                            {profile?.blood_group || "O+"}
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                            Universal Red Cell
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-prc-red flex items-center justify-center font-black text-base shadow-inner">
                        <Droplet className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Donation Readiness
                    </p>
                    <span className="text-xl font-black text-emerald-600 block mt-1">
                        Eligible Now
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                        111 days since last donation
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Total Units Donated
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                        4 Units
                    </h3>
                    <p className="text-[10px] text-amber-600 font-bold mt-0.5">
                        Galloner Club: Bronze
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Digital Donor Pass
                    </p>
                    <h3 className="text-sm font-bold text-slate-900 mt-2">
                        {profile?.din || "Pending"}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 capitalize flex items-center gap-1">
                        <UserIcon className="w-3 h-3" /> {profile?.full_name}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Requisition Tracker */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-red-100 text-prc-red rounded-lg">
                                    <Stethoscope className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Hospital Blood Request Filed for You
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Initiated by your attending physician at
                                        The Medical City
                                    </p>
                                </div>
                            </div>
                            <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded">
                                IN PROGRESS
                            </span>
                        </div>

                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-6">
                            <div>
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                                    Request
                                </span>
                                <span className="font-bold">REQ-9025</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                                    Physician
                                </span>
                                <span className="font-medium">
                                    Dr. C. Mendoza
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                                    Component
                                </span>
                                <span className="font-bold text-prc-red">
                                    2x PRBC (O+)
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                                    Branch
                                </span>
                                <span className="font-medium">
                                    Rizal Chapter
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs px-2">
                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                <CheckCircle className="w-4 h-4" /> Submitted
                            </div>
                            <div className="h-0.5 flex-grow mx-2 bg-emerald-500"></div>
                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                <CheckCircle className="w-4 h-4" /> Verified
                            </div>
                            <div className="h-0.5 flex-grow mx-2 bg-prc-red"></div>
                            <div className="flex items-center gap-1.5 text-prc-red font-bold animate-pulse">
                                <Clock className="w-4 h-4" /> Crossmatching
                            </div>
                            <div className="h-0.5 flex-grow mx-2 bg-slate-200"></div>
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <span className="w-4 h-4 rounded-full border-2 border-slate-300"></span>{" "}
                                Ready
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Appointment */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">
                            Your Next Scheduled Donation
                        </h3>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-prc-red text-white p-3 rounded-xl text-center min-w-[60px]">
                                    <span className="text-[10px] uppercase font-bold block">
                                        OCT
                                    </span>
                                    <span className="text-xl font-black block leading-none">
                                        10
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900">
                                        Mobile Blood Donation Drive
                                    </h4>
                                    <p className="text-xs text-slate-600 mt-0.5">
                                        Robinsons Galleria - Activity Center,
                                        Level 1
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Time Slot:{" "}
                                        <strong>09:30 AM - 10:00 AM</strong>{" "}
                                        &bull; Whole Blood
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate("/donor/book")}
                                className="border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition"
                            >
                                Modify
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Quick Actions */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Quick Actions
                    </h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate("/donor/book")}
                            className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-prc-red hover:bg-red-50 transition flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 text-prc-red rounded-lg">
                                    <CalendarPlus className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800 group-hover:text-prc-red transition">
                                        Book Donation Slot
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                        Pick chapter or mobile drive
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>

                        <button
                            onClick={() =>
                                alert("Digital Pass Modal opens here.")
                            }
                            className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-prc-red hover:bg-red-50 transition flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                                    <QrCode className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800 group-hover:text-prc-red transition">
                                        Open Digital Pass
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                        Display QR code at intake
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
