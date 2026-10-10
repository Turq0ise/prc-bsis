import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import QRCode from "react-qr-code";
import { supabase } from "../../lib/supabase";
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
    Loader2,
    X,
} from "lucide-react";

export default function DonorDashboard() {
    const navigate = useNavigate();
    const { profile } = useOutletContext();

    const [loadingData, setLoadingData] = useState(true);

    // Default states
    const [alertData] = useState({
        isActive: true, // Static for prototype
        title: "Rizal Chapter needs O-Positive and Platelet Donors!",
        message:
            "Your home branch has reached Low Reserves for PRBC (O+). You are fully eligible to donate today.",
    });

    const [donationStats, setDonationStats] = useState({
        isEligible: true,
        daysSinceLast: 0,
        totalUnits: 0,
        gallonerTier: "None",
    });

    const [activeRequest, setActiveRequest] = useState({ hasActive: false });
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);

    // Date Formatting Helpers
    const getDaysSince = (dateStr) => {
        if (!dateStr) return 0;
        const diffTime = Math.abs(new Date() - new Date(dateStr));
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const formatAppt = (dateStr) => {
        const d = new Date(dateStr);
        return {
            month: d
                .toLocaleString("default", { month: "short" })
                .toUpperCase(),
            day: d.getDate().toString(),
            time: d.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
    };

    const [isQrModalOpen, setIsQrModalOpen] = useState(false);

    // Fetch Database Data
    useEffect(() => {
        if (!profile?.id) return;

        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Blood Units (Donation History)
                const { data: units } = await supabase
                    .from("blood_units")
                    .select("collection_date")
                    .eq("donor_id", profile.id)
                    .order("collection_date", { ascending: false });

                if (units && units.length > 0) {
                    const days = getDaysSince(units[0].collection_date);
                    setDonationStats({
                        isEligible: days >= 90, // Eligible if >= 90 days since last donation
                        daysSinceLast: days,
                        totalUnits: units.length,
                        gallonerTier: units.length >= 4 ? "Bronze" : "None",
                    });
                }

                // 2. Fetch Upcoming Appointment
                const { data: appts } = await supabase
                    .from("appointments")
                    .select("*")
                    .eq("donor_id", profile.id)
                    .eq("status", "pending")
                    .order("scheduled_date", { ascending: true });

                setUpcomingAppointments(appts || []);

                // 3. Fetch Active Requisition
                const { data: req } = await supabase
                    .from("requisitions")
                    .select("*")
                    .eq("target_donor_id", profile.id)
                    .neq("status", "completed")
                    .maybeSingle();

                if (req) {
                    // Fetch physician name manually to avoid complex FK routing in prototype
                    const { data: phys } = await supabase
                        .from("profiles")
                        .select("full_name")
                        .eq("id", req.physician_id)
                        .maybeSingle();

                    setActiveRequest({
                        hasActive: true,
                        reqId: req.req_id,
                        physician: phys
                            ? `Dr. ${phys.full_name}`
                            : "Attending Physician",
                        hospital: req.hospital,
                        component: req.component,
                        branch: req.branch,
                        status: req.status,
                    });
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoadingData(false);
            }
        };

        fetchDashboardData();
    }, [profile]);

    const getStatusLevel = (status) => {
        const levels = {
            submitted: 1,
            verified: 2,
            crossmatching: 3,
            ready: 4,
        };
        return levels[status] || 0;
    };
    const reqLevel = getStatusLevel(activeRequest?.status);

    if (loadingData) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-prc-red" />
                <p className="text-sm font-bold">
                    Syncing your donation records...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Urgent Alert Banner */}
            {alertData.isActive && (
                <div className="bg-gradient-to-r from-red-600 to-prc-red rounded-xl p-5 text-white flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-sm">
                    <div>
                        <div className="inline-flex items-center gap-1.5 bg-white/20 text-[10px] font-black uppercase px-2 py-0.5 rounded-full mb-2">
                            <BellRing className="w-3 h-3" /> Urgent Appeal For
                            Your Blood Group
                        </div>
                        <h2 className="text-lg font-bold">{alertData.title}</h2>
                        <p className="text-xs text-red-100 mt-0.5">
                            {alertData.message}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/donor/book")}
                        className="bg-white text-prc-darkred text-xs font-bold px-5 py-2.5 rounded-lg shadow hover:bg-red-50 transition whitespace-nowrap"
                    >
                        Book Appointment Slot &rarr;
                    </button>
                </div>
            )}

            {/* 4-Column Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Blood Group
                        </p>
                        <h3 className="text-2xl font-black text-prc-red mt-1">
                            {profile?.blood_group || "Unknown"}
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                            Medical File
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
                    <span
                        className={`text-xl font-black block mt-1 ${donationStats.isEligible ? "text-emerald-600" : "text-prc-red"}`}
                    >
                        {donationStats.isEligible
                            ? "Eligible Now"
                            : "Not Eligible"}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                        {donationStats.daysSinceLast === 0
                            ? "First time donor!"
                            : `${donationStats.daysSinceLast} days since last donation`}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Total Units Donated
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                        {donationStats.totalUnits} Units
                    </h3>
                    <p className="text-[10px] text-amber-600 font-bold mt-0.5">
                        Galloner Club: {donationStats.gallonerTier}
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
                    {activeRequest.hasActive && (
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
                                            Initiated by your attending
                                            physician at{" "}
                                            {activeRequest.hospital}
                                        </p>
                                    </div>
                                </div>
                                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded uppercase">
                                    {activeRequest.status}
                                </span>
                            </div>

                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-6">
                                <div>
                                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                                        Request
                                    </span>
                                    <span className="font-bold">
                                        {activeRequest.reqId}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                                        Physician
                                    </span>
                                    <span className="font-medium">
                                        {activeRequest.physician}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                                        Component
                                    </span>
                                    <span className="font-bold text-prc-red">
                                        {activeRequest.component}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                                        Branch
                                    </span>
                                    <span className="font-medium">
                                        {activeRequest.branch}
                                    </span>
                                </div>
                            </div>

                            {/* Dynamic Status Progress Bar */}
                            <div className="flex items-center justify-between text-xs px-2">
                                <div
                                    className={`flex items-center gap-1.5 font-bold ${reqLevel >= 1 ? "text-emerald-600" : "text-slate-400"}`}
                                >
                                    {reqLevel >= 1 ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <span className="w-4 h-4 rounded-full border-2 border-slate-300"></span>
                                    )}{" "}
                                    Submitted
                                </div>
                                <div
                                    className={`h-0.5 flex-grow mx-2 ${reqLevel >= 2 ? "bg-emerald-500" : "bg-slate-200"}`}
                                ></div>

                                <div
                                    className={`flex items-center gap-1.5 font-bold ${reqLevel >= 2 ? "text-emerald-600" : "text-slate-400"}`}
                                >
                                    {reqLevel >= 2 ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <span className="w-4 h-4 rounded-full border-2 border-slate-300"></span>
                                    )}{" "}
                                    Verified
                                </div>
                                <div
                                    className={`h-0.5 flex-grow mx-2 ${reqLevel >= 3 ? (reqLevel === 3 ? "bg-prc-red" : "bg-emerald-500") : "bg-slate-200"}`}
                                ></div>

                                <div
                                    className={`flex items-center gap-1.5 font-bold ${reqLevel === 3 ? "text-prc-red animate-pulse" : reqLevel > 3 ? "text-emerald-600" : "text-slate-400"}`}
                                >
                                    {reqLevel > 3 ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : reqLevel === 3 ? (
                                        <Clock className="w-4 h-4" />
                                    ) : (
                                        <span className="w-4 h-4 rounded-full border-2 border-slate-300"></span>
                                    )}{" "}
                                    Crossmatching
                                </div>
                                <div
                                    className={`h-0.5 flex-grow mx-2 ${reqLevel >= 4 ? "bg-emerald-500" : "bg-slate-200"}`}
                                ></div>

                                <div
                                    className={`flex items-center gap-1.5 font-bold ${reqLevel >= 4 ? "text-emerald-600" : "text-slate-400"}`}
                                >
                                    {reqLevel >= 4 ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <span className="w-4 h-4 rounded-full border-2 border-slate-300"></span>
                                    )}{" "}
                                    Ready
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upcoming Appointments List */}
                    {upcomingAppointments.length > 0 ? (
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 mb-4">
                                Your Scheduled Donations
                            </h3>
                            <div className="space-y-3">
                                {upcomingAppointments.map((appt) => {
                                    const formatted = formatAppt(
                                        appt.scheduled_date,
                                    );
                                    return (
                                        <div
                                            key={appt.id}
                                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl gap-4"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="bg-prc-red text-white p-3 rounded-xl text-center min-w-[60px]">
                                                    <span className="text-[10px] uppercase font-bold block">
                                                        {formatted.month}
                                                    </span>
                                                    <span className="text-xl font-black block leading-none">
                                                        {formatted.day}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-900">
                                                        Scheduled Donation Slot
                                                    </h4>
                                                    <p className="text-xs text-slate-600 mt-0.5">
                                                        {appt.venue}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 mt-1">
                                                        Time Slot:{" "}
                                                        <strong>
                                                            {formatted.time}
                                                        </strong>{" "}
                                                        &bull; {appt.type}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    navigate("/donor/book", {
                                                        state: {
                                                            existingAppointment:
                                                                appt,
                                                        },
                                                    })
                                                }
                                                className="border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition whitespace-nowrap"
                                            >
                                                Modify
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center">
                            <CalendarPlus className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-slate-900">
                                No Upcoming Appointments
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 mb-4">
                                Schedule your next donation at a nearby chapter
                                or mobile drive.
                            </p>
                            <button
                                onClick={() => navigate("/donor/book")}
                                className="bg-prc-red text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow hover:bg-prc-darkred transition"
                            >
                                Book a Time Slot
                            </button>
                        </div>
                    )}
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
                            onClick={() => setIsQrModalOpen(true)}
                            className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-prc-red hover:bg-red-50 transition flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg group-hover:bg-red-100 group-hover:text-prc-red transition">
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
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-prc-red transition" />
                        </button>
                    </div>
                </div>

                {/* QR Code Digital Pass Modal */}
                {isQrModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="bg-prc-red p-4 flex justify-between items-center text-white">
                                <div>
                                    <h3 className="font-bold">
                                        Digital Donor Pass
                                    </h3>
                                    <p className="text-[10px] text-red-100 uppercase tracking-wider">
                                        Philippine Red Cross
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsQrModalOpen(false)}
                                    className="p-1 hover:bg-white/20 rounded-lg transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 flex flex-col items-center">
                                <div className="bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm mb-4">
                                    {profile?.din ? (
                                        <QRCode
                                            value={profile.din}
                                            size={200}
                                            level="H" // High error correction so it scans easily on mobile screens
                                            fgColor="#0f172a" // slate-900
                                        />
                                    ) : (
                                        <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-50 text-slate-400 text-xs text-center p-4">
                                            DIN not assigned yet.
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-xl font-black text-slate-900 mt-2">
                                    {profile?.full_name}
                                </h2>
                                <p className="text-sm font-bold text-prc-red mt-1">
                                    {profile?.din || "Pending DIN"}
                                </p>

                                <div className="w-full h-px bg-slate-100 my-4"></div>

                                <div className="w-full flex justify-between text-xs">
                                    <span className="text-slate-500 font-semibold">
                                        Blood Group
                                    </span>
                                    <span className="font-bold text-slate-900">
                                        {profile?.blood_group || "Unknown"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
