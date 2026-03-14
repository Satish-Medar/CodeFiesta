import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignInSelection() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Welcome back
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Sign in to access your events.
        </p>
        <div className="grid gap-4">
          <Link href="/sign-in/organizer">
            <Button size="lg" className="w-full">
              Organizer Sign In
            </Button>
          </Link>
          <Link href="/sign-in/volunteer">
            <Button size="lg" variant="outline" className="w-full">
              Volunteer Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
