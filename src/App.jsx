import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import PublicBoard from "./pages/PublicBoard";

import StaffLayout from "./pages/staff/StaffLayout";
import Dashboard from "./pages/staff/Dashboard";
import InventoryLedger from "./pages/staff/InventoryLedger";
import SerologicalEntry from "./pages/staff/SerologicalEntry";
import TransferCoord from "./pages/staff/TransferCoord";
import Reports from "./pages/staff/Reports";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Main Login / Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/public" element={<PublicBoard />} />
        
        {/* Staff Portal Routes */}
        <Route element={<StaffLayout />}>
          <Route path="/staff" element={<Dashboard />} />
          <Route path="/staff/inventory" element={<InventoryLedger />} />
          <Route path="/staff/testing" element={<SerologicalEntry />} />
          <Route path="/staff/transfers" element={<TransferCoord />} />
          <Route path="/staff/reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
}
