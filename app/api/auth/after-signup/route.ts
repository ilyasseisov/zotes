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

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 500; // milliseconds
const BACKOFF_MULTIPLIER = 1.5; // Exponential backoff

/**
 * Attempts to get current user with retry logic
 * Implements exponential backoff to handle timing issues
 */
async function getCurrentUserWithRetry(): Promise<any> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        `[API_AFTER_SIGNUP] Attempt ${attempt}/${MAX_RETRIES}: Fetching current user...`,
      );

      const user = await currentUser();

      if (user && user.id) {
        console.log(
          `[API_AFTER_SIGNUP] Success on attempt ${attempt}: User found with ID: ${user.id}`,
        );
        return user;
      }

      console.log(
        `[API_AFTER_SIGNUP] Attempt ${attempt}/${MAX_RETRIES}: No user found`,
      );

      // Don't wait after the last attempt
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(BACKOFF_MULTIPLIER, attempt - 1);
        console.log(`[API_AFTER_SIGNUP] Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`[API_AFTER_SIGNUP] Error on attempt ${attempt}:`, error);

      // Don't wait after the last attempt or if it's a critical error
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(BACKOFF_MULTIPLIER, attempt - 1);
        console.log(
          `[API_AFTER_SIGNUP] Error occurred, waiting ${delay}ms before retry...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.log(
    `[API_AFTER_SIGNUP] All ${MAX_RETRIES} attempts failed to get user`,
  );
  return null;
}

/**
 * Checks if this is a retry request and handles retry logic
 */
function getRetryInfo(url: URL): { isRetry: boolean; retryCount: number } {
  const retryParam = url.searchParams.get("retry");
  const retryCount = retryParam ? parseInt(retryParam, 10) : 0;
  return {
    isRetry: retryCount > 0,
    retryCount: isNaN(retryCount) ? 0 : retryCount,
  };
}

/**
 * Creates a retry URL with incremented retry count
 */
function createRetryUrl(
  originalUrl: string,
  currentRetryCount: number,
): string {
  const url = new URL(originalUrl);
  url.searchParams.set("retry", (currentRetryCount + 1).toString());
  return url.toString();
}

export async function GET(req: Request) {
  const requestUrl = req.url;
  console.log(
    `[API_AFTER_SIGNUP] START: Received request for URL: ${requestUrl}`,
  );

  // Check if this is a retry request
  const url = new URL(requestUrl);
  const { isRetry, retryCount } = getRetryInfo(url);

  if (isRetry) {
    console.log(`[API_AFTER_SIGNUP] This is retry attempt #${retryCount}`);
  }

  try {
    // Use retry logic to get current user
    const user = await getCurrentUserWithRetry();

    console.log(
      `[API_AFTER_SIGNUP] Final user result: ${user ? `ID: ${user.id}, Email: ${user.emailAddresses?.[0]?.emailAddress}` : "No user found after all retries"}`,
    );

    if (!user || !user.id) {
      // If we still don't have a user after retries, try one more client-side retry
      if (retryCount < 2) {
        console.log(
          `[API_AFTER_SIGNUP] No user found after server retries. Attempting client-side retry #${retryCount + 1}`,
        );

        const retryUrl = createRetryUrl(requestUrl, retryCount);
        console.log(`[API_AFTER_SIGNUP] Redirecting to retry URL: ${retryUrl}`);

        return NextResponse.redirect(retryUrl);
      }

      // Final fallback - redirect to landing page
      console.log(
        "[API_AFTER_SIGNUP] No Clerk user found after all retry attempts, redirecting to APP root.",
      );
      return NextResponse.redirect(
        new URL(ROUTES.LANDING_PAGE || "/", requestUrl),
      );
    }

    // Clear retry parameter from URL for clean URLs going forward
    const cleanUrl = new URL(requestUrl);
    cleanUrl.searchParams.delete("retry");

    const planFromUrl = cleanUrl.searchParams.get("plan");
    console.log(
      `[API_AFTER_SIGNUP] Plan from URL query parameter: '${planFromUrl}'`,
    );

    const unsafeMetadata =
      (user.unsafeMetadata as { selectedPlan?: string }) || {};
    const planFromMetadata = unsafeMetadata.selectedPlan;
    console.log(
      `[API_AFTER_SIGNUP] Plan from Clerk unsafeMetadata: '${planFromMetadata}'`,
    );

    // Default to "free" if no plan is provided from any source
    const plan = planFromUrl || planFromMetadata || "free";
    console.log(
      `[API_AFTER_SIGNUP] Final plan determined as: '${plan}' (defaulted to 'free' if no plan was provided)`,
    );

    if (plan !== "free" && plan !== "paid") {
      console.log(
        `[API_AFTER_SIGNUP] Invalid plan type: '${plan}'. Defaulting to 'free' plan.`,
      );
      // Instead of redirecting on invalid plan, default to free
      const defaultPlan = "free";
      console.log(`[API_AFTER_SIGNUP] Using default plan: '${defaultPlan}'`);
    }

    // Use the validated plan (either the determined plan if valid, or "free" as fallback)
    const finalPlan = plan === "free" || plan === "paid" ? plan : "free";

    // Database connection and user creation logic
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
        `[API_AFTER_SIGNUP] Creating new user in DB with Clerk ID: ${user.id}, Plan: ${finalPlan}`,
      );
      try {
        const newUser = await UserModel.create({
          clerkId: user.id,
          email: user.emailAddresses?.[0]?.emailAddress,
          hasAccess: finalPlan === "free",
          planId: finalPlan,
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
        `[API_AFTER_SIGNUP] User with Clerk ID: ${user.id} already exists in DB. DB ID: ${existingUser._id}. Current plan in DB: ${existingUser.planId}. Selected plan: ${finalPlan}`,
      );
    }

    // Handle redirects based on plan
    if (finalPlan === "free") {
      const notesRedirectUrl = new URL("/notes", cleanUrl.origin);
      console.log(
        `[API_AFTER_SIGNUP] Plan is 'free'. Redirecting to: ${notesRedirectUrl.toString()}`,
      );
      return NextResponse.redirect(notesRedirectUrl);
    } else {
      // finalPlan === "paid" - Create Stripe checkout session directly
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
          success_url: `${cleanUrl.origin}/success`,
          cancel_url: `${cleanUrl.origin}/cancel`,
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

    // Include retry info in error logging
    const { retryCount } = getRetryInfo(new URL(requestUrl));
    console.error(
      `[API_AFTER_SIGNUP] Error occurred on retry attempt: ${retryCount}`,
    );

    const errorRedirectUrl = new URL(ROUTES.LANDING_PAGE || "/", requestUrl);
    console.log(
      `[API_AFTER_SIGNUP] Redirecting to APP root due to error: ${errorRedirectUrl.toString()}`,
    );
    return NextResponse.redirect(errorRedirectUrl);
  }
}
