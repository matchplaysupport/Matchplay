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
| **Golfer (B2C)** | Free — "Browse" | **$0** | View-only hook; see live inventory, do nothing |
| | **Match Play+** — "Play" | **$9.99/mo** | Booking, scoring, handicap, stats — the full golf app |
| | **Match Play Pro** — "Compete" | **$19.99/mo** | Competitive, social-power, and organizer layer |

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

On the consumer side we chose a **gated three-tier model** instead of "free forever."
Free is view-only (see live tee times, do nothing); booking and everything else sit
behind Match Play+ ($9.99) and Pro ($19.99). This is a deliberate bet: booking *alone*
never justifies $9.99 (golfers book free on GolfNow), so Match Play+ is positioned as
"your entire golf app — booking + scoring + handicap + stats — for $10/mo," i.e.
18Birdies Premium ($60–90/yr) *plus* real tee-time booking. Pro earns its 2× by being
explicitly for competitive players and event organizers. The split rule:
**record-your-own-golf → Match Play+; measure-against-others or run-events → Pro.**

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

## Golfer tiers

Each tier has a job: **Free = "Browse"** (see everything, do nothing — the hook),
**Match Play+ = "Play"** (everything you need to actually golf with the app),
**Pro = "Compete"** (the competitive, social-power, and organizer layer). Features below
are mapped from the real app surface (`app/(tabs)` + `src/services`).

| Feature | Free | **Match Play+ $9.99** | **Pro $19.99** |
|---|:--:|:--:|:--:|
| **Booking & discovery** | | | |
| View live tee times + green fees | ✅ | ✅ | ✅ |
| Course profiles, photos, info | ✅ | ✅ | ✅ |
| Basic search (date, time, players) | ✅ | ✅ | ✅ |
| **Book a tee time** | — | ✅ | ✅ |
| Saved / favorite courses | — | 5 | Unlimited |
| Last-minute deal alerts | — | ✅ | Priority + early access |
| Advanced filters (price, conditions, radius, time) | — | — | ✅ |
| Waitlist priority on full tee sheets | — | — | ✅ |
| **Scoring & handicap** | | | |
| Digital scorecard (stroke play) | — | ✅ | ✅ |
| All formats (match play, stableford, practice) | — | ✅ | ✅ |
| Hole-by-hole + hole maps | — | ✅ | ✅ |
| Resume in-progress rounds | — | ✅ | ✅ |
| Handicap tracking (estimate) | — | ✅ | ✅ |
| Round history | — | Last 20 | Full + trends |
| Advanced analytics (strokes-gained, club/hole) | — | — | ✅ |
| GHIN / official handicap sync *(when live)* | — | — | ✅ |
| **Social & competitive** | | | |
| Local leaderboards | — | ✅ | ✅ |
| State & national leaderboards | — | — | ✅ |
| Find playing partners (discovery) | — | ✅ | ✅ |
| Discovery undo / rewind | — | — | ✅ |
| Open games — join | — | Up to 2 active | Unlimited |
| Open games — host / create | — | — | ✅ |
| Match-play challenges (head-to-head + verification) | — | Casual | Ranked + verified |
| Private groups | — | — | ✅ |
| In-app messaging | — | ✅ | ✅ |
| **Tournaments & events** | | | |
| Join tournaments / scrambles | — | ✅ | ✅ |
| Create + manage tournaments | — | — | ✅ |
| Scramble organizer suite (sponsors, flights, packages) | — | — | ✅ |
| **Safety** (never gated) | | | |
| Block, report, delete account | ✅ | ✅ | ✅ |

**Design logic:** tier on intensity of use, not random feature scatter. Limits (2 open
games, 5 saved courses on +) let avid golfers *feel* the ceiling and self-select into
Pro — better than hiding a feature outright. The scramble organizer suite is the quiet
Pro anchor: running a charity scramble with sponsors and flights is worth $20/mo to that
segment by itself.

**Scoring-hook caveat:** locking *all* scoring behind + gives up the free on-course
scorecard that 18Birdies/TheGrint use as their daily-habit funnel. Strong alternative:
move basic stroke-play scoring to Free, keep advanced formats, history depth, and
analytics paid. The matrix works either way.

## Revenue model (illustrative, modest scale)

| Source | Assumption | ARR |
|---|---|---|
| Pro courses | 250 @ $199/mo | ~$597k |
| Premium courses | 25 @ $399/mo | ~$120k |
| Match Play+ | 100k registered × 5% @ $9.99/mo | ~$599k |
| Match Play Pro (golfer) | 100k registered × 1% @ $19.99/mo | ~$240k |
| **Total** | | **~$1.56M** |

The course lines (~$717k) are the **reliable floor** — a sales problem you control. The
consumer lines (~$839k) are the **upside bet**: real if you hit 100k engaged golfers
converting at 5%/1% with booking gated, but that conversion is the single biggest
unknown in this plan. Treat courses as the business and consumer revenue as the lever
to prove. US TAM: ~16,000 facilities, ~25M golfers.

## Open decisions / flags

1. ⚠️ **Landing page directly contradicts this model.** `web/app/page.tsx` markets to
   golfers: "Free for golfers, forever," "Zero booking fees," and lists *unlimited
   search, scoring, handicap, leaderboards, and deal alerts* as **free**. The gated
   model paywalls booking + scoring + handicap + leaderboards + alerts behind $9.99/+.
   These cannot both ship. Decide the golfer story first, then rewrite the page —
   recommend reframing free as "Free to browse — see every tee time near you" and adding
   the +/Pro cards. This is the highest-priority reconciliation.
2. **Course landing card** still shows "Flat rate" with no number. Recommend
   **"From $99/mo — founding."**
3. **Payment-processing margin** is an optional future lever (e.g., bill courses a flat
   3.5% all-in, keep ~0.6% over Stripe cost). It technically dilutes "keep 100%," so
   it's *off* by default — subscriptions carry the model.
4. **Naming:** "Premium vs Pro" is ambiguous on which is higher. Recommend brand-tied
   **Match Play+** ($9.99) and **Match Play Pro** ($19.99).
5. **Schema/code gaps to implement next:**
   - Add a `plan` / `subscription_tier` column + status to `course_operators` (or a new
     `course_subscriptions` table) with Stripe Billing as source of truth.
   - Extend `SubscriptionProvider`: the entitlement enum is two-state (`free`/`pro`) and
     must become three-state (`free`/`plus`/`pro`); add the new Match Play+ gates
     (`booking`, `scoring`, `handicap`, `local_leaderboards`, `discovery`, `messaging`)
     alongside the existing Pro gates (`state_national_leaderboards`,
     `unlimited_open_games`, `advanced_filters`, `discovery_undo`, plus host-games,
     advanced-analytics, tournament-create, scramble-organizer).
   - Create Stripe Products/Prices for all plans (3 course + founding + 2 golfer).
