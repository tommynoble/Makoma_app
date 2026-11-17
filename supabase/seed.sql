-- Placeholder partners for local development (`supabase db reset` runs this).
-- Replace with real signed partners before launch; names here are fictional.
insert into partners (id, name, area, city) values
  ('osu_juice_bar',   'Partner Juice Bar', 'Osu',        'Accra'),
  ('legon_cafe',      'Partner Café',      'East Legon', 'Accra'),
  ('labone_chopbar',  'Partner Chop Bar',  'Labone',     'Accra')
on conflict do nothing;

insert into partner_offers (id, partner_id, label, emoji, price_pesewas) values
  ('sobolo',    'osu_juice_bar',  'Sobolo',          '🥤', 1000),
  ('smoothie',  'osu_juice_bar',  'Smoothie',        '🍹', 4000),
  ('coffee',    'legon_cafe',     'Coffee',          '☕', 3000),
  ('kelewele',  'labone_chopbar', 'Kelewele',        '🍌', 1500),
  ('jollof_2',  'labone_chopbar', 'Jollof for two',  '🍛', 8000)
on conflict do nothing;
