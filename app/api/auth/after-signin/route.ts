import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import UserModel from "@/lib/models/user";
import dbConnect from "@/lib/db";
import ROUTES from "@/constants/routes";

export async function GET(req: Request) {
  console.log(`[API_AFTER_SIGNIN] START: Received request for URL: ${req.url}`);

  try {
    // Get the current user from Clerk
    const user = await currentUser();
    console.log(
      `[API_AFTER_SIGNIN] Clerk user: ${
        user
          ? `ID: ${user.id}, Email: ${user.emailAddresses?.[0]?.emailAddress}`
          : "No user found by Clerk"
      }`,
    );

    if (!user || !user.id) {
      console.log(
        "[API_AFTER_SIGNIN] Authentication failed, redirecting to home with error message",
      );
      const errorUrl = new URL(ROUTES.APP || "/", req.url);
      errorUrl.searchParams.set(
        "error",
        "Authentication failed. Please try again",
      );
      return NextResponse.redirect(errorUrl);
    }

    // Connect to database
    console.log("[API_AFTER_SIGNIN] Attempting to connect to database...");
    const dbResult = await dbConnect();

    if (!dbResult.success) {
      console.error(
        "[API_AFTER_SIGNIN] Database connection error:",
        dbResult.error,
      );
      throw new Error(
        dbResult.error?.message || "Failed to connect to database",
      );
    }

    // Check if user exists in DB
    console.log(
      `[API_AFTER_SIGNIN] Checking for user in DB with Clerk ID: ${user.id}`,
    );
    const existingUser = await UserModel.findOne({ clerkId: user.id });

    if (!existingUser) {
      console.log(
        "[API_AFTER_SIGNIN] User not found in DB, redirecting to home with message",
      );
      const errorUrl = new URL(ROUTES.APP || "/", req.url);
      errorUrl.searchParams.set("error", "Please create an account first");
      return NextResponse.redirect(errorUrl);
    }

    // Check if user has selected a plan
    console.log(
      `[API_AFTER_SIGNIN] User found with plan: ${existingUser.planId}`,
    );
    if (!existingUser.planId) {
      console.log("[API_AFTER_SIGNIN] No plan selected, redirecting to home");
      const errorUrl = new URL(ROUTES.APP || "/", req.url);
      errorUrl.searchParams.set("error", "Please select a plan to continue");
      return NextResponse.redirect(errorUrl);
    }

    // All checks passed, redirect to notes
    console.log("[API_AFTER_SIGNIN] All checks passed, redirecting to notes");
    const notesUrl = new URL("/notes", req.url);
    return NextResponse.redirect(notesUrl);
  } catch (error: any) {
    console.error("[API_AFTER_SIGNIN] CRITICAL ERROR:", error);
    console.error("Error message:", error.message);
    if (error.stack) {
      console.error("Error stack:", error.stack);
    }

    const errorUrl = new URL(ROUTES.APP || "/", req.url);
    errorUrl.searchParams.set("error", "An unexpected error occurred");
    return NextResponse.redirect(errorUrl);
  }
}
