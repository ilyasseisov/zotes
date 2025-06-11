import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import UserModel from "@/lib/models/user";
import dbConnect from "@/lib/db";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(req: Request) {
  console.log("[API_PORTAL] START: Received portal access request");

  try {
    // Get current user
    const user = await currentUser();

    if (!user || !user.id) {
      console.log("[API_PORTAL] No authenticated user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[API_PORTAL] User found with ID: ${user.id}`);

    // Connect to database
    console.log("[API_PORTAL] Connecting to database...");
    const dbResult = await dbConnect();

    if (!dbResult.success) {
      console.error("[API_PORTAL] Database connection error:", dbResult.error);
      throw new Error(
        dbResult.error?.message || "Failed to connect to database",
      );
    }

    // Get user from database
    const dbUser = await UserModel.findOne({ clerkId: user.id });

    if (!dbUser) {
      console.log(
        `[API_PORTAL] No user found in database for Clerk ID: ${user.id}`,
      );
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (dbUser.planId !== "paid") {
      console.log(`[API_PORTAL] User ${user.id} is not a paid subscriber`);
      return NextResponse.json(
        { error: "Only available for paid subscribers" },
        { status: 403 },
      );
    }

    if (!dbUser.customerId) {
      console.log(`[API_PORTAL] User ${user.id} has no Stripe customer ID`);
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 400 },
      );
    }

    // Parse request body
    const body = await req.json();
    const returnUrl = body.returnUrl || process.env.NEXT_PUBLIC_APP_URL;

    console.log("[API_PORTAL] Creating Stripe customer portal session");

    // Create Stripe customer portal session using customerId instead of stripeCustomerId
    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.customerId,
      return_url: returnUrl,
    });

    console.log(`[API_PORTAL] Portal session created. URL: ${session.url}`);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[API_PORTAL] Error creating portal session:", error);
    console.error("Error message:", error.message);
    if (error.stack) {
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 },
    );
  }
}
