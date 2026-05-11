import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { fetchMe } from "../features/auth/authSlice.js";
import { createRepair } from "../features/repairs/repairsSlice.js";
import {
  fetchDashboardStats,
  fetchActivity,
} from "../features/dashboard/dashboardSlice.js";
import Navbar from "../components/layout/Navbar.jsx";
import Modal from "../components/ui/Modal.jsx";
import RepairForm from "../components/repairs/RepairForm.jsx";

export default function ProtectedLayout() {
  const dispatch = useDispatch();
  const { isAuthenticated, bootstrapped } = useSelector((s) => s.auth);
  const [addOpen, setAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Try restoring session on first load (refresh token in httpOnly cookie)
  useEffect(() => {
    if (!bootstrapped) dispatch(fetchMe());
  }, [bootstrapped, dispatch]);

  if (!bootstrapped) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleAddRepair = async (data) => {
    setCreating(true);
    await dispatch(createRepair(data));
    // Refresh dashboard stats after new repair
    dispatch(fetchDashboardStats());
    dispatch(fetchActivity());
    setCreating(false);
    setAddOpen(false);
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar onAddRepair={() => setAddOpen(true)} />
      {/* pb-20 on mobile accounts for the fixed bottom tab bar height */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="New Repair"
      >
        <RepairForm
          onSubmit={handleAddRepair}
          onCancel={() => setAddOpen(false)}
          loading={creating}
        />
      </Modal>
    </div>
  );
}
