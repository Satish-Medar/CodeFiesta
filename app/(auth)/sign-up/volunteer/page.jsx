import { SignUp } from "@clerk/nextjs";

export default function VolunteerSignUp() {
  return (
    <SignUp
      redirectUrl="/"
      afterSignUpUrl="/?role=volunteer"
      path="/sign-up/volunteer"
      signInUrl="/sign-in/volunteer"
    />
  );
}
