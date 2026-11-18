-- Behavioural checks for matching, incognito, chat RLS and privilege rules.
-- Run via ./supabase/tests/run_local.sh (expects a fresh DB with stubs + migrations applied).
\set ON_ERROR_STOP 0
insert into auth.users values ('00000000-0000-0000-0000-00000000000a'),('00000000-0000-0000-0000-00000000000b'),('00000000-0000-0000-0000-00000000000c');
insert into profiles (id, first_name, birth_date, gender, interested_in, intent, city, institution_ids, languages, neighborhood, verification, visibility, incognito_until) values
 ('00000000-0000-0000-0000-00000000000a','Kwame','1995-01-01','man','{woman}','serious','Accra','{knust}','{en,tw}','East Legon','verified','public',null),
 ('00000000-0000-0000-0000-00000000000b','Akosua','1997-01-01','woman','{man}','serious','Accra','{knust,wesley_girls}','{en,tw}','east legon','verified','public',null),
 ('00000000-0000-0000-0000-00000000000c','Esi','1993-01-01','woman','{man}','marriage','Accra','{ug}','{en,ga}',null,'unverified','incognito', now() + interval '1 day');

set role authenticated;

\echo '1. Kwame''s feed hides incognito Esi -> expect ["Akosua"]'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000a';
select jsonb_path_query_array(discover_feed('{serious,marriage}',18,60), '$[*].profile.firstName');

\echo '2. Esi likes Kwame -> expect empty (no match yet)'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000c';
select like_profile('00000000-0000-0000-0000-00000000000a');

\echo '3. Kwame now sees Esi -> expect ["Akosua", "Esi"]'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000a';
select jsonb_path_query_array(discover_feed('{serious,marriage}',18,60), '$[*].profile.firstName');

\echo '4. Kwame likes Esi -> expect t (match created)'
select like_profile('00000000-0000-0000-0000-00000000000c') is not null;

\echo '5. Kwame sends a message -> expect 1'
insert into messages (match_id, kind, body) select id, 'text', 'Good evening, how was your day?' from matches;
select count(*) from messages;

\echo '6. Akosua cannot read that chat -> expect 0'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000b';
select count(*) from messages;

\echo '7. Kwame cannot self-verify -> expect permission denied'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000a';
update profiles set verification = 'verified' where id = auth.uid();

\echo '8. Kwame cannot forge a gift message -> expect RLS violation'
insert into messages (match_id, kind, gift_id) select id, 'gift', gen_random_uuid() from matches;

\echo '9. Incognito without a pass -> expect "incognito requires an active pass"'
select set_visibility('incognito');

\echo '10. After Akosua blocks Kwame, his feed is empty -> expect []'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000b';
insert into blocks (blocked_id) values ('00000000-0000-0000-0000-00000000000a');
set request.jwt.sub = '00000000-0000-0000-0000-00000000000a';
select discover_feed('{serious,marriage}',18,60);

-- ---- Gift lock & partner vouchers ----------------------------------------
reset role;
delete from blocks;
insert into auth.users values ('00000000-0000-0000-0000-0000000000f1');  -- partner staff
insert into partner_staff values ('00000000-0000-0000-0000-0000000000f1', 'legon_cafe');
set role authenticated;

\echo '11. Treat lock: text messages never unlock -> expect false, 0 voice notes'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000a';
insert into messages (match_id, kind, body) select id, 'text', 'hello again' from matches, generate_series(1, 6);
select gift_unlock_status(id) ->> 'unlocked', gift_unlock_status(id) ->> 'voiceNotes' from matches;

\echo '12. Three voice notes from ONE side only -> still locked (expect false)'
insert into messages (match_id, kind, audio_path, duration_ms) select id, 'voice', 'x.m4a', 9000 from matches, generate_series(1, 3);
select gift_unlock_status(id) ->> 'unlocked' from matches;

\echo '13. Esi sends a voice note too (both sides, 4 total) -> expect true'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000c';
insert into messages (match_id, kind, audio_path, duration_ms) select id, 'voice', 'y.m4a', 12000 from matches;
select gift_unlock_status(id) ->> 'unlocked' from matches;

\echo '14. Outsider Akosua gets no unlock status -> expect empty'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000b';
select gift_unlock_status(id) from matches;

