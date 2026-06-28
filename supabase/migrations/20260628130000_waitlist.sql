create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null,
  audience text not null check (audience in ('golfer', 'course')),
  created_at timestamptz not null default now()
);

create unique index waitlist_email_audience_idx on public.waitlist (email, audience);

alter table public.waitlist enable row level security;

-- Only service role can read; inserts are allowed from anon (landing page)
create policy "Allow public inserts" on public.waitlist
  for insert to anon with check (true);
