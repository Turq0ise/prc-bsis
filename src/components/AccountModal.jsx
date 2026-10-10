import { useState } from "react";
import { supabase } from "../lib/supabase";
import {
    User,
    Calendar,
    Droplet,
    Shield,
    Loader2,
    CheckCircle,
    Stethoscope,
    Briefcase,
    Key,
    X,
} from "lucide-react";

export default function AccountModal({ profile, isOpen, onClose }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Role Checks
    const isDonor = profile?.role === "donor";
    const isPhysician = profile?.role === "physician";
    const isStaff = profile?.role === "staff";
    const isAdmin = profile?.role === "admin";

    // Common Form State
    const [fullName, setFullName] = useState(profile?.full_name || "");

    // Donor-Specific Form State
    const [birthdate, setBirthdate] = useState(profile?.birthdate || "");
    const [sex, setSex] = useState(profile?.sex || "");
    const [bloodGroup, setBloodGroup] = useState(
        profile?.blood_group || "Unknown",
    );

    if (!isOpen || !profile) return null;

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        setSuccess(false);

        try {
            const updatePayload = { full_name: fullName };

            if (isDonor) {
                updatePayload.birthdate = birthdate;
                updatePayload.sex = sex;
                updatePayload.blood_group = bloodGroup;
            }

            const { error } = await supabase
                .from("profiles")
                .update(updatePayload)
                .eq("id", profile.id);

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose(); // Auto-close after success
            }, 2000);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const RoleIcon = isPhysician
        ? Stethoscope
        : isAdmin
          ? Key
          : isStaff
            ? Briefcase
            : User;
    const roleColor = isAdmin
        ? "bg-slate-900"
        : isPhysician
          ? "bg-blue-600"
          : "bg-prc-red";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                {/* Modal Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-12 h-12 ${roleColor} text-white rounded-full flex items-center justify-center text-xl font-black shadow-inner`}
                        >
                            {fullName.charAt(0) || (
                                <RoleIcon className="w-6 h-6" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">
                                Account Settings
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Manage your personal information.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="p-6 md:p-8 overflow-y-auto">
                    {success && (
                        <div className="mb-6 bg-emerald-50 text-emerald-800 text-sm font-bold p-4 rounded-lg border border-emerald-200 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Profile
                            successfully updated.
                        </div>
                    )}

                    {errorMsg && (
                        <div className="mb-6 bg-red-50 text-prc-darkred text-sm font-bold p-4 rounded-lg border border-red-200">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    {isDonor
                                        ? "Digital Donor ID (DIN)"
                                        : "System Identification ID"}
                                </label>
                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium cursor-not-allowed">
                                    <Shield className="w-4 h-4 text-slate-400" />
                                    {profile.din ||
                                        profile.id.substring(0, 13) + "..."}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    Account Role
                                </label>
                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium cursor-not-allowed capitalize">
                                    <RoleIcon className="w-4 h-4 text-slate-400" />
                                    {profile.role || "User"}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                                {isPhysician
                                    ? "Attending Physician Name"
                                    : "Full Name"}
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red"
                            />
                        </div>

                        {isDonor && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                                        Sex at Birth
                                    </label>
                                    <select
                                        value={sex}
                                        onChange={(e) => setSex(e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red bg-white"
                                    >
                                        <option value="" disabled>
                                            Select...
                                        </option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                                        Date of Birth
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                        <input
                                            type="date"
                                            value={birthdate}
                                            onChange={(e) =>
                                                setBirthdate(e.target.value)
                                            }
                                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                                        Blood Group
                                    </label>
                                    <div className="relative">
                                        <Droplet className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                        <select
                                            value={bloodGroup}
                                            onChange={(e) =>
                                                setBloodGroup(e.target.value)
                                            }
                                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-prc-red bg-white"
                                        >
                                            <option value="Unknown">
                                                Unknown
                                            </option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isDonor && (
                            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-500 text-xs">
                                No additional medical profile settings are
                                required for your administrative role.
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-50 transition mr-3"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-prc-red text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-prc-darkred transition flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
