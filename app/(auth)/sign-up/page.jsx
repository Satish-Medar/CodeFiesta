import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignUpSelection() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Create an account
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Choose your role to get the best experience.
        </p>
        <div className="grid gap-4">
          <Link href="/sign-up/organizer">
            <Button size="lg" className="w-full">
              Sign up as Organizer
            </Button>
          </Link>
          <Link href="/sign-up/volunteer">
            <Button size="lg" variant="outline" className="w-full">
              Sign up as Volunteer
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
