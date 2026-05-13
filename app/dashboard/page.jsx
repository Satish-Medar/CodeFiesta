import { Suspense } from "react";
import Dashboard from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading dashboard…</p></div>}>
      <Dashboard />
    </Suspense>
  );
}
