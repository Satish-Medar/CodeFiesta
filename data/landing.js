import {
  CalendarDays,
  ClipboardList,
  Users,
  Sparkles,
  CheckCircle,
} from "lucide-react";

export const statsData = [
  { value: "10k+", label: "Events Hosted" },
  { value: "25k+", label: "Tickets Sold" },
  { value: "15k+", label: "Active Attendees" },
  { value: "4.9/5", label: "Average Rating" },
];

export const featuresData = [
  {
    icon: <CalendarDays className="w-10 h-10 text-blue-600" />,
    title: "Easy Scheduling",
    description:
      "Quickly create events with times, locations, and recurring schedules that fit your needs.",
  },
  {
    icon: <ClipboardList className="w-10 h-10 text-blue-600" />,
    title: "Smart Management",
    description:
      "Manage attendees, tickets, and volunteer roles in one central dashboard.",
  },
  {
    icon: <Users className="w-10 h-10 text-blue-600" />,
    title: "Community Driven",
    description:
      "Collaborate with your team, share events, and grow your audience effortlessly.",
  },
];

export const howItWorksData = [
  {
    icon: <Sparkles className="w-7 h-7 text-blue-600" />,
    title: "Create an Event",
    description:
      "Start with a name, location, and schedule. Set your public or private options in seconds.",
  },
  {
    icon: <ClipboardList className="w-7 h-7 text-blue-600" />,
    title: "Invite and Manage",
    description:
      "Send invites, track RSVPs, and organize roles so everyone knows what to do.",
  },
  {
    icon: <CheckCircle className="w-7 h-7 text-blue-600" />,
    title: "Host with Confidence",
    description:
      "Use our dashboard for real-time check-ins, analytics, and automated reminders.",
  },
];

export const testimonialsData = [
  {
    name: "Olivia Martinez",
    role: "Community Organizer",
    quote:
      "This app made planning meetups so much less stressful. I love the volunteer management features.",
    image: "/3d-react.png",
  },
  {
    name: "James Chen",
    role: "Conference Coordinator",
    quote:
      "I can’t believe how easy it is to set up ticket tiers and track attendance in real time.",
    image: "/hero.png",
  },
  {
    name: "Aisha Khan",
    role: "Event Volunteer",
    quote:
      "The QR check-in and role assignments helped our team stay in sync all day.",
    image: "/spott.png",
  },
];
