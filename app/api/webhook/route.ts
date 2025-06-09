import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import UserModel from "@/lib/models/user";
import Stripe from "stripe";
import { headers } from "next/headers";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-04-30.basil",
});

// Get your Stripe webhook secret from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  console.log("[API_STRIPE_WEBHOOK] Received a request.");

  if (!webhookSecret) {
    console.error(
      "[API_STRIPE_WEBHOOK] CRITICAL: Stripe webhook secret is not set. Denying request.",
    );
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }
  //
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No stripe signature found", { status: 400 });
  }

  let event: Stripe.Event;
  //

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(
      `[API_STRIPE_WEBHOOK] Event constructed successfully: ${event.id}, Type: ${event.type}`,
    );
  } catch (err: any) {
    console.error(
      `[API_STRIPE_WEBHOOK] Error verifying webhook signature: ${err.message}`,
    );
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }
  //
  // Get the data object from the event
  const dataObject = event.data.object as any;
  //
  try {
    console.log("[API_STRIPE_WEBHOOK] Attempting to connect to database...");
    const dbResult = await dbConnect();
    if (!dbResult.success) {
      console.error(
        "[API_STRIPE_WEBHOOK] Database connection error:",
        dbResult.error,
      );
      // Stripe will retry if it doesn't get a 2xx response.
      // So, a 500 error here is appropriate to signal an issue on our end.
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }
    console.log("[API_STRIPE_WEBHOOK] Database connection successful.");

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = dataObject as Stripe.Checkout.Session;
        console.log(
          `[API_STRIPE_WEBHOOK] Handling 'checkout.session.completed' for session ID: ${session.id}`,
        );

        const clerkId = session.client_reference_id; // This was set to user.id during checkout creation
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string; // Good to store this too

        if (!clerkId) {
          console.error(
            "[API_STRIPE_WEBHOOK] 'checkout.session.completed': Missing client_reference_id (clerkId) in session.",
          );
          return NextResponse.json(
            { error: "Missing client_reference_id" },
            { status: 400 },
          );
        }

        console.log(
          `[API_STRIPE_WEBHOOK] 'checkout.session.completed': Clerk ID: ${clerkId}, Stripe Customer ID: ${stripeCustomerId}, Stripe Subscription ID: ${stripeSubscriptionId}`,
        );

        // Find user by clerkId and update their details
        const updatedUser = await UserModel.findOneAndUpdate(
          { clerkId: clerkId },
          {
            $set: {
              hasAccess: true,
              planId: "paid",
              customerId: stripeCustomerId,
              // Consider adding subscriptionId and subscriptionStatus to your User schema
              // subscriptionId: stripeSubscriptionId,
              // subscriptionStatus: "active", // Or derive from subscription object
            },
          },
          { new: true }, // Return the updated document
        );

        if (!updatedUser) {
          console.error(
            `[API_STRIPE_WEBHOOK] 'checkout.session.completed': User with Clerk ID ${clerkId} not found in DB. This is unexpected.`,
          );
          // This is a critical issue, as the user should have been created during signup.
          // Stripe will retry on non-2xx.
          return NextResponse.json(
            { error: "User not found for update" },
            { status: 404 },
          );
        }

        console.log(
          `[API_STRIPE_WEBHOOK] 'checkout.session.completed': User ${clerkId} updated successfully. New plan: ${updatedUser.planId}, Has access: ${updatedUser.hasAccess}, Stripe Customer ID: ${updatedUser.customerId}`,
        );
        break;

      default:
        console.warn(
          `[API_STRIPE_WEBHOOK] Unhandled event type: ${event.type}`,
        );
    }
  } catch (error: any) {
    console.error(
      `[API_STRIPE_WEBHOOK] Error processing event ${event?.id} (Type: ${event?.type}):`,
      error,
    );
    console.error("Error message:", error.message);
    if (error.stack) {
      console.error("Error stack:", error.stack);
    }
    // Return 500 to indicate an internal error; Stripe will retry.
    return NextResponse.json(
      { error: "Internal server error while processing webhook" },
      { status: 500 },
    );
  }

  // Acknowledge receipt of the event to Stripe
  console.log(
    `[API_STRIPE_WEBHOOK] Successfully processed event ${event.id}. Responding 200 to Stripe.`,
  );
  return NextResponse.json({ received: true }, { status: 200 });
  //
}
