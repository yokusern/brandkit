import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAdminDb } from "@/lib/firebaseAdmin";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch {
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  const db = getAdminDb();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid = session.metadata?.uid;
    if (uid) await db.collection("bk_users").doc(uid).set({ plan: "pro" }, { merge: true });
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const snap = await db.collection("bk_users").where("stripeCustomerId", "==", sub.customer).limit(1).get();
    if (!snap.empty) {
      const plan = sub.status === "active" ? "pro" : "free";
      await snap.docs[0].ref.set({ plan }, { merge: true });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const snap = await db.collection("bk_users").where("stripeCustomerId", "==", sub.customer).limit(1).get();
    if (!snap.empty) await snap.docs[0].ref.set({ plan: "free" }, { merge: true });
  }

  return NextResponse.json({ received: true });
}
