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
