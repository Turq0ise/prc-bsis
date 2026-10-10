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
import Reports from "./pages/staff/Reports";
import AuditLogs from "./pages/admin/AuditLogs";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminReports from "./pages/admin/AdminReports";
import SupplyMonitor from "./pages/admin/SupplyMonitor";
import AdminAccounts from "./pages/admin/AdminAccounts";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminTransfers from "./pages/admin/AdminTransfers";
import { Navigate } from "react-router-dom";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Login />} />
                <Route
                    path="/public-board"
                    element={<PublicBoard isNested={false} />}
                />

                {/* Protected Layout Routes (Top Nav with Profile Dropdown & Modal) */}
                <Route element={<Layout />}>
                    {/* Donor Portal */}
                    <Route path="/donor" element={<DonorLayout />}>
                        <Route index element={<DonorDashboard />} />
                        <Route path="book" element={<BookAppointment />} />
                        <Route
                            path="board"
                            element={<PublicBoard isNested={true} />}
                        />
                    </Route>

                    {/* Staff Portal */}
                    <Route path="/staff" element={<StaffLayout />}>
                        <Route index element={<StaffDashboard />} />
                        <Route path="ledger" element={<InventoryLedger />} />
                        <Route path="inventory" element={<InventoryLedger />} />
                        <Route path="serology" element={<SerologicalEntry />} />
                        <Route path="testing" element={<SerologicalEntry />} />
                        <Route path="transfers" element={<TransferCoord />} />
                        <Route path="reports" element={<Reports />} />
                        <Route
                            path="board"
                            element={<PublicBoard isNested={true} />}
                        />
                    </Route>

                    {/* Physician Portal */}
                    <Route
                        path="/physician/request"
                        element={<RequisitionForm />}
                    />
                    {/* Admin Portal */}
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="audit" replace />} />
                        <Route path="audit" element={<AuditLogs />} />
                        <Route path="reports" element={<AdminReports />} />
                        <Route path="supply" element={<SupplyMonitor />} />
                        <Route path="accounts" element={<AdminAccounts />} />
                        <Route path="transfers" element={<AdminTransfers />} />
                        <Route path="settings" element={<AdminSettings />} />
                        <Route path="*" element={<Navigate to="/admin/audit" replace />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
