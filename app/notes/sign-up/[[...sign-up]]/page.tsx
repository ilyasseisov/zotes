"use client";

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

  // Construct the dynamic redirect URL for Google login
  // This URL will include your 'plan' parameter.
  // Clerk will redirect to this URL after successful Google authentication.
  const dynamicRedirectUrl = `${window.location.origin}/api/auth/after-signup?plan=${plan}`;

  // Handle Google sign-up via authenticateWithRedirect
  const handleGoogleSignUp = async () => {
    if (!isLoaded) return; // Ensure the signUp object is loaded

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google", // Specify the Google OAuth strategy
        redirectUrl: dynamicRedirectUrl, // Dynamic redirect URL with plan param
        redirectUrlComplete: dynamicRedirectUrl, // This is often the same for simplicity
        unsafeMetadata: {
          selectedPlan: plan, // Pass your dynamic plan here as unsafeMetadata
        },
      });
      // Clerk will now handle the redirect to Google, and then back to dynamicRedirectUrl
    } catch (error) {
      console.error("Google sign-up failed:", error);
      // You can add a user-facing error message here
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <SignUp.Root
      // forceRedirectUrl and unsafeMetadata are NOT props on SignUp.Root from @clerk/elements.
      // We're handling them programmatically with useSignUp.
      >
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
                  {/* Replaced Clerk.Connection with a standard Button and custom onClick */}
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isGlobalLoading || !isLoaded} // Disable if Clerk SDK not loaded
                    className="w-full"
                    size="lg"
                    onClick={handleGoogleSignUp} // Call our custom handler
                  >
                    {/* Clerk.Loading for provider scope might not work directly here
                        since we're controlling the action manually.
                        You might need to manage loading state manually or use a
                        generic global loading indicator for the button.
                        For simplicity, using global loading here. */}
                    {isGlobalLoading ? (
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
