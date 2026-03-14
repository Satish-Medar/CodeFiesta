"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="pt-24 pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title max-w-5xl mx-auto font-extrabold">
          Organize Events & Empower Volunteers
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Build an event portal that handles registrations, seat tracking, and
          volunteer coordination—all in one place.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/events">
            <Button size="lg" className="px-8">
              View Events
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="px-8">
              Learn More
            </Button>
          </Link>
        </div>
        <div className="hero-image-wrapper mt-5 md:mt-0">
          {/* <div ref={imageRef} className="hero-image"> */}
          {/* <Image
              src="/banner.jpeg"
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            /> */}
        </div>
      </div>
      {/* </div> */}
    </section>
  );
}
