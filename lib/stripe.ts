import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "placeholder", {
  apiVersion: "2026-05-27.dahlia",
});
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://brandkit-sigma.vercel.app";
