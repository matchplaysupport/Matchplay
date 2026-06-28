-- Stripe Connect account id for each course operator
alter table public.course_operators
  add column if not exists stripe_account_id text,
  add column if not exists stripe_onboarded boolean not null default false;

-- Payment tracking on bookings
alter table public.bookings
  add column if not exists stripe_payment_intent_id text unique,
  add column if not exists amount_paid_cents integer;

-- Expanded booking status to cover Stripe lifecycle
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('requested', 'payment_pending', 'confirmed', 'fulfilled', 'cancelled', 'simulated_confirmed'));
