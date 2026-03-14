import { SignIn } from "@clerk/nextjs";

export default function VolunteerSignIn() {
  return (
    <SignIn
      redirectUrl="/"
      path="/sign-in/volunteer"
      signUpUrl="/sign-up/volunteer"
    />
  );
}
