"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 md:py-32">
      <div className="flex flex-col items-center text-center space-y-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          Discover and create amazing events
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 max-w-2xl font-normal">
          Whether you&apos;re hosting or attending, Spott manages your events simply and practically. Join our community today.
        </p>
        <div className="pt-4 flex items-center justify-center gap-4">
          <Link href="/explore">
            <Button size="lg" className="rounded-md font-medium px-8">
              Explore Events
            </Button>
          </Link>
          <Link href="/create-event">
            <Button variant="outline" size="lg" className="rounded-md font-medium px-8">
              Create Event
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
