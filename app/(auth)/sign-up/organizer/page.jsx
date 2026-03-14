import { SignUp } from "@clerk/nextjs";

export default function OrganizerSignUp() {
  return (
    <SignUp
      redirectUrl="/"
      afterSignUpUrl="/?role=organizer"
      path="/sign-up/organizer"
      signInUrl="/sign-in/organizer"
    />
  );
}
