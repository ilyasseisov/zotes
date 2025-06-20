"use client";

import * as React from "react"; // Import React for useState
import * as Clerk from "@clerk/elements/common";
import * as SignUp from "@clerk/elements/sign-up";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { useSearchParams } from "next/navigation";
import { useSignUp } from "@clerk/nextjs"; // Import the useSignUp hook

export default function Page() {
  // hooks
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "free";

  // Use the useSignUp hook to programmatically handle signup
  const { isLoaded, signUp } = useSignUp();

  // State to manage loading for the Google button
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [redirectUrl, setRedirectUrl] = React.useState(
    "/api/auth/after-signup?plan=" + plan,
  );

  // Set up the redirect URL on the client side
  React.useEffect(() => {
    setRedirectUrl(
      `${window.location.origin}/api/auth/after-signup?plan=${plan}`,
    );
  }, [plan]);

  // Handle Google sign-up via authenticateWithRedirect
  const handleGoogleSignUp = async () => {
    if (!isLoaded || isGoogleLoading) return; // Prevent multiple clicks or if SDK not loaded

    setIsGoogleLoading(true); // Set loading state to true

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google", // Specify the Google OAuth strategy
        redirectUrl, // Dynamic redirect URL with plan param
        redirectUrlComplete: redirectUrl, // This is often the same for simplicity
        unsafeMetadata: {
          selectedPlan: plan, // Pass your dynamic plan here as unsafeMetadata
        },
      });
      // Clerk will now handle the redirect to Google, and then back to dynamicRedirectUrl
      // The loading state will automatically reset as the page unmounts/redirects
    } catch (error) {
      console.error("Google sign-up failed:", error);
      setIsGoogleLoading(false); // Reset loading state on error
      // You can add a user-facing error message here (e.g., using a toast)
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <SignUp.Root>
        <Clerk.Loading>
          {(isGlobalLoading) => (
            <SignUp.Step name="start">
              <Card className="mx-4 w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                  <CardTitle className="text-2xl font-bold">
                    Create your account
                  </CardTitle>
                  <CardDescription>
                    Get started with your {plan} plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    type="button"
                    // Disable if Clerk SDK not loaded, or if Google button is already loading
                    disabled={isGlobalLoading || !isLoaded || isGoogleLoading}
                    className="w-full"
                    size="lg"
                    onClick={handleGoogleSignUp} // Call our custom handler
                  >
                    {isGoogleLoading ? ( // Conditionally render based on isGoogleLoading
                      <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Icons.google className="mr-2 h-5 w-5" />
                        Continue with Google
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button variant="link" size="sm" asChild>
                      <Clerk.Link navigate="sign-in" className="text-secondary">
                        Already have an account? Sign in
                      </Clerk.Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </SignUp.Step>
          )}
        </Clerk.Loading>
      </SignUp.Root>
    </div>
  );
}
