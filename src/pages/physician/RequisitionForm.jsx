import { useState, useEffect } from "react";
import { FileUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase"; 

export default function RequisitionForm() {
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState({
        id: "",
        full_name: "Loading...",
        din: ""
    });

    const [patientName, setPatientName] = useState("");
    const [hospitalName, setHospitalName] = useState("The Medical City - Ortigas");
    const [clinicalDiagnosis, setClinicalDiagnosis] = useState("");
    const [targetChapter, setTargetChapter] = useState("Rizal Chapter - Pasig");
    const [componentNeeded, setComponentNeeded] = useState("Packed Red Blood Cells");
    const [urgency, setUrgency] = useState("STAT / Emergency");
    const [slipFile, setSlipFile] = useState(null);

    useEffect(() => {
        async function fetchDoctorProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('id, full_name, din')
                        .eq('id', user.id)
                        .single();
                    
                    if (error) throw error;
                    if (data) {
                        setDoctor({
                            id: data.id,
                            full_name: data.full_name || "Dr. Unnamed",
                            din: data.din || user.id
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching doctor profile:", error);
            }
        }
        fetchDoctorProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let slip_file_path = null;

            if (slipFile) {
                const fileExt = slipFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('requisition-slips')
                    .upload(fileName, slipFile);

                if (uploadError) throw uploadError;
                slip_file_path = uploadData.path;
            }

            const { error: insertError } = await supabase.from('requisitions').insert([
                {
                    physician_id: doctor.id || null, 
                    patient_name: patientName,     
                    hospital_name: hospitalName,     
                    target_chapter: targetChapter,   
                    component_needed: componentNeeded, 
                    units_req: 1,                    
                    urgency: urgency,               
                    status: 'Pending',              
                    slip_file_path: slip_file_path  
                }
            ]);

            if (insertError) throw insertError;

            navigate("/physician/request");
        } catch (error) {
            console.error("Error submitting requisition:", error);
            alert("Failed to submit requisition. Please try again.");
        }
    };

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
                        {doctor.full_name} {/* Pulled from profiles.full_name[cite: 1] */}
                    </p>
                    <p className="text-slate-400">PRC License: {doctor.din}</p>
                </div>
            </div>

            <form
                className="p-6 md:p-8 space-y-6"
                onSubmit={handleSubmit}
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
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
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
                                value={hospitalName}
                                onChange={(e) => setHospitalName(e.target.value)}
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
                                onChange={(e) => setClinicalDiagnosis(e.target.value)}
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
                            <select 
                                value={targetChapter}
                                onChange={(e) => setTargetChapter(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option>Rizal Chapter - Pasig</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Component Needed
                            </label>
                            <select 
                                value={componentNeeded}
                                onChange={(e) => setComponentNeeded(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option>Packed Red Blood Cells</option>
                                <option>Platelets</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Urgency
                            </label>
                            <select 
                                value={urgency}
                                onChange={(e) => setUrgency(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-prc-red font-bold"
                            >
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
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 relative cursor-pointer">
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
                            {slipFile ? slipFile.name : "Click or drag hospital requisition slip here"}
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
