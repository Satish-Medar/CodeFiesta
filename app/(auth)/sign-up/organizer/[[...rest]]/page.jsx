import { SignUp } from "@clerk/nextjs";

export default function OrganizerSignUp() {
  return (
    <SignUp
      redirectUrl="/dashboard"
      afterSignUpUrl="/dashboard?role=organizer"
      path="/sign-up/organizer"
    />
  );
}
