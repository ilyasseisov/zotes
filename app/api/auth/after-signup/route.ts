import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import UserModel from "@/lib/models/user";
import dbConnect from "@/lib/db";
import ROUTES from "@/constants/routes";

export async function GET(req: Request) {
  try {
    // Get the current user from Clerk
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.redirect(new URL(ROUTES.APP, req.url));
    }

    // Get the plan type from the query parameters
    const url = new URL(req.url);
    const planFromUrl = url.searchParams.get("plan");

    // If plan isn't in URL, try to get it from unsafeMetadata (fallback)
    // This is useful if the URL parameter was lost during OAuth redirect
    const unsafeMetadata =
      (user.unsafeMetadata as { selectedPlan?: string }) || {};
    const planFromMetadata = unsafeMetadata.selectedPlan;

    // Use URL param first, then metadata, then default to "free"
    const plan = planFromUrl || planFromMetadata || "free";

    // Validate plan type
    if (plan !== "free" && plan !== "paid") {
      return NextResponse.redirect(new URL(ROUTES.APP, req.url));
    }

    // Connect to MongoDB using your preferred method
    const dbResult = await dbConnect();
    if (!dbResult.success) {
      console.error("Database connection error:", dbResult.error);
      throw new Error(
        dbResult.error?.message || "Failed to connect to database",
      );
    }

    // Check if user already exists in our database
    const existingUser = await UserModel.findOne({ clerkId: user.id });

    if (!existingUser) {
      try {
        // Create new user in MongoDB using create() method
        await UserModel.create({
          clerkId: user.id,
          hasAccess: plan === "free", // Set to true for free plan, false for paid plan until payment
          planId: plan,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(`User created with clerkId: ${user.id}, plan: ${plan}`);
      } catch (error: any) {
        console.error("Error creating user:", error);

        // Check for duplicate key error
        if (error.code === 11000) {
          console.error("Duplicate user error");
          // Still proceed with the flow since the user exists
        } else {
          throw error;
        }
      }
    }

    // Redirect based on the plan type
    if (plan === "free") {
      // For free plan, redirect to dashboard
      return NextResponse.redirect(new URL("/notes", req.url));
    } else {
      // For paid plan, redirect to billing page to complete payment
      return NextResponse.redirect(
        new URL(`/api/billing/checkout?plan=${plan}`, req.url),
      );
    }
  } catch (error: any) {
    console.error("Error in after-signup:", error);
    return NextResponse.redirect(new URL(ROUTES.APP, req.url));
  }
}
