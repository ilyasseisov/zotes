"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function Page() {
  // hooks
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "free";

  // Redirect URL will include our plan parameter
  // This is our primary method for passing the plan information
  const redirectUrl = `/api/auth/after-signup?plan=${plan}`;
  // return
  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden">
      <div className="w-full max-w-md">
        <SignUp
          forceRedirectUrl={redirectUrl}
          unsafeMetadata={{
            selectedPlan: plan,
          }}
          signInUrl="/notes/sign-in"
        />
      </div>
    </div>
  );
}
