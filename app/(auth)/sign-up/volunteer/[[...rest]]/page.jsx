import { SignUp } from "@clerk/nextjs";

export default function VolunteerSignUp() {
  return (
    <SignUp
      redirectUrl="/dashboard"
      afterSignUpUrl="/dashboard?role=volunteer"
      path="/sign-up/volunteer"
    />
  );
}