\echo '15. Users cannot issue vouchers themselves -> expect permission denied'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000a';
select issue_voucher_for_gift(gen_random_uuid());

\echo '16. Paid gift -> voucher issued + gift message posted (as service role / webhook)'
reset role;
insert into gifts (id, match_id, sender_id, recipient_id, offer_id, amount_pesewas, status, paystack_reference)
  select '00000000-0000-0000-0000-0000000000a1', id, '00000000-0000-0000-0000-00000000000a',
         '00000000-0000-0000-0000-00000000000c', 'coffee', 3000, 'paid', 'gift_test' from matches;
select issue_voucher_for_gift('00000000-0000-0000-0000-0000000000a1') = issue_voucher_for_gift('00000000-0000-0000-0000-0000000000a1') as idempotent;
select code ~ '^MK-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$' as code_format_ok, (select count(*) from messages where kind = 'gift') as gift_msgs from vouchers;
select set_config('test.code', (select code from vouchers), false) is not null as _;
set role authenticated;

\echo '17. Recipient Esi sees the voucher code; sender Kwame does not -> expect 1 then 0'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000c';
select count(*) from vouchers;
set request.jwt.sub = '00000000-0000-0000-0000-00000000000a';
select count(*) from vouchers;

\echo '18. Kwame cannot redeem it -> expect "not valid at this partner"'
select redeem_voucher(current_setting('test.code'));

\echo '19. Café staff redeems -> expect Coffee'
set request.jwt.sub = '00000000-0000-0000-0000-0000000000f1';
select redeem_voucher(lower(current_setting('test.code'))) ->> 'offer';

\echo '20. Second redemption -> expect "already redeemed"'
select redeem_voucher(current_setting('test.code'));

-- ---- App read APIs (0002) ----
\echo '21. Akosua likes Kwame with a note -> Kwame sees her in likes_received: expect ["Akosua"]'
set role authenticated;
set request.jwt.sub = '00000000-0000-0000-0000-00000000000b';
select like_profile('00000000-0000-0000-0000-00000000000a', 'kenkey', 'Kenkey with shito, always.', true);
set request.jwt.sub = '00000000-0000-0000-0000-00000000000a';
select jsonb_path_query_array(likes_received(), '$[*].firstName');
\echo '22. ...with what she liked -> expect "prompt" true'
select likes_received()->0->'likesYou'->>'liked', (likes_received()->0->'likesYou'->>'rose')::boolean;
\echo '23. Kwame''s matches -> expect ["Esi"] with a last message'
select jsonb_path_query_array(my_matches(), '$[*].profile.firstName'), my_matches()->0->'lastMessage'->>'kind';
\echo '24. Akosua cannot see Kwame''s matches -> expect []'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000b';
select my_matches();
\echo '25. my_profile returns your own profile -> expect Akosua'
select my_profile()->>'firstName';
\echo '26. profile_json is not callable directly -> expect permission denied'
select profile_json('00000000-0000-0000-0000-00000000000c');
\echo '27. Kwame likes back -> Akosua leaves his likes_received: expect []'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000a';
select like_profile('00000000-0000-0000-0000-00000000000b') is not null;
select likes_received();

-- ---- Safety & account (0003) ----
\echo '28. Akosua cannot unmatch Kwame and Esi -> expect "not your match"'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000b';
select unmatch((select id from matches where user_b = '00000000-0000-0000-0000-00000000000c' or user_a = '00000000-0000-0000-0000-00000000000c' limit 1));
\echo '29. Esi marks Kwame''s messages read -> expect a positive count'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000c';
select mark_read((select id from matches where '00000000-0000-0000-0000-00000000000c' in (user_a, user_b) limit 1)) > 0;
\echo '30. Kwame unmatches Esi -> his matches no longer include Esi: expect ["Akosua"]'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000a';
select unmatch((select id from matches where '00000000-0000-0000-0000-00000000000c' in (user_a, user_b) limit 1));
select jsonb_path_query_array(my_matches(), '$[*].profile.firstName');
\echo '31. Kwame blocks Akosua -> his matches are empty: expect []'
insert into blocks (blocked_id) values ('00000000-0000-0000-0000-00000000000b');
select my_matches();
\echo '32. Esi deletes her account -> profile gone: expect 0'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000c';
select delete_my_account();
reset role;
select count(*) from profiles where id = '00000000-0000-0000-0000-00000000000c';
