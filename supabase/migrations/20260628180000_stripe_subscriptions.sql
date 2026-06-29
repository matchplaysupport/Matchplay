-- Golfer subscriptions: expand entitlement enum + add Stripe tracking columns
alter table public.subscription_entitlements
  drop constraint if exists subscription_entitlements_entitlement_check;

alter table public.subscription_entitlements
  add constraint subscription_entitlements_entitlement_check
    check (entitlement in ('free', 'plus', 'pro'));

alter table public.subscription_entitlements
  add column if not exists stripe_customer_id text unique,
  add column if not exists stripe_subscription_id text unique,
  add column if not exists current_period_end timestamptz,
  add column if not exists founding boolean not null default false;

-- Course operators: plan + Stripe tracking columns
alter table public.course_operators
  add column if not exists plan text not null default 'free'
    check (plan in ('free', 'pro')),
  add column if not exists stripe_customer_id text unique,
  add column if not exists stripe_subscription_id text unique,
  add column if not exists current_period_end timestamptz,
  add column if not exists founding boolean not null default false;
