import { useState, useEffect } from "react";
import { FileUp, ChevronDown, ScanLine, X, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useChapters } from "../../hooks/useChapters";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function RequisitionForm() {
    const navigate = useNavigate();
    const { chapters, loadingChapters } = useChapters();

    const [doctor, setDoctor] = useState({
        id: "",
        full_name: "Loading...",
        din: "",
    });

    // Form State
    const [patientName, setPatientName] = useState("");
    const [scannedPatient, setScannedPatient] = useState(null);
    const [hospitalName, setHospitalName] = useState(
        "The Medical City - Ortigas",
    );
    const [clinicalDiagnosis, setClinicalDiagnosis] = useState("");
    const [targetChapter, setTargetChapter] = useState("Rizal Chapter - Pasig");
    const [componentNeeded, setComponentNeeded] = useState(
        "Packed Red Blood Cells",
    );
    const [urgency, setUrgency] = useState("STAT / Emergency");
    const [slipFile, setSlipFile] = useState(null);

    // Modal States
    const [isScanning, setIsScanning] = useState(false);
    const [showPatientModal, setShowPatientModal] = useState(false);

    useEffect(() => {
        async function fetchDoctorProfile() {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase
                        .from("profiles")
                        .select("id, full_name, din")
                        .eq("id", user.id)
                        .single();

                    if (error) throw error;
                    if (data) {
                        setDoctor({
                            id: data.id,
                            full_name: data.full_name || "Dr. Unnamed",
                            din: data.din || user.id,
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching doctor profile:", error);
            }
        }
        fetchDoctorProfile();
    }, []);

    const handleScan = async (result) => {
        if (result && result.length > 0) {
            const scannedDin = result[0].rawValue;
            setIsScanning(false);

            try {
                // Look up the patient using the DIN encoded in the QR code
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("din", scannedDin)
                    .single();

                if (error) throw error;

                if (data) {
                    setPatientName(data.full_name);
                    setScannedPatient(data);
                    setShowPatientModal(true);
                }
            } catch (err) {
                alert(
                    `Patient not found in system or invalid QR format. ${err}`,
                );
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let slip_file_path = null;

            if (slipFile) {
                const fileExt = slipFile.name.split(".").pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
                const { data: uploadData, error: uploadError } =
                    await supabase.storage
                        .from("medical_slips")
                        .upload(fileName, slipFile);

                if (uploadError) throw uploadError;
                slip_file_path = uploadData.path;
            }

            const generatedReqId = `REQ-${Date.now().toString().slice(-6)}`;

            const { error: insertError } = await supabase
                .from("requisitions")
                .insert([
                    {
                        req_id: generatedReqId,
                        physician_id: doctor.id || null,
                        target_donor_id: scannedPatient?.id || null, // Mapped to existing DB column
                        hospital: hospitalName, // Mapped to existing DB column
                        component: componentNeeded, // Mapped to existing DB column
                        branch: targetChapter, // Mapped to existing DB column
                        status: "Pending", // Mapped to existing DB column

                        // New columns to be added to Supabase
                        patient_name: patientName,
                        units_req: 1,
                        urgency: urgency,
                        slip_file_path: slip_file_path, 
                    },
                ]);

            if (insertError) throw insertError;

            navigate("/physician/request");
        } catch (error) {
            console.error("Error submitting requisition:", error);
            alert("Failed to submit requisition. Please try again.");
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto relative">
            {/* Header */}
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
                    <p className="font-bold text-white">{doctor.full_name}</p>
                    <p className="text-slate-400">PRC License: {doctor.din}</p>
                </div>
            </div>

            <form className="p-6 md:p-8 space-y-6" onSubmit={handleSubmit}>
                {/* 1. Patient Details */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            1. Admitted Patient Details
                        </h3>
                        <button
                            type="button"
                            onClick={() => setIsScanning(true)}
                            className="flex items-center gap-2 text-xs font-bold text-prc-red bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 transition"
                        >
                            <ScanLine className="w-4 h-4" /> Scan Patient QR
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Patient Full Name
                            </label>
                            <input
                                type="text"
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                className={`w-full border rounded-lg px-3 py-2 text-sm ${scannedPatient ? "border-prc-red bg-red-50 font-bold text-prc-darkred" : "border-slate-300"}`}
                                required
                                readOnly={!!scannedPatient}
                            />
                            {scannedPatient && (
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Verified via Digital Pass.{" "}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPatientModal(true)
                                        }
                                        className="text-prc-red font-bold hover:underline"
                                    >
                                        View Profile
                                    </button>
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Hospital / Medical Center
                            </label>
                            <input
                                type="text"
                                value={hospitalName}
                                onChange={(e) =>
                                    setHospitalName(e.target.value)
                                }
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Clinical Diagnosis
                            </label>
                            <input
                                type="text"
                                value={clinicalDiagnosis}
                                onChange={(e) =>
                                    setClinicalDiagnosis(e.target.value)
                                }
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Blood Specification */}
                <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        2. Blood Specification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Target PRC Chapter
                            </label>
                            <div className="relative">
                                <select
                                    value={targetChapter}
                                    onChange={(e) =>
                                        setTargetChapter(e.target.value)
                                    }
                                    disabled={loadingChapters}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm appearance-none bg-white pr-8 focus:ring-2 focus:ring-prc-red outline-none"
                                >
                                    {loadingChapters ? (
                                        <option>Loading chapters...</option>
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
                                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Component Needed
                            </label>
                            <div className="relative">
                                <select
                                    value={componentNeeded}
                                    onChange={(e) =>
                                        setComponentNeeded(e.target.value)
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm appearance-none bg-white pr-8 focus:ring-2 focus:ring-prc-red outline-none"
                                >
                                    <option>Packed Red Blood Cells</option>
                                    <option>Platelets</option>
                                    <option>Whole Blood</option>
                                    <option>Fresh Frozen Plasma</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Urgency
                            </label>
                            <div className="relative">
                                <select
                                    value={urgency}
                                    onChange={(e) => setUrgency(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-prc-red font-bold appearance-none bg-white pr-8 focus:ring-2 focus:ring-prc-red outline-none"
                                >
                                    <option>STAT / Emergency</option>
                                    <option>Urgent</option>
                                    <option>Routine</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. File Upload */}
                <div className="pt-4 border-t border-slate-100">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        3. Doctor's Signed Request Form
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 relative cursor-pointer transition">
                        <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setSlipFile(e.target.files[0]);
                                }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-700">
                            {slipFile
                                ? slipFile.name
                                : "Click or drag hospital requisition slip here"}
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

            {/* QR Scanner Overlay */}
            {isScanning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="p-4 flex justify-between items-center bg-slate-50 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900">
                                Scan Patient DIN
                            </h3>
                            <button
                                onClick={() => setIsScanning(false)}
                                className="text-slate-400 hover:text-slate-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="aspect-square bg-black">
                            <Scanner onScan={handleScan} />
                        </div>
                    </div>
                </div>
            )}

            {/* Patient Info Modal */}
            {showPatientModal && scannedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="bg-prc-red p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                <h3 className="font-bold">Patient Verified</h3>
                            </div>
                            <button
                                onClick={() => setShowPatientModal(false)}
                                className="p-1 hover:bg-white/20 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">
                                    Full Name
                                </p>
                                <p className="font-black text-lg text-slate-900">
                                    {scannedPatient.full_name}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">
                                        Blood Group
                                    </p>
                                    <p className="font-bold text-prc-red">
                                        {scannedPatient.blood_group ||
                                            "Unknown"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">
                                        Sex
                                    </p>
                                    <p className="font-bold text-slate-700">
                                        {scannedPatient.sex || "N/A"}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] uppercase font-bold text-slate-400">
                                        Identification (DIN)
                                    </p>
                                    <p className="font-mono text-sm text-slate-600">
                                        {scannedPatient.din}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPatientModal(false)}
                                className="w-full mt-2 bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 transition"
                            >
                                Confirm & Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
