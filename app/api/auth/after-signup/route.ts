import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import UserModel from "@/lib/models/user";
import dbConnect from "@/lib/db";
import ROUTES from "@/constants/routes";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function GET(req: Request) {
  console.log(`[API_AFTER_SIGNUP] START: Received request for URL: ${req.url}`);

  try {
    const user = await currentUser();
    console.log(
      `[API_AFTER_SIGNUP] Clerk user: ${user ? `ID: ${user.id}, Email: ${user.emailAddresses?.[0]?.emailAddress}` : "No user found by Clerk"}`,
    );

    if (!user || !user.id) {
      console.log(
        "[API_AFTER_SIGNUP] No Clerk user or user ID found, redirecting to APP root.",
      );
      return NextResponse.redirect(
        new URL(ROUTES.LANDING_PAGE || "/", req.url),
      );
    }

    const url = new URL(req.url);
    const planFromUrl = url.searchParams.get("plan");
    console.log(
      `[API_AFTER_SIGNUP] Plan from URL query parameter: '${planFromUrl}'`,
    );

    const unsafeMetadata =
      (user.unsafeMetadata as { selectedPlan?: string }) || {};
    const planFromMetadata = unsafeMetadata.selectedPlan;
    console.log(
      `[API_AFTER_SIGNUP] Plan from Clerk unsafeMetadata: '${planFromMetadata}'`,
    );

    const plan = planFromUrl || planFromMetadata || "free";
    console.log(`[API_AFTER_SIGNUP] Final plan determined as: '${plan}'`);

    if (plan !== "free" && plan !== "paid") {
      console.log(
        `[API_AFTER_SIGNUP] Invalid plan type: '${plan}'. Redirecting to APP root.`,
      );
      return NextResponse.redirect(
        new URL(ROUTES.LANDING_PAGE || "/", req.url),
      );
    }

    // Database connection and user creation logic (same as before)
    console.log("[API_AFTER_SIGNUP] Attempting to connect to database...");
    const dbResult = await dbConnect();

    if (!dbResult.success) {
      console.error(
        "[API_AFTER_SIGNUP] Database connection error:",
        dbResult.error,
      );
      throw new Error(
        dbResult.error?.message || "Failed to connect to database",
      );
    }
    console.log("[API_AFTER_SIGNUP] Database connection successful.");

    console.log(
      `[API_AFTER_SIGNUP] Checking for existing user in DB with Clerk ID: ${user.id}`,
    );
    const existingUser = await UserModel.findOne({ clerkId: user.id });
    console.log(
      `[API_AFTER_SIGNUP] Existing user in DB check: ${existingUser ? `Found user with DB ID: ${existingUser._id}` : "No existing user found in DB"}`,
    );

    if (!existingUser) {
      console.log(
        `[API_AFTER_SIGNUP] Creating new user in DB with Clerk ID: ${user.id}, Plan: ${plan}`,
      );
      try {
        const newUser = await UserModel.create({
          clerkId: user.id,
          email: user.emailAddresses?.[0]?.emailAddress,
          hasAccess: plan === "free",
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
        if (error.code === 11000) {
          console.error(
            "[API_AFTER_SIGNUP] Duplicate user error (code 11000) during create. This might indicate a race condition or prior creation. Proceeding as if user exists.",
          );
        } else {
          throw error;
        }
      }
    } else {
      console.log(
        `[API_AFTER_SIGNUP] User with Clerk ID: ${user.id} already exists in DB. DB ID: ${existingUser._id}. Current plan in DB: ${existingUser.planId}. Selected plan: ${plan}`,
      );
    }

    // Handle redirects based on plan
    if (plan === "free") {
      const notesRedirectUrl = new URL("/notes", req.url);
      console.log(
        `[API_AFTER_SIGNUP] Plan is 'free'. Redirecting to: ${notesRedirectUrl.toString()}`,
      );
      return NextResponse.redirect(notesRedirectUrl);
    } else {
      // plan === "paid" - Create Stripe checkout session directly
      console.log(
        "[API_AFTER_SIGNUP] Plan is 'paid'. Creating Stripe checkout session...",
      );

      const customerEmail = user.emailAddresses[0]?.emailAddress;
      const priceId = process.env.STRIPE_PRICE_ID_PAID_PLAN;

      if (!priceId) {
        console.error("[API_AFTER_SIGNUP] Missing Stripe price ID");
        throw new Error("Missing price ID for paid plan");
      }

      try {
        // Create Stripe checkout session
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
          customer_email: customerEmail,
          success_url: `${url.origin}/success`,
          cancel_url: `${url.origin}/cancel`,
        });

        console.log(
          `[API_AFTER_SIGNUP] Stripe checkout session created. Redirecting to: ${session.url}`,
        );

        // Redirect to Stripe checkout
        return NextResponse.redirect(session.url!);
      } catch (stripeError) {
        console.error(
          "[API_AFTER_SIGNUP] Error creating Stripe checkout session:",
          stripeError,
        );
        throw stripeError;
      }
    }
  } catch (error: any) {
    console.error(
      "[API_AFTER_SIGNUP] CRITICAL ERROR in after-signup route:",
      error,
    );
    console.error("Error message:", error.message);
    if (error.stack) {
      console.error("Error stack:", error.stack);
    }
    const errorRedirectUrl = new URL(ROUTES.LANDING_PAGE || "/", req.url);
    console.log(
      `[API_AFTER_SIGNUP] Redirecting to APP root due to error: ${errorRedirectUrl.toString()}`,
    );
    return NextResponse.redirect(errorRedirectUrl);
  }
}
