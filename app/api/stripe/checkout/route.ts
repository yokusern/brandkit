import { NextRequest, NextResponse } from "next/server";
import { stripe, APP_URL } from "@/lib/stripe";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  let uid: string, email: string | undefined;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    uid = decoded.uid;
    email = decoded.email;
  } catch {
    return NextResponse.json({ error: "認証エラー" }, { status: 401 });
  }

  const db = getAdminDb();
  const userDoc = await db.collection("bk_users").doc(uid).get();
  const userData = userDoc.data() || {};

  let customerId: string | undefined = userData.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email, metadata: { uid } });
    customerId = customer.id;
    await db.collection("bk_users").doc(uid).set({ stripeCustomerId: customerId }, { merge: true });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    mode: "subscription",
    success_url: `${APP_URL}/?upgraded=true`,
    cancel_url: `${APP_URL}/`,
    locale: "ja",
    metadata: { uid },
  });

  return NextResponse.json({ url: session.url });
}
