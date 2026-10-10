import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Lock,
    AlertTriangle,
    Info,
    Loader2,
    Calendar,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { isAdmin } from "../lib/adminRoles";

const roleDescriptions = {
    donor: "Public citizens who voluntarily donate blood. Access digital ID and booking.",
    physician:
        "Hospital doctors submitting institutional blood requests for patients.",
    staff: "Red Cross personnel managing inventory, testing, and dispenses.",
    admin: "System administrators overseeing audit logs and DOH compliance.",
};

export default function Login() {
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);
    const [role, setRole] = useState("donor");

    // Auth State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Universal Registration State
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");

    // Donor-Only Registration State
    const [birthdate, setBirthdate] = useState("");
    const [sex, setSex] = useState("");
    const [bloodGroup, setBloodGroup] = useState("Unknown");

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            if (isRegistering) {
                if (isAdmin(role)) throw new Error("Admin registration is not available here. Contact your project administrator.");
                const { data: authData, error: authError } =
                    await supabase.auth.signUp({
                        email,
                        password,
                    });
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
                                // Only insert these values if the user is a donor, otherwise pass null
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
                    await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });
                if (authError) throw authError;

                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", authData.user.id)
                    .maybeSingle();

                if (profileError) throw profileError;
                if (!profile)
                    throw new Error(
                        "Profile data missing. Please register a fresh account.",
                    );

                const userRole = profile.role;
                if (profile.is_active === false) {
                    await supabase.auth.signOut();
                    throw new Error("Your account has been disabled. Contact your administrator.");
                }
                if (userRole === "donor") navigate("/donor");
                if (userRole === "staff") navigate("/staff");
                if (userRole === "physician") navigate("/physician/request");
                if (isAdmin(userRole)) navigate("/admin/audit");
                if (!["donor", "staff", "physician"].includes(userRole) && !isAdmin(userRole)) throw new Error("Your account has no assigned portal role. Contact your administrator.");
            }
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

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
                    <div className="mb-5 pb-3 border-b border-slate-100">
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
                            {(isRegistering ? ["donor", "physician", "staff"] : ["donor", "physician", "staff", "admin"]).map(
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
                                {/* Names: Required for all roles */}
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

                                {/* Demographics: Only required and visible for donors */}
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
                                    if (!isRegistering) setRole("donor");
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
