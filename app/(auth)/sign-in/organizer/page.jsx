import { SignIn } from "@clerk/nextjs";

export default function OrganizerSignIn() {
  return (
    <SignIn
      redirectUrl="/"
      path="/sign-in/organizer"
      signUpUrl="/sign-up/organizer"
    />
  );
}
