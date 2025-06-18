"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";

export default function Page() {
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
                  <Clerk.Connection name="google" asChild>
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isGlobalLoading}
                      className="w-full"
                      size="lg"
                    >
                      <Clerk.Loading scope="provider:google">
                        {(isLoading) =>
                          isLoading ? (
                            <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <Icons.google className="mr-2 h-5 w-5" />
                              Continue with Google
                            </>
                          )
                        }
                      </Clerk.Loading>
                    </Button>
                  </Clerk.Connection>

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
