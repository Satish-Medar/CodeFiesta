"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { getCurrentUser, setUserRole } from "@/actions/users";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [appUser, setAppUser] = useState(null);
  const [role, setRole] = useState("volunteer");

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Load the app-specific user record (with role) from the DB
    getCurrentUser().then((currentUser) => {
      if (currentUser) {
        setAppUser(currentUser);
        setRole(currentUser.role || "volunteer");
      }
    });
  }, [isLoaded, user]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Sync role from query param into the user record
    const requestedRole = searchParams.get("role");
    if (requestedRole && requestedRole !== role) {
      setUserRole(requestedRole).then((updated) => {
        if (updated) {
          setRole(updated.role || requestedRole);
          setAppUser(updated);
        }
      });
    }
  }, [isLoaded, user, searchParams, role]);

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard…</p>
      </div>
    );
  }

  const displayRole = role || user.publicMetadata?.role || "volunteer";

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-white px-4 py-20">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 p-10 shadow-sm">
          <h1 className="text-4xl font-bold tracking-tight">
            {user.firstName || user.fullName || "Welcome"}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-slate-300">
            {displayRole === "organizer"
              ? "Organizer Dashboard"
              : "Volunteer Dashboard"}
          </p>

          <div className="mt-6 flex flex-col gap-2 text-sm text-gray-700 dark:text-slate-300">
            <div>
              <span className="font-semibold">Name:</span>{" "}
              {user.fullName || user.firstName || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Email:</span>{" "}
              {user.primaryEmailAddress?.emailAddress ||
                user.emailAddresses?.[0]?.emailAddress}
            </div>
            <div>
              <span className="font-semibold">Role:</span> {displayRole}
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 p-8">
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            {displayRole === "organizer" ? (
              <ul className="space-y-2 text-gray-700 dark:text-slate-300">
                <li>• Create a new event</li>
                <li>• Manage attendees</li>
                <li>• View event analytics</li>
              </ul>
            ) : (
              <ul className="space-y-2 text-gray-700 dark:text-slate-300">
                <li>• Browse upcoming events</li>
                <li>• Join volunteer teams</li>
                <li>• Track your schedule</li>
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 p-8">
            <h2 className="text-2xl font-semibold mb-4">Tips</h2>
            <p className="text-gray-700 dark:text-slate-300">
              Use the navigation to jump between screens. Your role determines
              the tools available to you.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
