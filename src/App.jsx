import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import PublicBoard from "./pages/PublicBoard";

// Layouts
import DonorLayout from "./pages/donor/DonorLayout";
import StaffLayout from "./pages/staff/StaffLayout";

// Pages
import DonorDashboard from "./pages/donor/Dashboard";
import BookAppointment from "./pages/donor/BookAppointment";
import StaffDashboard from "./pages/staff/Dashboard";
import InventoryLedger from "./pages/staff/InventoryLedger";
import SerologicalEntry from "./pages/staff/SerologicalEntry";
import TransferCoord from "./pages/staff/TransferCoord";
import RequisitionForm from "./pages/physician/RequisitionForm";
import AuditLogs from "./pages/admin/AuditLogs";

// ... existing imports ...

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                {/* Unauthenticated standalone view */}
                <Route
                    path="/public-board"
                    element={<PublicBoard isNested={false} />}
                />

                <Route element={<Layout />}>
                    <Route path="/donor" element={<DonorLayout />}>
                        <Route index element={<DonorDashboard />} />
                        <Route path="book" element={<BookAppointment />} />
                        {/* Nested Board Route */}
                        <Route
                            path="board"
                            element={<PublicBoard isNested={true} />}
                        />
                    </Route>

                    <Route path="/staff" element={<StaffLayout />}>
                        <Route index element={<StaffDashboard />} />
                        <Route path="ledger" element={<InventoryLedger />} />
                        <Route path="serology" element={<SerologicalEntry />} />
                        <Route path="transfers" element={<TransferCoord />} />
                        {/* Nested Board Route */}
                        <Route
                            path="board"
                            element={<PublicBoard isNested={true} />}
                        />
                    </Route>

                    <Route
                        path="/physician/request"
                        element={<RequisitionForm />}
                    />
                    <Route path="/admin/audit" element={<AuditLogs />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
