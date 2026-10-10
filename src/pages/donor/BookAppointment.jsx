import { useChapters } from "../../hooks/useChapters";
import { useState, useEffect } from "react";
import { useNavigate, useOutletContext, useLocation } from "react-router-dom";
import {
    Calendar as CalendarIcon,
    MapPin,
    Clock,
    Droplet,
    ArrowLeft,
    Loader2,
    CheckCircle,
    ChevronDown,
    Calendar,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function BookAppointment() {
    const navigate = useNavigate();
    const { profile } = useOutletContext();
    const location = useLocation();

    const existingAppointment = location.state?.existingAppointment || null;
    const isEditing = !!existingAppointment;

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // State for the right sidebar live list
    const [myAppointments, setMyAppointments] = useState([]);
    const [fetchingAppts, setFetchingAppts] = useState(true);

    const { chapters, loadingChapters } = useChapters();

    // Fetch all pending appointments for this donor on load
    useEffect(() => {
        const fetchMyAppointments = async () => {
            if (!profile?.id) return;
            try {
                const { data, error } = await supabase
                    .from("appointments")
                    .select("*")
                    .eq("donor_id", profile.id)
                    .eq("status", "pending")
                    .order("scheduled_date", { ascending: true });

                if (error) throw error;
                setMyAppointments(data || []);
            } catch (err) {
                console.error("Error fetching appointments:", err);
            } finally {
                setFetchingAppts(false);
            }
        };

        fetchMyAppointments();
    }, [profile]);

    const getLocalInputValues = (isoString) => {
        if (!isoString) return { date: "", time: "09:00" };
        const d = new Date(isoString);
        const tzOffset = d.getTimezoneOffset() * 60000;
        const localISOTime = new Date(d.getTime() - tzOffset).toISOString();
        return {
            date: localISOTime.split("T")[0],
            time: localISOTime.split("T")[1].substring(0, 5),
        };
    };

    const initialDateTime = getLocalInputValues(
        existingAppointment?.scheduled_date,
    );

    const [venue, setVenue] = useState(
        existingAppointment?.venue || "Rizal Chapter - Pasig",
    );
    const [date, setDate] = useState(initialDateTime.date);
    const [time, setTime] = useState(initialDateTime.time);
    const [type, setType] = useState(
        existingAppointment?.type || "Whole Blood",
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            const scheduledTimestamp = new Date(
                `${date}T${time}`,
            ).toISOString();

            if (isEditing) {
                const { error } = await supabase
                    .from("appointments")
                    .update({
                        scheduled_date: scheduledTimestamp,
                        venue: venue,
                        type: type,
                    })
                    .eq("id", existingAppointment.id);

                if (error) throw error;
            } else {
                const { error } = await supabase.from("appointments").insert([
                    {
                        donor_id: profile.id,
                        scheduled_date: scheduledTimestamp,
                        venue: venue,
                        type: type,
                        status: "pending",
                    },
                ]);
                if (error) throw error;
            }

            setSuccess(true);
            setTimeout(() => navigate("/donor"), 2000);
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center shadow-sm h-[60vh]">
                <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                <h2 className="text-2xl font-black text-slate-900">
                    {isEditing
                        ? "Appointment Updated!"
                        : "Appointment Confirmed!"}
                </h2>
                <p className="text-slate-500 mt-2 max-w-md">
                    Your slot at {venue} has been secured. Returning to your
                    dashboard...
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side: Form Container */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-6 flex items-center justify-between bg-slate-50">
                    <div>
                        <h2 className="text-lg font-black text-slate-900">
                            {isEditing
                                ? "Modify Appointment Slot"
                                : "Schedule Donation Slot"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Select a branch or mobile drive to book your visit.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/donor")}
                        className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-slate-900 transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    {errorMsg && (
                        <div className="mb-6 bg-red-50 text-prc-darkred text-xs font-bold p-3 rounded-lg border border-red-200">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Venue Selection */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                                Location / Venue
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <select
                                    value={venue}
                                    onChange={(e) => setVenue(e.target.value)}
                                    required
                                    disabled={loadingChapters}
                                    className="w-full pl-10 pr-10 py-3 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-prc-red bg-white appearance-none"
                                >
                                    {loadingChapters ? (
                                        <option>Loading locations...</option>
                                    ) : (
                                        Object.entries(chapters).map(
                                            ([category, names]) => (
                                                <optgroup
                                                    key={category}
                                                    label={category}
                                                >
                                                    {names.map((name) => (
                                                        <option
                                                            key={name}
                                                            value={name}
                                                        >
                                                            {name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ),
                                        )
                                    )}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                                    Preferred Date
                                </label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) =>
                                            setDate(e.target.value)
                                        }
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        required
                                        className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-prc-red"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                                    Time Slot
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) =>
                                            setTime(e.target.value)
                                        }
                                        required
                                        className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-prc-red"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Donation Type */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                                Donation Type
                            </label>
                            <div className="relative">
                                <Droplet className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-10 py-3 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-prc-red bg-white appearance-none"
                                >
                                    <option value="Whole Blood">
                                        Whole Blood (Standard)
                                    </option>
                                    <option value="Platelet Apheresis">
                                        Platelet Apheresis
                                    </option>
                                    <option value="Plasma Apheresis">
                                        Plasma Apheresis
                                    </option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                                *Apheresis donations require specialized
                                equipment and may not be available at all mobile
                                drives. A medical officer will confirm
                                eligibility upon arrival.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex gap-3">
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => navigate("/donor")}
                                    className="bg-white border border-slate-300 text-slate-700 py-3.5 px-6 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-prc-red text-white flex-grow py-3.5 rounded-xl font-bold shadow-md hover:bg-prc-darkred transition flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : isEditing ? (
                                    "Save Changes"
                                ) : (
                                    "Confirm Booking"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Side: Live Database Appointments Overview */}
            <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-prc-red" /> Your
                        Scheduled Appointments
                    </h3>

                    {fetchingAppts ? (
                        <div className="py-8 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-prc-red" />{" "}
                            Loading appointments...
                        </div>
                    ) : myAppointments.length > 0 ? (
                        <div className="space-y-3">
                            {myAppointments.map((appt) => {
                                const isCurrentBeingEdited =
                                    existingAppointment &&
                                    existingAppointment.id === appt.id;

                                return (
                                    <div
                                        key={appt.id}
                                        className={`p-3.5 rounded-xl border transition text-xs ${
                                            isCurrentBeingEdited
                                                ? "bg-red-50 border-2 border-prc-red shadow-sm"
                                                : "bg-slate-50 border-slate-200"
                                        }`}
                                    >
                                        {isCurrentBeingEdited && (
                                            <span className="inline-block bg-prc-red text-white text-[9px] font-black uppercase px-2 py-0.5 rounded mb-1.5">
                                                Currently Modifying
                                            </span>
                                        )}
                                        <p className="font-bold text-slate-900">
                                            {appt.venue}
                                        </p>
                                        <p className="text-slate-600 mt-1 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            {new Date(
                                                appt.scheduled_date,
                                            ).toLocaleString([], {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                        <p className="text-[10px] text-prc-red font-bold mt-1.5 uppercase tracking-wide">
                                            {appt.type || "Whole Blood"}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                            No active pending appointments found in database.
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2">
                        Important Reminders
                    </h4>
                    <ul className="text-xs space-y-2 text-slate-300">
                        <li className="flex items-start gap-2">
                            <span className="text-prc-red font-bold">
                                &bull;
                            </span>{" "}
                            Get at least 6 hours of sleep before your scheduled
                            visit.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-prc-red font-bold">
                                &bull;
                            </span>{" "}
                            Eat a hearty meal and drink plenty of fluids
                            beforehand.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-prc-red font-bold">
                                &bull;
                            </span>{" "}
                            Bring a valid government or student ID.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
