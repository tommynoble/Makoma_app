-- Makoma initial schema (Supabase / Postgres)
-- Principles: intent-first matching, verification as status, voice-first chat,
-- MoMo gifts, and incognito visibility enforced in the database (not the client).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type intent as enum ('serious', 'marriage', 'friendship_networking');
create type gender as enum ('man', 'woman');
create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected');
create type visibility as enum ('public', 'incognito');
create type message_kind as enum ('text', 'voice', 'gift');
create type gift_status as enum ('pending', 'paid', 'failed', 'refunded');

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 40),
  birth_date date not null check (birth_date <= current_date - interval '18 years'),
  gender gender not null,
  interested_in gender[] not null default '{}',
  intent intent not null,
  occupation text,
  industry text,
  life_goals text check (char_length(life_goals) <= 300),
  church text,
  headline text check (char_length(headline) <= 80),
  drinks text check (drinks in ('never', 'socially', 'regularly')),
  heritage text,
  hide_exact_distance boolean not null default true,
  pledge_accepted_at timestamptz,
  institution_ids text[] not null default '{}',
  neighborhood text,
  city text not null,
  languages text[] not null default '{en}',
  voice_intro_path text,
  voice_intro_duration_ms int check (voice_intro_duration_ms between 0 and 20000),
  voice_prompt_text text,
  voice_transcript text,
  verification verification_status not null default 'unverified',
  visibility visibility not null default 'public',
  incognito_until timestamptz,
  boost_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

create table profile_prompts (
  profile_id uuid references profiles on delete cascade,
  prompt_id text not null,
  answer text not null check (char_length(answer) between 1 and 250),
  position smallint not null,
  primary key (profile_id, prompt_id)
);

create table photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles on delete cascade,
  storage_path text not null,
  caption text check (char_length(caption) <= 80),
  position smallint not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Likes, passes, matches, blocks
-- ---------------------------------------------------------------------------
create table likes (
  liker_id uuid references profiles on delete cascade,
  liked_id uuid references profiles on delete cascade,
  prompt_id text,          -- like a specific prompt ("comment on their kenkey answer")
  comment text check (char_length(comment) <= 250),
  voice_reply_path text,   -- optional 20s voice reply attached to the like
  rose boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (liker_id, liked_id),
  check (liker_id <> liked_id)
);

create table passes (
  passer_id uuid references profiles on delete cascade,
  passed_id uuid references profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (passer_id, passed_id)
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references profiles on delete cascade,
  user_b uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  unmatched_at timestamptz,
  unique (user_a, user_b),
  check (user_a < user_b)
);

