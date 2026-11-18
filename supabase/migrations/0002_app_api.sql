-- Makoma: read APIs the app needs beyond discover_feed.
--   profile_json(id)   one profile in the app's JSON shape (internal helper)
--   my_profile()       the signed-in user's own profile, to restore it on a new phone
--   likes_received()   people who liked me and are waiting for an answer ("Likes You")
--   my_matches()       my conversations with the other person and the latest message
-- Photo/voice "source" values are storage paths; the app turns them into signed URLs.

create or replace function profile_json(p_id uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', r.id, 'firstName', r.first_name, 'birthDate', r.birth_date, 'gender', r.gender,
    'interestedIn', r.interested_in, 'intent', r.intent, 'occupation', r.occupation,
    'industry', r.industry, 'lifeGoals', r.life_goals, 'church', r.church,
    'headline', r.headline, 'drinks', r.drinks, 'heritage', r.heritage, 'hideExactDistance', r.hide_exact_distance,
    'institutionIds', r.institution_ids, 'neighborhood', r.neighborhood, 'city', r.city,
    'languages', r.languages, 'verification', r.verification, 'visibility', r.visibility,
    'voicePrompt', case when r.voice_intro_path is null then null else jsonb_build_object(
      'promptText', r.voice_prompt_text, 'audioUrl', r.voice_intro_path,
      'durationMs', r.voice_intro_duration_ms, 'transcript', r.voice_transcript) end,
    'createdAt', r.created_at,
    'prompts', coalesce((select jsonb_agg(jsonb_build_object('promptId', pp.prompt_id, 'answer', pp.answer) order by pp.position)
                         from profile_prompts pp where pp.profile_id = r.id), '[]'::jsonb),
    'photos', coalesce((select jsonb_agg(jsonb_build_object('id', ph.id, 'source', ph.storage_path, 'caption', ph.caption, 'position', ph.position) order by ph.position)
                        from photos ph where ph.profile_id = r.id), '[]'::jsonb)
  )
  from profiles r where r.id = p_id;
$$;
-- Internal: only callable from the security-definer functions below, which check visibility.
revoke execute on function profile_json(uuid) from public, anon, authenticated;

create or replace function my_profile() returns jsonb
language sql stable security definer set search_path = public as $$
  select profile_json(auth.uid());
$$;

create or replace function likes_received() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(
    profile_json(l.liker_id) || jsonb_build_object('likesYou', jsonb_build_object(
      'at', l.created_at, 'promptId', l.prompt_id, 'comment', l.comment, 'rose', l.rose,
      'liked', case when l.prompt_id is null then 'photo' else 'prompt' end))
    order by l.rose desc, l.created_at desc), '[]'::jsonb)
  from likes l
  join profiles p on p.id = l.liker_id and p.is_active
  where l.liked_id = auth.uid()
    and not is_blocked_between(auth.uid(), l.liker_id)
    and not exists (select 1 from likes x where x.liker_id = auth.uid() and x.liked_id = l.liker_id)
    and not exists (select 1 from passes s where s.passer_id = auth.uid() and s.passed_id = l.liker_id);
$$;

create or replace function my_matches() returns jsonb
language sql stable security definer set search_path = public as $$
  with mine as (
    select m.id, m.created_at,
      case when m.user_a = auth.uid() then m.user_b else m.user_a end as other,
      (select to_jsonb(x) from (
         select msg.id, msg.sender_id, msg.kind, msg.body, msg.audio_path, msg.duration_ms, msg.created_at, g.offer_id
         from messages msg left join gifts g on g.id = msg.gift_id
         where msg.match_id = m.id order by msg.created_at desc limit 1) x) as last_message
    from matches m
    where auth.uid() in (m.user_a, m.user_b)
      and m.unmatched_at is null
      and not is_blocked_between(m.user_a, m.user_b)
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'createdAt', created_at, 'profile', profile_json(other), 'lastMessage', last_message)
    order by coalesce((last_message->>'created_at')::timestamptz, created_at) desc), '[]'::jsonb)
  from mine;
$$;

grant execute on function my_profile(), likes_received(), my_matches() to authenticated;

-- Let people remove their own photos / voice intro files.
create policy "delete own profile media" on storage.objects for delete to authenticated using (
  bucket_id in ('profile-photos', 'voice-intros') and (storage.foldername(name))[1] = auth.uid()::text
);
