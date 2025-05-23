// api/auth/after-signup/route.ts
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import UserModel from "@/lib/models/user"; // Assuming this path is correct
import dbConnect from "@/lib/db"; // Assuming this path is correct
import ROUTES from "@/constants/routes"; // Assuming this path and object are correct

export async function GET(req: Request) {
  // Log the start of the function and the incoming request URL
  console.log(`[API_AFTER_SIGNUP] START: Received request for URL: ${req.url}`);

  try {
    // Attempt to get the current user from Clerk
    const user = await currentUser();
    // Log whether a user was found and their ID
    console.log(
      `[API_AFTER_SIGNUP] Clerk user: ${user ? `ID: ${user.id}, Email: ${user.emailAddresses?.[0]?.emailAddress}` : "No user found by Clerk"}`,
    );

    // If no user or user ID is found, log and redirect to the app's root
    if (!user || !user.id) {
      console.log(
        "[API_AFTER_SIGNUP] No Clerk user or user ID found, redirecting to APP root.",
      );
      return NextResponse.redirect(new URL(ROUTES.APP || "/", req.url));
    }

    // Parse the request URL to extract query parameters
    const url = new URL(req.url);
    const planFromUrl = url.searchParams.get("plan");
    // Log the plan retrieved from the URL
    console.log(
      `[API_AFTER_SIGNUP] Plan from URL query parameter: '${planFromUrl}'`,
    );

    // Attempt to get the plan from Clerk's unsafeMetadata as a fallback
    const unsafeMetadata =
      (user.unsafeMetadata as { selectedPlan?: string }) || {};
    const planFromMetadata = unsafeMetadata.selectedPlan;
    // Log the plan retrieved from metadata
    console.log(
      `[API_AFTER_SIGNUP] Plan from Clerk unsafeMetadata: '${planFromMetadata}'`,
    );

    // Determine the final plan: prioritize URL, then metadata, then default to "free"
    const plan = planFromUrl || planFromMetadata || "free";
    // Log the determined final plan
    console.log(`[API_AFTER_SIGNUP] Final plan determined as: '${plan}'`);

    // Validate the plan type
    if (plan !== "free" && plan !== "paid") {
      console.log(
        `[API_AFTER_SIGNUP] Invalid plan type: '${plan}'. Redirecting to APP root.`,
      );
      return NextResponse.redirect(new URL(ROUTES.APP || "/", req.url));
    }

    // Log attempt to connect to the database
    console.log("[API_AFTER_SIGNUP] Attempting to connect to database...");
    const dbResult = await dbConnect();

    // Handle database connection failure
    if (!dbResult.success) {
      console.error(
        "[API_AFTER_SIGNUP] Database connection error:",
        dbResult.error,
      );
      // Throw an error to be caught by the outer try-catch block
      throw new Error(
        dbResult.error?.message || "Failed to connect to database",
      );
    }
    // Log successful database connection
    console.log("[API_AFTER_SIGNUP] Database connection successful.");

    // Check if the user already exists in your database using their Clerk ID
    console.log(
      `[API_AFTER_SIGNUP] Checking for existing user in DB with Clerk ID: ${user.id}`,
    );
    const existingUser = await UserModel.findOne({ clerkId: user.id });
    // Log whether an existing user was found
    console.log(
      `[API_AFTER_SIGNUP] Existing user in DB check: ${existingUser ? `Found user with DB ID: ${existingUser._id}` : "No existing user found in DB"}`,
    );

    // If the user does not exist, create them
    if (!existingUser) {
      console.log(
        `[API_AFTER_SIGNUP] Creating new user in DB with Clerk ID: ${user.id}, Plan: ${plan}`,
      );
      try {
        // Create the new user record
        const newUser = await UserModel.create({
          clerkId: user.id,
          email: user.emailAddresses?.[0]?.emailAddress, // Storing email can be useful
          hasAccess: plan === "free", // 'hasAccess' logic might depend on payment for 'paid'
          planId: plan,
        });
        console.log(
          `[API_AFTER_SIGNUP] New user created successfully in DB. DB ID: ${newUser._id}`,
        );
      } catch (error: any) {
        console.error(
          "[API_AFTER_SIGNUP] Error creating new user in DB:",
          error,
        );
        // Specifically check for MongoDB duplicate key error (code 11000)
        if (error.code === 11000) {
          console.error(
            "[API_AFTER_SIGNUP] Duplicate user error (code 11000) during create. This might indicate a race condition or prior creation. Proceeding as if user exists.",
          );
          // Potentially re-fetch user here if needed, or rely on the existingUser check if robust
        } else {
          // Re-throw other errors to be caught by the outer try-catch
          throw error;
        }
      }
    } else {
      // Log if user already exists, potentially update their plan or other details if needed
      console.log(
        `[API_AFTER_SIGNUP] User with Clerk ID: ${user.id} already exists in DB. DB ID: ${existingUser._id}. Current plan in DB: ${existingUser.planId}. Selected plan: ${plan}`,
      );
      // TODO: Add logic here if you need to update the existing user's plan
      // For example, if they sign up again with a different plan:
      // if (existingUser.planId !== plan) {
      //   console.log(`[API_AFTER_SIGNUP] Updating existing user's plan from ${existingUser.planId} to ${plan}`);
      //   await UserModel.updateOne({ clerkId: user.id }, { $set: { planId: plan, hasAccess: plan === 'free' } });
      // }
    }

    // Redirect based on the plan
    if (plan === "free") {
      const notesRedirectUrl = new URL("/notes", req.url);
      console.log(
        `[API_AFTER_SIGNUP] Plan is 'free'. Redirecting to: ${notesRedirectUrl.toString()}`,
      );
      return NextResponse.redirect(notesRedirectUrl);
    } else {
      // plan === "paid"
      const billingRedirectUrl = new URL(
        `/api/billing/checkout?plan=${plan}`,
        req.url,
      );
      console.log(
        `[API_AFTER_SIGNUP] Plan is 'paid'. Redirecting to billing: ${billingRedirectUrl.toString()}`,
      );
      return NextResponse.redirect(billingRedirectUrl);
    }
  } catch (error: any) {
    // Catch any errors that occurred during the process
    console.error(
      "[API_AFTER_SIGNUP] CRITICAL ERROR in after-signup route:",
      error,
    );
    // Log the error message and stack if available
    console.error("Error message:", error.message);
    if (error.stack) {
      console.error("Error stack:", error.stack);
    }
    // Redirect to the app's root page in case of any error
    const errorRedirectUrl = new URL(ROUTES.APP || "/", req.url);
    console.log(
      `[API_AFTER_SIGNUP] Redirecting to APP root due to error: ${errorRedirectUrl.toString()}`,
    );
    return NextResponse.redirect(errorRedirectUrl);
  }
}
