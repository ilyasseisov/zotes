import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db";
import UserModel from "@/lib/models/user";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(req: Request) {
  console.log("[API_UPGRADE] Received upgrade request");

  try {
    // Get the current user from Clerk
    const user = await currentUser();

    if (!user || !user.id) {
      console.log("[API_UPGRADE] No authenticated user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    console.log("[API_UPGRADE] Attempting to connect to database...");
    const dbResult = await dbConnect();
    if (!dbResult.success) {
      console.error("[API_UPGRADE] Database connection error:", dbResult.error);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    // Find the user in our database
    const dbUser = await UserModel.findOne({ clerkId: user.id });
    if (!dbUser) {
      console.error("[API_UPGRADE] User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (dbUser.planId === "paid") {
      console.log("[API_UPGRADE] User already has paid plan");
      return NextResponse.json(
        { error: "User already has paid plan" },
        { status: 400 },
      );
    }

    // Create Stripe checkout session
    const priceId = process.env.STRIPE_PRICE_ID_PAID_PLAN;
    if (!priceId) {
      console.error("[API_UPGRADE] Missing Stripe price ID");
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        clerkId: user.id,
      },
      client_reference_id: user.id,
      customer_email: user.emailAddresses[0]?.emailAddress,
      success_url: `${req.headers.get("origin")}/success`,
      cancel_url: `${req.headers.get("origin")}/cancel`,
    });

    console.log(`[API_UPGRADE] Stripe checkout session created: ${session.id}`);

    // Return the checkout URL
    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error: any) {
    console.error("[API_UPGRADE] Error processing upgrade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
