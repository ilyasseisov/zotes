import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

// This line of code initializes the Stripe SDK (server-side) so your
// app can talk to Stripe's API and do things like
// create checkout sessions, manage subscriptions, etc.
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(req: Request) {
  // Get the current user's ID from Clerk authentication
  const user = await currentUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customerEmail = user.emailAddresses[0]?.emailAddress;

  // Get the data sent from the client (frontend)
  const body = await req.json();
  if (!body.successUrl || !body.cancelUrl) {
    return NextResponse.json(
      { error: "Missing success or cancel URL" },
      { status: 400 },
    );
  }

  const priceId = process.env.STRIPE_PRICE_ID_PAID_PLAN;

  // If no valid price ID was found, return an error
  if (!priceId) {
    return NextResponse.json(
      { error: "Missing price ID for paid plan" },
      { status: 400 },
    );
  }

  try {
    // Create a Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: "subscription", // Because you're offering recurring plans
      payment_method_types: ["card"], // Only allow credit/debit card payments

      // What the user is buying
      line_items: [
        {
          price: priceId, // Stripe price ID
          quantity: 1, // Only one subscription per purchase
        },
      ],

      // Store Clerk user ID in Stripe metadata (useful for webhooks later)
      metadata: {
        clerkId: user.id,
      },
      client_reference_id: user.id,
      customer_email: customerEmail,
      // Where to send the user after successful payment
      success_url: body.successUrl,

      // Where to send the user if they cancel
      cancel_url: body.cancelUrl,
    });

    // Return the checkout session URL to the frontend
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
