import Stripe from "stripe";

export const PLATFORM_FEE_CENTS = 0; // $0 during beta — bump to e.g. 150 ($1.50) at launch

let client: Stripe | null = null;

function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key, { apiVersion: "2026-06-24.dahlia" });
  }
  return client;
}

// Lazy proxy so importing this module never constructs the Stripe client at
// load time — Next evaluates route modules during the build's page-data
// collection, where STRIPE_SECRET_KEY is absent. The real client is created on
// first property access at request time. Call sites keep using `stripe.*`.
export const stripe = new Proxy({} as Stripe, {
  get(_t, prop, receiver) {
    const c = getStripe();
    const value = Reflect.get(c as object, prop, receiver);
    return typeof value === "function" ? value.bind(c) : value;
  },
});