create table blocks (
  blocker_id uuid references profiles on delete cascade default auth.uid(),
  blocked_id uuid references profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles on delete cascade default auth.uid(),
  reported_id uuid not null references profiles on delete cascade,
  reason text not null, -- 'scam', 'fake_profile', 'harassment', 'asking_for_money', 'underage', 'other'
  details text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Partner treats (gifts are vouchers redeemable at partner spots, never cash)
-- ---------------------------------------------------------------------------
-- Why vouchers: moving cash from one user's MoMo wallet to another's would make
-- Makoma a P2P payment/remittance provider under Bank of Ghana rules. Instead
-- the sender buys a treat from Makoma (an ordinary merchant sale) and the
-- recipient gets a voucher code/QR redeemable at a partner. Partners are
-- settled off-platform.
create table partners (
  id text primary key,
  name text not null,
  area text not null,   -- e.g. 'Osu', 'East Legon'
  city text not null,
  is_active boolean not null default true
);

create table partner_offers (
  id text primary key,
  partner_id text not null references partners,
  label text not null,  -- 'Sobolo', 'Coffee', 'Jollof for two'
  emoji text not null,
  price_pesewas int not null check (price_pesewas > 0),
  is_active boolean not null default true
);

-- Partner staff accounts that can redeem vouchers at the counter.
create table partner_staff (
  user_id uuid references auth.users on delete cascade,
  partner_id text references partners on delete cascade,
  primary key (user_id, partner_id)
);

-- ---------------------------------------------------------------------------
-- Messages and gifts
-- ---------------------------------------------------------------------------
create table gifts (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches on delete cascade,
  sender_id uuid not null references profiles,
  recipient_id uuid not null references profiles,
  offer_id text not null references partner_offers,
  amount_pesewas int not null check (amount_pesewas > 0),
  note text check (char_length(note) <= 140),
  status gift_status not null default 'pending',
  paystack_reference text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches on delete cascade,
  sender_id uuid not null references profiles default auth.uid(),
  kind message_kind not null,
  body text check (char_length(body) <= 2000),
  audio_path text,
  duration_ms int check (duration_ms between 0 and 60000),
  gift_id uuid references gifts,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (
    (kind = 'text'  and body is not null) or
    (kind = 'voice' and audio_path is not null and duration_ms is not null) or
    (kind = 'gift'  and gift_id is not null)
  )
);
create index messages_match_idx on messages (match_id, created_at);

create type voucher_status as enum ('issued', 'redeemed', 'expired');

create table vouchers (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null unique references gifts on delete cascade,
  recipient_id uuid not null references profiles on delete cascade,
  offer_id text not null references partner_offers,
  code text not null unique,  -- e.g. MK-7KQ2-XP4D, also rendered as a QR
  status voucher_status not null default 'issued',
  expires_at timestamptz not null default now() + interval '30 days',
  redeemed_at timestamptz,
  redeemed_by uuid references auth.users,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Verification and sachet purchases
-- ---------------------------------------------------------------------------
create table verification_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles on delete cascade default auth.uid(),
  selfie_path text not null,
  pose text not null,
  status verification_status not null default 'pending',
  reviewed_by uuid,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table sachet_purchases (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles on delete cascade,
  plan_id text not null,
  amount_pesewas int not null,
  paystack_reference text unique,
  status gift_status not null default 'pending',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function is_blocked_between(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;

create or replace function is_match_participant(m uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from matches
    where id = m and unmatched_at is null and auth.uid() in (user_a, user_b)
  );
$$;

-- Can `viewer` see `target` at all? Encodes incognito: an incognito profile is
-- visible only to people the target has already liked.
create or replace function can_view_profile(viewer uuid, target uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select viewer = target or (
    not is_blocked_between(viewer, target)
    and exists (
      select 1 from profiles p
      where p.id = target and p.is_active
        and (
          p.visibility = 'public'
          or (p.incognito_until is not null and p.incognito_until < now()) -- pass expired
          or exists (select 1 from likes l where l.liker_id = target and l.liked_id = viewer)
          or exists (select 1 from matches m
                     where m.unmatched_at is null
                       and ((m.user_a = viewer and m.user_b = target) or (m.user_a = target and m.user_b = viewer)))
        )
    )
  );
$$;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table profile_prompts enable row level security;
alter table photos enable row level security;
alter table likes enable row level security;
alter table passes enable row level security;
alter table matches enable row level security;
alter table blocks enable row level security;
alter table reports enable row level security;
alter table gifts enable row level security;
alter table messages enable row level security;
alter table verification_requests enable row level security;
alter table sachet_purchases enable row level security;
alter table partners enable row level security;
alter table partner_offers enable row level security;
alter table partner_staff enable row level security;
alter table vouchers enable row level security;

create policy "browse active partners" on partners for select to authenticated using (is_active);
create policy "browse active offers" on partner_offers for select to authenticated using (is_active);
create policy "staff see own memberships" on partner_staff for select using (user_id = auth.uid());
-- Only the recipient ever sees a voucher code. Senders see the gift, not the code.
create policy "recipient reads own vouchers" on vouchers for select using (recipient_id = auth.uid());

create policy "view visible profiles" on profiles for select using (can_view_profile(auth.uid(), id));
create policy "insert own profile" on profiles for insert with check (id = auth.uid());
create policy "update own profile" on profiles for update using (id = auth.uid())
  with check (id = auth.uid());
-- Users must not set their own verification or paid visibility directly:
-- allowlist the columns they may update (column revokes don't override a table grant).
revoke update on profiles from authenticated;
grant update (first_name, interested_in, intent, occupation, industry, life_goals, church, headline, drinks,
              heritage, hide_exact_distance, pledge_accepted_at,
              institution_ids, neighborhood, city, languages, voice_intro_path,
              voice_intro_duration_ms, voice_prompt_text, voice_transcript, is_active, last_active_at) on profiles to authenticated;

create policy "view prompts of visible profiles" on profile_prompts for select using (can_view_profile(auth.uid(), profile_id));
create policy "manage own prompts" on profile_prompts for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "view photos of visible profiles" on photos for select using (can_view_profile(auth.uid(), profile_id));
create policy "manage own photos" on photos for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Likes/passes go through RPCs; users can only read likes they sent.
create policy "read own likes" on likes for select using (liker_id = auth.uid());
create policy "read own passes" on passes for select using (passer_id = auth.uid());

create policy "read own matches" on matches for select using (auth.uid() in (user_a, user_b));

create policy "manage own blocks" on blocks for all using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());
create policy "file reports" on reports for insert with check (reporter_id = auth.uid());

create policy "read own gifts" on gifts for select using (auth.uid() in (sender_id, recipient_id));
-- Gifts are created and updated only by edge functions (service role).

create policy "read match messages" on messages for select using (is_match_participant(match_id));
create policy "send text/voice" on messages for insert with check (
  sender_id = auth.uid() and kind in ('text', 'voice') and is_match_participant(match_id)
);

create policy "submit verification" on verification_requests for insert with check (profile_id = auth.uid());
create policy "read own verification" on verification_requests for select using (profile_id = auth.uid());

create policy "read own purchases" on sachet_purchases for select using (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

-- Like someone. Returns the match id if it's mutual, else null.
create or replace function like_profile(p_target uuid, p_prompt_id text default null, p_comment text default null, p_rose boolean default false)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  m_id uuid;
begin
  if me is null then raise exception 'not signed in'; end if;
  if is_blocked_between(me, p_target) then raise exception 'unavailable'; end if;

  insert into likes (liker_id, liked_id, prompt_id, comment, rose)
  values (me, p_target, p_prompt_id, p_comment, p_rose)
  on conflict do nothing;

  if exists (select 1 from likes where liker_id = p_target and liked_id = me) then
    insert into matches (user_a, user_b)
    values (least(me, p_target), greatest(me, p_target))
    on conflict (user_a, user_b) do update set unmatched_at = null
    returning id into m_id;
  end if;
  return m_id;
end;
$$;

create or replace function pass_profile(p_target uuid) returns void
language sql security definer set search_path = public as $$
  insert into passes (passer_id, passed_id) values (auth.uid(), p_target) on conflict do nothing;
$$;

-- Discover feed: filters by intent etc., hides incognito/blocked/seen profiles,
-- and ranks by shared ground (schools, languages, area, church, intent) and verification.
create or replace function discover_feed(
  p_intents intent[],
  p_min_age int,
  p_max_age int,
  p_verified_only boolean default false,
  p_languages text[] default '{}',
  p_institution_ids text[] default '{}',
  p_city text default null,
  p_limit int default 20
) returns jsonb language sql stable security definer set search_path = public as $$
  with me as (select * from profiles where id = auth.uid()),
  candidates as (
    select p.*,
      (select array(select unnest(p.institution_ids) intersect select unnest(me.institution_ids))) as shared_inst,
      (select array(select unnest(p.languages) intersect select unnest(me.languages) except select 'en')) as shared_lang,
      (p.neighborhood is not null and lower(p.neighborhood) = lower(me.neighborhood)) as same_hood,
      (p.church is not null and lower(p.church) = lower(me.church)) as same_church,
      (p.intent = me.intent) as same_intent
    from profiles p, me
    where p.id <> me.id
      and can_view_profile(me.id, p.id)
      and p.intent = any (p_intents)
      and p.gender = any (me.interested_in)
      and me.gender = any (p.interested_in)
      and date_part('year', age(p.birth_date)) between p_min_age and p_max_age
      and (not p_verified_only or p.verification = 'verified')
      and (cardinality(p_languages) = 0 or p.languages && p_languages)
      and (cardinality(p_institution_ids) = 0 or p.institution_ids && p_institution_ids)
      and (p_city is null or p.city = p_city)
      and not exists (select 1 from likes l where l.liker_id = me.id and l.liked_id = p.id)
      and not exists (select 1 from passes s where s.passer_id = me.id and s.passed_id = p.id)
  ),
  ranked as (
    select c.*,
      cardinality(shared_inst) * 3 + cardinality(shared_lang) * 2
        + case when same_hood then 2 else 0 end
        + case when same_church then 3 else 0 end
        + case when same_intent then 4 else 0 end
        + case when verification = 'verified' then 5 else 0 end
        + case when boost_until > now() then 10 else 0 end as score
    from candidates c
    order by score desc, last_active_at desc
    limit p_limit
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'profile', jsonb_build_object(
      'id', r.id, 'firstName', r.first_name, 'birthDate', r.birth_date, 'gender', r.gender,
      'interestedIn', r.interested_in, 'intent', r.intent, 'occupation', r.occupation,
      'industry', r.industry, 'lifeGoals', r.life_goals, 'church', r.church,
      'headline', r.headline, 'drinks', r.drinks, 'heritage', r.heritage, 'hideExactDistance', r.hide_exact_distance,
      'institutionIds', r.institution_ids, 'neighborhood', r.neighborhood, 'city', r.city,
      'languages', r.languages, 'verification', r.verification, 'visibility', r.visibility,
      'voicePrompt', case when r.voice_intro_path is null then null else jsonb_build_object('promptText', r.voice_prompt_text, 'audioUrl', r.voice_intro_path, 'durationMs', r.voice_intro_duration_ms, 'transcript', r.voice_transcript) end, 'createdAt', r.created_at,
      'prompts', coalesce((select jsonb_agg(jsonb_build_object('promptId', pp.prompt_id, 'answer', pp.answer) order by pp.position)
                           from profile_prompts pp where pp.profile_id = r.id), '[]'::jsonb),
      'photos', coalesce((select jsonb_agg(jsonb_build_object('id', ph.id, 'source', ph.storage_path, 'caption', ph.caption, 'position', ph.position) order by ph.position)
                          from photos ph where ph.profile_id = r.id), '[]'::jsonb)
    ),
    'shared', jsonb_build_object(
      'institutions', to_jsonb(r.shared_inst), 'languages', to_jsonb(r.shared_lang),
      'sameNeighborhood', r.same_hood, 'sameChurch', r.same_church, 'sameIntent', r.same_intent
    )
  ) order by r.score desc), '[]'::jsonb)
  from ranked r;
$$;

-- Treat lock (anti-scam). Treats unlock once 3 voice notes have been exchanged,
-- with BOTH people having sent at least one. Voice is hard to fake at scale.
-- Mirrored in src/features/gifts/unlock.ts for the progress UI; this is the source of truth.
-- There is deliberately no way to *request* a gift anywhere in the product.
create or replace function gift_unlock_status(p_match uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  with s as (
    select count(*) as voice, count(distinct sender_id) as senders
    from messages where match_id = p_match and kind = 'voice'
  )
  select case when is_match_participant(p_match) then jsonb_build_object(
    'voiceNotes', s.voice,
    'voiceNotesRequired', 3,
    'bothSent', s.senders >= 2,
    'unlocked', s.voice >= 3 and s.senders >= 2
  ) end
  from s;
$$;

-- Issue the voucher for a paid gift and post the gift message into the chat.
-- Called only by the Paystack webhook (service role). Idempotent per gift.
create or replace function issue_voucher_for_gift(p_gift uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  g gifts%rowtype;
  v_id uuid;
  v_code text;
begin
  select * into g from gifts where id = p_gift and status = 'paid';
  if not found then raise exception 'gift not paid'; end if;

  select id into v_id from vouchers where gift_id = p_gift;
  if v_id is not null then return v_id; end if;

  loop
    -- 8 chars from a 32-char alphabet without look-alikes (no 0/O, 1/I); 256 % 32 = 0 so unbiased.
    select 'MK-' || substr(c, 1, 4) || '-' || substr(c, 5, 4) into v_code from (
      select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', get_byte(b, i) % 32 + 1, 1), '' order by i) as c
      from (select gen_random_bytes(8) as b) r, generate_series(0, 7) i
    ) x;
    exit when not exists (select 1 from vouchers where code = v_code);
  end loop;

  insert into vouchers (gift_id, recipient_id, offer_id, code)
  values (g.id, g.recipient_id, g.offer_id, v_code)
  returning id into v_id;

  insert into messages (match_id, sender_id, kind, gift_id)
  values (g.match_id, g.sender_id, 'gift', g.id);

  return v_id;
end;
$$;
revoke execute on function issue_voucher_for_gift(uuid) from public, anon, authenticated;

-- Partner staff redeem a voucher at the counter by scanning the QR or typing the code.
create or replace function redeem_voucher(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v vouchers%rowtype;
  o partner_offers%rowtype;
begin
  select * into v from vouchers where code = upper(trim(p_code)) for update;
  if not found then raise exception 'voucher not found'; end if;
  select * into o from partner_offers where id = v.offer_id;
  if not exists (select 1 from partner_staff where user_id = auth.uid() and partner_id = o.partner_id) then
    raise exception 'voucher not valid at this partner';
  end if;
  if v.status = 'redeemed' then raise exception 'voucher already redeemed'; end if;
  if v.status = 'expired' or v.expires_at < now() then
    update vouchers set status = 'expired' where id = v.id;
    raise exception 'voucher expired';
  end if;

  update vouchers set status = 'redeemed', redeemed_at = now(), redeemed_by = auth.uid() where id = v.id;
  return jsonb_build_object('offer', o.label, 'emoji', o.emoji, 'redeemedAt', now());
end;
$$;

-- Visibility: 'public' always allowed; 'incognito' requires an active sachet pass.
create or replace function set_visibility(p_visibility visibility) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_visibility = 'incognito' and not exists (
    select 1 from sachet_purchases
    where profile_id = auth.uid() and status = 'paid' and plan_id like 'incognito%' and ends_at > now()
  ) then
    raise exception 'incognito requires an active pass';
  end if;
  update profiles set visibility = p_visibility where id = auth.uid();
end;
$$;

-- ---------------------------------------------------------------------------
-- Storage buckets (private; served via signed URLs)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values
  ('profile-photos', 'profile-photos', false),
  ('voice-intros', 'voice-intros', false),
  ('voice-notes', 'voice-notes', false),
  ('verification-selfies', 'verification-selfies', false)
on conflict do nothing;

-- voice-notes path: {match_id}/{sender_id}/{timestamp}.m4a
create policy "upload own voice notes" on storage.objects for insert to authenticated with check (
  bucket_id = 'voice-notes'
  and (storage.foldername(name))[2] = auth.uid()::text
  and is_match_participant(((storage.foldername(name))[1])::uuid)
);
create policy "read match voice notes" on storage.objects for select to authenticated using (
  bucket_id = 'voice-notes' and is_match_participant(((storage.foldername(name))[1])::uuid)
);

-- verification-selfies path: {user_id}/{timestamp}.jpg (readable only by moderators via service role)
create policy "upload own selfie" on storage.objects for insert to authenticated with check (
  bucket_id = 'verification-selfies' and (storage.foldername(name))[1] = auth.uid()::text
);

-- profile-photos & voice-intros path: {user_id}/{file}
create policy "upload own profile media" on storage.objects for insert to authenticated with check (
  bucket_id in ('profile-photos', 'voice-intros') and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "read visible profile media" on storage.objects for select to authenticated using (
  bucket_id in ('profile-photos', 'voice-intros')
  and can_view_profile(auth.uid(), ((storage.foldername(name))[1])::uuid)
);

-- Realtime for chat
alter publication supabase_realtime add table messages;
