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

\echo '11. Gift lock after 1 message from one side -> expect unlocked false, 1 message'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000a';
select gift_unlock_status(id) ->> 'unlocked', gift_unlock_status(id) ->> 'messages' from matches;

\echo '12. Five messages from ONE side only -> still locked (expect false)'
insert into messages (match_id, kind, body) select id, 'text', 'hello again' from matches, generate_series(1, 4);
select gift_unlock_status(id) ->> 'unlocked' from matches;

\echo '13. Esi replies (both sides, 6 messages) -> expect true'
set request.jwt.sub = '00000000-0000-0000-0000-00000000000c';
insert into messages (match_id, kind, body) select id, 'text', 'Fine oo, and you?' from matches;
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
