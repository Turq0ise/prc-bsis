import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Lock,
    AlertTriangle,
    Info,
    Loader2,
    Calendar,
    MapPin,
    Clock,
    Droplet,
    ArrowLeft,
    CheckCircle,
    ChevronDown,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const roleDescriptions = {
    donor: "Public citizens who voluntarily donate blood. Access digital ID and booking.",
    physician:
        "Hospital doctors submitting institutional blood requests for patients.",
    staff: "Red Cross personnel managing inventory, testing, and dispenses.",
    admin: "System administrators overseeing audit logs and DOH compliance.",
};

export default function Login() {
    const navigate = useNavigate();

    // UI States
    const [isRegistering, setIsRegistering] = useState(false);
    const [isGuestBooking, setIsGuestBooking] = useState(false);
    const [guestSuccess, setGuestSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Auth & Registration State
    const [role, setRole] = useState("donor");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [sex, setSex] = useState("");
    const [bloodGroup, setBloodGroup] = useState("Unknown");

    // Guest Booking Specific State
    const [guestVenue, setGuestVenue] = useState("Rizal Chapter - Pasig");
    const [guestDate, setGuestDate] = useState("");
    const [guestTime, setGuestTime] = useState("09:00");
    const [guestType, setGuestType] = useState("Whole Blood");

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            if (isRegistering) {
                const { data: authData, error: authError } =
                    await supabase.auth.signUp({ email, password });
                if (authError) throw authError;

                if (authData.user) {
                    const isDonor = role === "donor";
                    const generatedDin = isDonor
                        ? `DIN-2026-${Math.floor(10000 + Math.random() * 90000)}`
                        : null;
                    const fullName = [
                        firstName.trim(),
                        middleName.trim(),
                        lastName.trim(),
                    ]
                        .filter(Boolean)
                        .join(" ");

                    const { error: profileError } = await supabase
                        .from("profiles")
                        .insert([
                            {
                                id: authData.user.id,
                                role: role,
                                full_name: fullName,
                                din: generatedDin,
                                birthdate:
                                    isDonor && birthdate ? birthdate : null,
                                sex: isDonor && sex ? sex : null,
                                blood_group: isDonor ? bloodGroup : null,
                            },
                        ]);

                    if (profileError) throw profileError;

                    alert("Registration successful! You can now sign in.");
                    setIsRegistering(false);
                    setPassword("");
                }
            } else {
                const { data: authData, error: authError } =
                    await supabase.auth.signInWithPassword({ email, password });
                if (authError) throw authError;

                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", authData.user.id)
                    .maybeSingle();
                if (profileError) throw profileError;
                if (!profile)
                    throw new Error(
                        "Profile data missing. Please register a fresh account.",
                    );

                const userRole = profile.role;
                if (userRole === "donor") navigate("/donor");
                if (userRole === "staff") navigate("/staff");
                if (userRole === "physician") navigate("/physician/request");
                if (userRole === "admin") navigate("/admin/audit");
            }
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestBooking = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            const scheduledTimestamp = new Date(
                `${guestDate}T${guestTime}`,
            ).toISOString();
            const fullName = [firstName.trim(), lastName.trim()]
                .filter(Boolean)
                .join(" ");

            const { error } = await supabase.from("appointments").insert([
                {
                    guest_name: fullName,
                    guest_email: email,
                    guest_blood_group: bloodGroup,
                    scheduled_date: scheduledTimestamp,
                    venue: guestVenue,
                    type: guestType,
                    status: "pending",
                },
            ]);

            if (error) throw error;
            setGuestSuccess(true);

            // Reset after showing success
            setTimeout(() => {
                setGuestSuccess(false);
                setIsGuestBooking(false);
                setFirstName("");
                setLastName("");
                setEmail("");
            }, 3000);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Render Guest Booking View
    if (isGuestBooking) {
        return (
            <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden w-full max-w-2xl">
                    <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">
                                Express Guest Booking
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Schedule a donation without creating an account.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsGuestBooking(false)}
                            className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 transition"
                        >
                            <ArrowLeft className="w-4 h-4" /> Cancel
                        </button>
                    </div>

                    <div className="p-8">
                        {guestSuccess ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                                <h3 className="text-2xl font-black text-slate-900">
                                    Slot Confirmed!
                                </h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    Please present your ID at the venue desk
                                    upon arrival.
                                </p>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleGuestBooking}
                                className="space-y-6"
                            >
                                {errorMsg && (
                                    <div className="bg-red-50 text-prc-darkred text-xs font-bold p-3 rounded-lg border border-red-200">
                                        {errorMsg}
                                    </div>
                                )}

                                {/* Guest Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={(e) =>
                                                setFirstName(e.target.value)
                                            }
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={lastName}
                                            onChange={(e) =>
                                                setLastName(e.target.value)
                                            }
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                                            Blood Group
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={bloodGroup}
                                                onChange={(e) =>
                                                    setBloodGroup(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full pl-3 pr-9 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red bg-white appearance-none"
                                            >
                                                <option value="Unknown">
                                                    Unknown (Test Required)
                                                </option>
                                                <option value="O+">
                                                    O Positive (O+)
                                                </option>
                                                <option value="O-">
                                                    O Negative (O-)
                                                </option>
                                                <option value="A+">
                                                    A Positive (A+)
                                                </option>
                                                <option value="A-">
                                                    A Negative (A-)
                                                </option>
                                                <option value="B+">
                                                    B Positive (B+)
                                                </option>
                                                <option value="B-">
                                                    B Negative (B-)
                                                </option>
                                                <option value="AB+">
                                                    AB Positive (AB+)
                                                </option>
                                                <option value="AB-">
                                                    AB Negative (AB-)
                                                </option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100" />

                                {/* Appointment Info (Mirrored from BookAppointment) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                                            Location / Venue
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                            <select
                                                value={guestVenue}
                                                onChange={(e) =>
                                                    setGuestVenue(
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red bg-white appearance-none"
                                            >
                                                <optgroup label="Permanent Chapters">
                                                    <option value="National HQ - Port Area">
                                                        National HQ - Port Area
                                                    </option>
                                                    <option value="Rizal Chapter - Pasig">
                                                        Rizal Chapter - Pasig
                                                    </option>
                                                </optgroup>
                                                <optgroup label="Upcoming Mobile Drives">
                                                    <option value="Robinsons Galleria - Activity Center">
                                                        Robinsons Galleria - Oct
                                                        10
                                                    </option>
                                                </optgroup>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                                            Date
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                            <input
                                                type="date"
                                                value={guestDate}
                                                onChange={(e) =>
                                                    setGuestDate(e.target.value)
                                                }
                                                min={
                                                    new Date()
                                                        .toISOString()
                                                        .split("T")[0]
                                                }
                                                required
                                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                                            Time
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                            <input
                                                type="time"
                                                value={guestTime}
                                                onChange={(e) =>
                                                    setGuestTime(e.target.value)
                                                }
                                                required
                                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red"
                                            />
                                        </div>
                                    </div>
                                    {/* Re-added Donation Type Dropdown using Droplet and setGuestType */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                                            Donation Type
                                        </label>
                                        <div className="relative">
                                            <Droplet className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                            <select
                                                value={guestType}
                                                onChange={(e) =>
                                                    setGuestType(e.target.value)
                                                }
                                                required
                                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red bg-white appearance-none"
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
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-slate-900 text-white py-3 rounded-lg text-sm font-bold shadow-md hover:bg-slate-800 flex justify-center items-center gap-2 transition"
                                    >
                                        {loading && (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        )}
                                        Confirm Guest Appointment
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Standard Login/Register View
    return (
        <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden w-full max-w-lg">
                <div className="bg-prc-red p-6 text-white text-center">
                    <h2 className="text-xl font-bold tracking-tight">
                        PHILIPPINE RED CROSS
                    </h2>
                    <p className="text-xs text-red-100 uppercase tracking-widest mt-1">
                        Blood Services Information System
                    </p>
                </div>

                <div className="p-8">
                    <div className="mb-5 pb-3 border-b border-slate-100 flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-black text-slate-900">
                                {isRegistering
                                    ? "Create New Account"
                                    : "Account Sign In"}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {isRegistering
                                    ? "Register your details to generate your digital ID and access the platform."
                                    : "Enter your credentials to access your designated portal."}
                            </p>
                        </div>
                        {/* Quick Guest Booking Button */}
                        {!isRegistering && (
                            <button
                                onClick={() => {
                                    setIsGuestBooking(true);
                                    setErrorMsg("");
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-md transition border border-slate-200"
                            >
                                Quick Guest Booking &rarr;
                            </button>
                        )}
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                Select Portal Role
                            </span>
                            <div className="group relative flex items-center cursor-help">
                                <Info className="w-4 h-4 text-slate-400 hover:text-prc-red transition" />
                                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg hidden group-hover:block z-10">
                                    {roleDescriptions[role]}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 bg-slate-100 p-1 rounded-lg text-xs font-semibold text-center text-slate-600">
                            {["donor", "physician", "staff", "admin"].map(
                                (r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`py-2 capitalize transition-all ${role === r ? "bg-white rounded-md shadow-sm text-prc-red font-bold" : "hover:text-slate-900"}`}
                                    >
                                        {r}
                                    </button>
                                ),
                            )}
                        </div>
                    </div>

                    <form className="space-y-4" onSubmit={handleAuth}>
                        {errorMsg && (
                            <div className="bg-red-50 text-prc-darkred text-xs font-bold p-3 rounded-lg border border-red-200">
                                {errorMsg}
                            </div>
                        )}

                        {/* Registration Fields */}
                        {isRegistering && (
                            <div className="space-y-4 pt-2 pb-4 border-b border-slate-100">
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            required={isRegistering}
                                            value={firstName}
                                            onChange={(e) =>
                                                setFirstName(e.target.value)
                                            }
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                            M.I.
                                        </label>
                                        <input
                                            type="text"
                                            value={middleName}
                                            onChange={(e) =>
                                                setMiddleName(e.target.value)
                                            }
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            required={isRegistering}
                                            value={lastName}
                                            onChange={(e) =>
                                                setLastName(e.target.value)
                                            }
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red"
                                        />
                                    </div>
                                </div>

                                {role === "donor" && (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                                    Date of Birth *
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="date"
                                                        required={
                                                            isRegistering &&
                                                            role === "donor"
                                                        }
                                                        value={birthdate}
                                                        onChange={(e) =>
                                                            setBirthdate(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                                    Sex at Birth *
                                                </label>
                                                <select
                                                    required={
                                                        isRegistering &&
                                                        role === "donor"
                                                    }
                                                    value={sex}
                                                    onChange={(e) =>
                                                        setSex(e.target.value)
                                                    }
                                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red bg-white"
                                                >
                                                    <option value="" disabled>
                                                        Select...
                                                    </option>
                                                    <option value="Male">
                                                        Male
                                                    </option>
                                                    <option value="Female">
                                                        Female
                                                    </option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                                                Blood Group
                                            </label>
                                            <select
                                                value={bloodGroup}
                                                onChange={(e) =>
                                                    setBloodGroup(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red bg-white"
                                            >
                                                <option value="Unknown">
                                                    Unknown (Test Required)
                                                </option>
                                                <option value="O+">
                                                    O Positive (O+)
                                                </option>
                                                <option value="O-">
                                                    O Negative (O-)
                                                </option>
                                                <option value="A+">
                                                    A Positive (A+)
                                                </option>
                                                <option value="A-">
                                                    A Negative (A-)
                                                </option>
                                                <option value="B+">
                                                    B Positive (B+)
                                                </option>
                                                <option value="B-">
                                                    B Negative (B-)
                                                </option>
                                                <option value="AB+">
                                                    AB Positive (AB+)
                                                </option>
                                                <option value="AB-">
                                                    AB Negative (AB-)
                                                </option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red"
                                />
                            </div>
                        </div>

                        <div className="pt-2 space-y-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-prc-red text-white py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-prc-darkred flex justify-center items-center gap-2 transition"
                            >
                                {loading && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                {isRegistering
                                    ? "Complete Registration"
                                    : "Sign In to Portal"}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setErrorMsg("");
                                }}
                                className="w-full bg-white border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-50 transition"
                            >
                                {isRegistering
                                    ? "Back to Sign In"
                                    : "Register New Account"}
                            </button>
                        </div>
                    </form>

                    <div
                        className="mt-6 p-3.5 bg-prc-lightred border border-prc-borderred rounded-xl flex items-center gap-3 cursor-pointer hover:shadow-sm transition"
                        onClick={() => navigate("/public-board")}
                    >
                        <AlertTriangle className="w-6 h-6 text-prc-red flex-shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-prc-darkred">
                                Looking for urgent blood availability?
                            </p>
                            <p className="text-xs text-prc-red underline font-semibold">
                                View Public Supply Directory &rarr;
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
