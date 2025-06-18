"use client";

import * as React from "react"; // Import React for useState
import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in"; // Corrected import for SignIn elements
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { useSignIn } from "@clerk/nextjs"; // Import the useSignIn hook

export default function Page() {
  // Use the useSignIn hook to programmatically handle sign-in
  const { isLoaded, signIn } = useSignIn();

  // State to manage loading for the Google button
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  // Construct the dynamic redirect URL for Google login after sign-in.
  // For sign-in, you typically redirect to a dashboard or a more generic path.
  // Clerk will often append 'redirect_url' from the original page the user was on.
  const dynamicRedirectUrl = `${window.location.origin}/notes`;

  // Handle Google sign-in via authenticateWithRedirect
  const handleGoogleSignIn = async () => {
    if (!isLoaded || isGoogleLoading) return; // Prevent multiple clicks or if SDK not loaded

    setIsGoogleLoading(true); // Set loading state to true

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google", // Specify the Google OAuth strategy
        redirectUrl: dynamicRedirectUrl, // Dynamic redirect URL after successful sign-in
        redirectUrlComplete: dynamicRedirectUrl, // This is often the same for simplicity
        // For sign-in, unsafeMetadata is less common unless you're passing session-specific data.
        // It's usually associated with the sign-up process.
      });
      // Clerk will now handle the redirect to Google, and then back to dynamicRedirectUrl
      // The loading state will automatically reset as the page unmounts/redirects
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setIsGoogleLoading(false); // Reset loading state on error
      // You can add a user-facing error message here (e.g., using a toast)
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background">
      <SignIn.Root>
        <Clerk.Loading>
          {(isGlobalLoading) => (
            <SignIn.Step name="start">
              <Card className="mx-4 w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                  <CardTitle className="text-2xl font-bold">
                    Welcome back
                  </CardTitle>
                  <CardDescription>
                    Sign in to your account to continue
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Replaced Clerk.Connection with a standard Button and custom onClick */}
                  <Button
                    variant="outline"
                    type="button"
                    // Disable if Clerk SDK not loaded, or if Google button is already loading
                    disabled={isGlobalLoading || !isLoaded || isGoogleLoading}
                    className="w-full"
                    size="lg"
                    onClick={handleGoogleSignIn} // Call our custom handler
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
                      <Clerk.Link navigate="sign-up" className="text-secondary">
                        Don&apos;t have an account? Sign up
                      </Clerk.Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </SignIn.Step>
          )}
        </Clerk.Loading>
      </SignIn.Root>
    </div>
  );
}
