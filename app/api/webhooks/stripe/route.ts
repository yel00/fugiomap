import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia" as any,
  });
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const { surveyId } = session.metadata ?? {};
      if (surveyId) {
        await convex.mutation(api.surveys.update, {
          id: surveyId as any,
          stripeSubscriptionId: session.subscription as string,
          stripeCustomerId: session.customer as string,
          pricePlan: "active",
        } as any);
      }
      break;
    }
    case "customer.subscription.deleted": {
      // Handle cancellation if needed
      break;
    }
  }

  return NextResponse.json({ received: true });
}
