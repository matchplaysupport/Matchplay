# Match Play — Subscription & Pricing Strategy

Status: **Proposed** (2026-06-28). Supersedes the placeholder "Flat rate" card on the
landing page and the un-priced `free`/`pro` enum in
`src/integrations/payments/SubscriptionProvider.ts`.

## TL;DR

| Surface | Plan | Price | Role |
|---|---|---|---|
| **Course (B2B)** | Listing | **$0** | Supply density / land-and-expand |
| | **Pro** ⭐ | **$199/mo** ($1,990/yr — 2 mo free) | Core revenue engine |
| | Premium / Multi-Course | **$399/mo** or custom | Groups, integrations, upsell |
| | *Founding rate* | **$99/mo locked for life** (first 100 courses) | Acquisition wedge |
| **Golfer (B2C)** | Free | **$0 forever** | Keeps the brand promise; drives liquidity |
| | **Match Play+** | **$4.99/mo or $39.99/yr** (founding $29.99/yr) | Optional power-user upsell |

**Commission stays 0%.** All revenue comes from subscriptions. Payment processing
(Stripe Connect, ~2.9% + 30¢) is a transparent pass-through, *not* a Match Play cut —
this is what protects the "keep 100% of every green fee" promise.

## Why this pricing

The competitive frame is the most important decision here. **Match Play is a demand
channel + marketplace, not a POS.** So we anchor against the channel we're displacing,
not the software a course already runs.

| Competitor | Model | Annual cost to a course |
|---|---|---|
| GolfNow (incumbent) | Barter + commission + golfer fees | **~$37,000** avg (up to $150k+) |
| foreUP (POS) | Subscription | ~$2,400+ |
| Lightspeed Golf (POS) | Subscription | ~$1,800–3,900 |
| **Match Play Pro** | Flat subscription, 0% commission | **$2,388** ($1,188 founding) |

Against GolfNow, $199/mo is a ~94% cost reduction *and* the course keeps the golfer
relationship. That contrast — not the absolute number — is the sales pitch. Pricing
much below $199 leaves money on the table and signals "tool," not "channel."

Consumer comps (18Birdies $60–90/yr, TheGrint $30–80/yr) put Match Play+ at the **low
end on purpose**: booking is free, so + only sells power/social features and should
convert on impulse, not deliberation.

## Course tiers (primary revenue)

Annual = 2 months free. Founding rate applies to the **Pro** tier for the first ~100
courses and is locked for the life of the account.

| Feature | Listing ($0) | **Pro ($199/mo)** | Premium ($399/mo) |
|---|:--:|:--:|:--:|
| Marketplace listing + course profile | ✅ | ✅ | ✅ |
| Accept bookings, 0% commission | ✅ | ✅ | ✅ |
| Stripe Connect payouts (~2 days) | ✅ | ✅ | ✅ |
| Monthly booking cap | 25/mo | Unlimited | Unlimited |
| Full tee-sheet & pricing control | — | ✅ | ✅ |
| Waitlist & last-minute fills | — | ✅ | ✅ |
| Booking & revenue analytics | Basic | Full | Full + exports |
| Featured placement in search | — | ✅ | Priority |
| Staff seats | 1 | 5 | Unlimited |
| Locations | 1 | 1 | Multi-course |
| Dynamic pricing automation | — | — | ✅ |
| Group & tournament booking | — | — | ✅ |
| POS integrations (foreUP, Lightspeed) | — | — | ✅ (Phase 3) |
| Support | Email | Priority | Dedicated onboarding |

**Why a free Listing tier:** a two-sided marketplace dies without supply. Free listing
maximizes course density so golfers find inventory; the 25-booking cap and missing
tee-sheet/analytics tools make Pro the obvious upgrade once a course sees real volume.
If supply turns out *not* to be the constraint, drop Listing and make Pro the entry tier.

## Golfer tiers (secondary — protects "free forever")

The free tier must keep the public promise: **searching, booking, scoring, and all
safety tools are free forever.** Match Play+ only sells features that are *power/social*,
never booking — so "free to book, forever" stays literally true.

| Feature | Free ($0) | **Match Play+ ($4.99/mo)** |
|---|:--:|:--:|
| Unlimited tee-time search & booking, 0 fees | ✅ | ✅ |
| Match-play & stroke-play scoring | ✅ | ✅ |
| Handicap tracking (estimate) | ✅ | ✅ |
| Last-minute deal alerts | ✅ | Priority / early access |
| Block, report, delete account (safety) | ✅ | ✅ (never paid) |
| Leaderboards | Local | **State & national** |
| Open games | Join up to 2 active | **Unlimited + private groups** |
| Discovery filters | Basic | **Advanced** (price, conditions, radius, time) |
| Discovery undo / rewind | — | ✅ |
| Advanced stats & match history | — | ✅ |

These map 1:1 to the existing `ProFeature` enum:
`state_national_leaderboards`, `unlimited_open_games`, `advanced_filters`,
`discovery_undo`. No new gating primitives are needed.

## Revenue model (illustrative, modest scale)

| Source | Assumption | ARR |
|---|---|---|
| Pro courses | 250 @ $199/mo | ~$597k |
| Premium courses | 25 @ $399/mo | ~$120k |
| Match Play+ | 50k MAU × 3% × $39.99/yr | ~$60k |
| **Total** | | **~$777k** |

~420 paying Pro courses = $1M ARR from courses alone, against a US TAM of ~16,000
facilities. The course subscription is the business; golfer + is gravy that also lifts
retention.

## Open decisions / flags

1. **Landing page** currently shows "Flat rate" with no number. Recommend showing
   **"From $99/mo — founding"** to anchor value without locking GA pricing publicly.
2. **"Free forever" for golfers** is compatible with Match Play+ *only* because + never
   gates booking. Keep that line bright; legal review (see `MVP_LIMITATIONS.md`) should
   confirm consumer-subscription disclosure.
3. **Payment-processing margin** is an optional future lever (e.g., bill courses a flat
   3.5% all-in, keep ~0.6% over Stripe cost). It technically dilutes "keep 100%," so
   it's *off* by default — subscriptions carry the model.
4. **Schema/code gaps to implement next:**
   - Add a `plan` / `subscription_tier` column + status to `course_operators` (or a new
     `course_subscriptions` table) with Stripe Billing as source of truth.
   - Extend `SubscriptionProvider` with course-side tiers, or add a parallel
     `CourseSubscriptionProvider`; today it only models the golfer `free`/`pro` enum.
   - Create Stripe Products/Prices for all five plans (3 course + founding + golfer+).
