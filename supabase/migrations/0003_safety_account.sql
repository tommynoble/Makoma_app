-- Makoma: safety and account actions.
--   unmatch(match)        either person can end a match; the chat disappears for both
--   mark_read(match)      marks the other person's messages as read (read receipts)
--   delete_my_account()   permanently deletes the signed-in user and their data
-- Blocking and reporting use the blocks / reports tables directly (RLS in 0001).

create or replace function unmatch(p_match uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_match_participant(p_match) then raise exception 'not your match'; end if;
  update matches set unmatched_at = now() where id = p_match and unmatched_at is null;
  -- Clear the likes too, so neither person reappears as "likes you".
  delete from likes l using matches m
  where m.id = p_match and ((l.liker_id = m.user_a and l.liked_id = m.user_b) or (l.liker_id = m.user_b and l.liked_id = m.user_a));
end;
$$;

create or replace function mark_read(p_match uuid) returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not is_match_participant(p_match) then raise exception 'not your match'; end if;
  update messages set read_at = now()
  where match_id = p_match and sender_id <> auth.uid() and read_at is null;
  get diagnostics n = row_count;
  return n;
end;
$$;

-- Account deletion: personal data goes, payment records stay (anonymised) for accounting.
alter table gifts alter column sender_id drop not null, alter column recipient_id drop not null, alter column match_id drop not null;
alter table gifts drop constraint gifts_sender_id_fkey,
  add constraint gifts_sender_id_fkey foreign key (sender_id) references profiles on delete set null;
alter table gifts drop constraint gifts_recipient_id_fkey,
  add constraint gifts_recipient_id_fkey foreign key (recipient_id) references profiles on delete set null;
alter table gifts drop constraint gifts_match_id_fkey,
  add constraint gifts_match_id_fkey foreign key (match_id) references matches on delete set null;
alter table messages drop constraint messages_sender_id_fkey,
  add constraint messages_sender_id_fkey foreign key (sender_id) references profiles on delete cascade;
alter table vouchers drop constraint vouchers_redeemed_by_fkey,
  add constraint vouchers_redeemed_by_fkey foreign key (redeemed_by) references auth.users on delete set null;

-- Deleting the auth user cascades to profiles and everything that references them.
create or replace function delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'not signed in'; end if;
  delete from storage.objects where bucket_id in ('profile-photos', 'voice-intros', 'verification-selfies')
    and (storage.foldername(name))[1] = me::text;
  delete from auth.users where id = me;
end;
$$;

revoke execute on function unmatch(uuid), mark_read(uuid), delete_my_account() from public, anon;
grant execute on function unmatch(uuid), mark_read(uuid), delete_my_account() to authenticated;

-- Realtime: deliver read receipts (UPDATEs) as well as new messages.
alter table messages replica identity full;
