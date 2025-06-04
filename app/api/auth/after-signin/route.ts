import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import UserModel from "@/lib/models/user";
import dbConnect from "@/lib/db";
import ROUTES from "@/constants/routes";

export async function GET(req: Request) {
  console.log(`[API_AFTER_SIGNIN] START: Received request for URL: ${req.url}`);

  try {
    const user = await currentUser();

    if (!user || !user.id) {
      console.log("[API_AFTER_SIGNIN] No authenticated user found");
      return NextResponse.redirect(
        new URL(ROUTES.LANDING_PAGE || "/", req.url),
      );
    }

    // Connect to database
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
    const existingUser = await UserModel.findOne({ clerkId: user.id });

    if (!existingUser) {
      // Create new user with free plan
      try {
        await UserModel.create({
          clerkId: user.id,
          email: user.emailAddresses?.[0]?.emailAddress,
          hasAccess: true,
          planId: "free",
        });
        console.log(
          `[API_AFTER_SIGNIN] Created new user in DB for Clerk ID: ${user.id}`,
        );
      } catch (error: any) {
        console.error("[API_AFTER_SIGNIN] Error creating user:", error);
        if (error.code === 11000) {
          // Handle duplicate key error (race condition)
          console.log(
            "[API_AFTER_SIGNIN] User already exists (race condition)",
          );
        } else {
          throw error;
        }
      }
    }

    // Redirect to notes page
    return NextResponse.redirect(new URL("/notes", req.url));
  } catch (error: any) {
    console.error("[API_AFTER_SIGNIN] Error:", error);
    return NextResponse.redirect(new URL(ROUTES.LANDING_PAGE || "/", req.url));
  }
}
