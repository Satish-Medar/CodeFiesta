import Dashboard from "@/components/dashboard";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Loading dashboard…</p>
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  );
}
