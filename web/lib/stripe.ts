import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export const PLATFORM_FEE_CENTS = 0; // $0 during beta — bump to e.g. 150 ($1.50) at launch
