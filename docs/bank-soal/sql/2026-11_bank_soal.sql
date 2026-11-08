-- ============================================================
-- Manabi-Rouge — Bank soal, form, attempt, dan statistik butir
-- Versi skema: 2026-11 (bank soal v1)
-- ============================================================
-- Catatan:
-- 1. Skema ini additive terhadap `supabase/schema.sql` yang sudah ada.
-- 2. Taksonomi disimpan sebagai data, bukan enum, agar N3–N1 cukup
--    menambah baris.
-- 3. Butir, stimulus, dan opsi dipisah agar satu stimulus dapat dipakai
--    banyak butir dan audio tidak diduplikasi.
-- 4. Kunci jawaban TIDAK boleh dikirim ke klien sebelum submit.
--    Gunakan view `public_items` / `public_item_options` dan RPC
--    `submit_attempt` untuk penilaian di server.
-- 5. Jalankan lewat Supabase CLI:
--      supabase db reset   (lokal)
--      supabase db push    (remote)
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ---------- Taksonomi ----------

create table if not exists public.exam_families (
  code text primary key,
  name text not null
);

insert into public.exam_families (code, name) values
  ('jlpt', 'Japanese-Language Proficiency Test'),
  ('jft', 'JFT-Basic')
on conflict (code) do nothing;

create table if not exists public.levels (
  code text primary key,
  exam_family text not null references public.exam_families (code),
  cefr_min text,
  cefr_max text,
  sort_order integer not null
);

insert into public.levels (code, exam_family, cefr_min, cefr_max, sort_order) values
  ('N5', 'jlpt', 'A1', 'A1', 50),
  ('N4', 'jlpt', 'A2', 'A2', 40),
  ('N3', 'jlpt', 'A2', 'B1', 30),
  ('N2', 'jlpt', 'B1', 'B2', 20),
  ('N1', 'jlpt', 'B2', 'C1', 10),
  ('JFT-A1', 'jft', 'A1', 'A1', 53),
  ('JFT-A2.1', 'jft', 'A2', 'A2', 42),
  ('JFT-A2.2', 'jft', 'A2', 'A2', 41)
on conflict (code) do nothing;

create table if not exists public.sections (
  code text primary key,
  exam_family text not null references public.exam_families (code),
  label_jp text not null,
  label_id text not null,
  sort_order integer not null
);

insert into public.sections (code, exam_family, label_jp, label_id, sort_order) values
  ('moji-goi', 'jlpt', '文字・語彙', 'Huruf & kosakata', 10),
  ('bunpou', 'jlpt', '文法', 'Tata bahasa', 20),
  ('dokkai', 'jlpt', '読解', 'Pemahaman bacaan', 30),
  ('choukai', 'jlpt', '聴解', 'Pemahaman mendengarkan', 40),
  ('script-vocab', 'jft', '文字と語彙', 'Huruf & kosakata', 10),
  ('conversation-expression', 'jft', '会話と表現', 'Percakapan & ungkapan', 20),
  ('listening', 'jft', '聴解', 'Pemahaman mendengarkan', 30),
  ('reading', 'jft', '読解', 'Pemahaman bacaan', 40)
on conflict (code) do nothing;

create table if not exists public.item_types (
  code text primary key,
  exam_family text not null references public.exam_families (code),
  section_code text not null references public.sections (code),
  label_jp text not null,
  label_id text not null,
  option_count integer not null check (option_count in (3, 4)),
  levels text[] not null default '{}',
  jft_equiv text[] not null default '{}',
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb
);

insert into public.item_types
  (code, exam_family, section_code, label_jp, label_id, option_count, levels, jft_equiv)
values
  ('MG.KR', 'jlpt', 'moji-goi', '漢字読み', 'Cara baca kanji', 4, '{N5,N4,N3,N2,N1}', '{SV.KR}'),
  ('MG.OR', 'jlpt', 'moji-goi', '表記', 'Penulisan kanji', 4, '{N5,N4,N3,N2}', '{SV.KMU}'),
  ('MG.CD', 'jlpt', 'moji-goi', '文脈規定', 'Kata sesuai konteks', 4, '{N5,N4,N3,N2,N1}', '{SV.WM,SV.WU}'),
  ('MG.PP', 'jlpt', 'moji-goi', '言い換え類義', 'Parafrasa', 4, '{N5,N4,N3,N2,N1}', '{SV.WM}'),
  ('MG.US', 'jlpt', 'moji-goi', '用法', 'Penggunaan kata', 4, '{N4,N3,N2,N1}', '{SV.WU}'),
  ('B.GF', 'jlpt', 'bunpou', '文法形式の判断', 'Pilih bentuk grammar', 4, '{N5,N4,N3,N2,N1}', '{CE.GR}'),
  ('B.SC', 'jlpt', 'bunpou', '文の組み立て', 'Susun kalimat', 4, '{N5,N4,N3,N2,N1}', '{}'),
  ('B.TG', 'jlpt', 'bunpou', '文章の文法', 'Grammar dalam teks', 4, '{N5,N4,N3,N2,N1}', '{CE.GR}'),
  ('R.SH', 'jlpt', 'dokkai', '内容理解（短文）', 'Pemahaman bacaan pendek', 4, '{N5,N4,N3,N2,N1}', '{R.CT}'),
  ('R.MD', 'jlpt', 'dokkai', '内容理解（中文）', 'Pemahaman bacaan menengah', 4, '{N5,N4,N3,N2,N1}', '{R.CT}'),
  ('R.IR', 'jlpt', 'dokkai', '情報検索', 'Pencarian informasi', 4, '{N5,N4,N3,N2,N1}', '{R.IS}'),
  ('L.TB', 'jlpt', 'choukai', '課題理解', 'Pemahaman tugas', 4, '{N5,N4,N3,N2,N1}', '{L.CV,L.SH,L.AN}'),
  ('L.KP', 'jlpt', 'choukai', 'ポイント理解', 'Pemahaman poin', 4, '{N5,N4,N3,N2,N1}', '{L.CV,L.SH,L.AN}'),
  ('L.VE', 'jlpt', 'choukai', '発話表現', 'Ungkapan yang tepat', 3, '{N5,N4,N3}', '{CE.EX}'),
  ('L.QR', 'jlpt', 'choukai', '即時応答', 'Respons cepat', 3, '{N5,N4,N3,N2,N1}', '{CE.EX}'),
  ('SV.WM', 'jft', 'script-vocab', '語の意味', 'Arti kata', 3, '{}', '{}'),
  ('SV.WU', 'jft', 'script-vocab', '語の用法', 'Penggunaan kata', 3, '{}', '{}'),
  ('SV.KR', 'jft', 'script-vocab', '漢字の読み', 'Cara baca kanji', 3, '{}', '{}'),
  ('SV.KMU', 'jft', 'script-vocab', '漢字の意味・用法', 'Makna dan penggunaan kanji', 3, '{}', '{}'),
  ('CE.GR', 'jft', 'conversation-expression', '文法', 'Grammar', 3, '{}', '{}'),
  ('CE.EX', 'jft', 'conversation-expression', '表現', 'Ungkapan', 3, '{}', '{}'),
  ('L.CV', 'jft', 'listening', '会話の内容理解', 'Pemahaman percakapan', 3, '{}', '{}'),
  ('L.SH', 'jft', 'listening', '店・公共施設での内容理解', 'Pemahaman di toko/fasilitas umum', 3, '{}', '{}'),
  ('L.AN', 'jft', 'listening', 'お知らせ・指示の内容理解', 'Pemahaman pengumuman/instruksi', 3, '{}', '{}'),
  ('R.CT', 'jft', 'reading', '内容理解', 'Pemahaman isi', 3, '{}', '{}'),
  ('R.IS', 'jft', 'reading', '情報検索', 'Pencarian informasi', 3, '{}', '{}')
on conflict (code) do nothing;

-- Atom pengetahuan: kosakata, kanji, grammar, fungsi, skenario.
create table if not exists public.knowledge_nodes (
  id text primary key,
  node_type text not null check (node_type in ('vocab', 'kanji', 'grammar', 'function', 'scenario', 'particle')),
  level_code text references public.levels (code),
  label text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- Stimulus ----------

create table if not exists public.stimuli (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  kind text not null check (kind in ('passage', 'dialogue', 'notice', 'email', 'table', 'image', 'announcement', 'utterance')),
  level_code text references public.levels (code),
  title text not null,
  body text,
  segments jsonb,
  translation jsonb,
  script jsonb,
  audio jsonb,
  image jsonb,
  table_data jsonb,
  source jsonb,
  status text not null default 'draft' check (status in ('draft', 'content_review', 'native_review', 'pilot', 'published', 'superseded', 'retired')),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Butir, opsi, tag, versi ----------

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  schema_version text not null default '1.0.0',
  status text not null default 'draft' check (status in ('draft', 'content_review', 'native_review', 'pilot', 'published', 'superseded', 'retired')),
  exam_family text not null references public.exam_families (code),
  level_code text references public.levels (code),
  cefr text,
  section_code text not null references public.sections (code),
  scoring_section_code text not null,
  item_type_code text not null references public.item_types (code),
  instruction jsonb not null,
  stem text not null,
  stem_furigana jsonb,
  blank_index integer check (blank_index is null or blank_index >= 1),
  answer_key jsonb not null,
  explanation jsonb not null,
  difficulty_band smallint not null check (difficulty_band between 1 and 5),
  difficulty_prior numeric,
  difficulty_features jsonb not null default '{}'::jsonb,
  time_estimate_sec integer not null check (time_estimate_sec between 5 and 600),
  media jsonb not null default '{}'::jsonb,
  accessibility jsonb not null default '{}'::jsonb,
  exposure jsonb not null default '{}'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  also_valid_for jsonb not null default '[]'::jsonb,
  version integer not null default 1,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists items_pool_idx
  on public.items (exam_family, level_code, section_code, item_type_code, difficulty_band)
  where status = 'published';

create index if not exists items_provenance_gin_idx
  on public.items using gin (provenance);

create index if not exists item_tags_lookup_idx
  on public.item_tags (tag_type, tag_value);

create table if not exists public.item_options (
  item_id uuid not null references public.items (id) on delete cascade,
  option_key text not null check (option_key in ('a', 'b', 'c', 'd')),
  position integer not null,
  text text not null,
  is_correct boolean not null default false,
  rationale text not null,
  rationale_en text,
  primary key (item_id, option_key)
);

create unique index if not exists item_options_one_correct_idx
  on public.item_options (item_id)
  where is_correct;

create table if not exists public.item_stimuli (
  item_id uuid not null references public.items (id) on delete cascade,
  stimulus_id uuid not null references public.stimuli (id) on delete restrict,
  role text not null default 'primary',
  position integer not null default 1,
  primary key (item_id, stimulus_id)
);

create table if not exists public.item_tags (
  item_id uuid not null references public.items (id) on delete cascade,
  tag_type text not null check (tag_type in ('vocab', 'kanji', 'grammar', 'function', 'scenario', 'particle')),
  tag_value text not null,
  weight real not null default 1,
  primary key (item_id, tag_type, tag_value)
);

create table if not exists public.item_versions (
  item_id uuid not null references public.items (id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  changed_by uuid references auth.users (id),
  changed_at timestamptz not null default now(),
  primary key (item_id, version)
);

-- ---------- Profil skor & form ----------

create table if not exists public.scoring_profiles (
  code text primary key,
  exam_family text not null references public.exam_families (code),
  version integer not null default 1,
  effective_from date not null,
  config jsonb not null,
  active boolean not null default true
);

create table if not exists public.form_blueprints (
  code text primary key,
  exam_family text not null references public.exam_families (code),
  level_code text references public.levels (code),
  version integer not null default 1,
  minutes integer not null check (minutes > 0),
  total_items integer not null check (total_items > 0),
  config jsonb not null,
  active boolean not null default true
);

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  blueprint_code text not null references public.form_blueprints (code),
  exam_family text not null references public.exam_families (code),
  level_code text references public.levels (code),
  scoring_profile_code text not null references public.scoring_profiles (code),
  status text not null default 'draft' check (status in ('draft', 'frozen', 'published', 'retired')),
  minutes integer not null check (minutes > 0),
  total_items integer not null check (total_items > 0),
  config jsonb not null default '{}'::jsonb,
  frozen_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.form_sections (
  form_id uuid not null references public.forms (id) on delete cascade,
  section_key text not null,
  position integer not null,
  minutes integer,
  item_count integer not null check (item_count > 0),
  max_points integer,
  min_pass integer,
  primary key (form_id, section_key)
);

create table if not exists public.form_items (
  form_id uuid not null references public.forms (id) on delete cascade,
  item_id uuid not null references public.items (id) on delete restrict,
  item_version integer not null default 1,
  section_key text not null,
  position integer not null,
  points integer not null default 1 check (points > 0),
  primary key (form_id, item_id),
  unique (form_id, position)
);

create index if not exists form_items_item_idx on public.form_items (item_id);

-- ---------- Attempt & respons ----------

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  form_id uuid not null references public.forms (id),
  mode text not null default 'mock' check (mode in ('practice', 'section', 'mock', 'cbt')),
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'abandoned')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_sec integer,
  raw_scores jsonb not null default '{}'::jsonb,
  scaled_scores jsonb not null default '{}'::jsonb,
  passed boolean,
  ability_estimate numeric,
  ability_se numeric,
  device jsonb not null default '{}'::jsonb
);

create index if not exists attempts_user_idx on public.attempts (user_id, started_at desc);

create table if not exists public.attempt_sections (
  attempt_id uuid not null references public.attempts (id) on delete cascade,
  section_key text not null,
  correct integer not null default 0,
  total integer not null default 0,
  score integer,
  max_points integer,
  passed_section boolean,
  primary key (attempt_id, section_key)
);

create table if not exists public.attempt_items (
  attempt_id uuid not null references public.attempts (id) on delete cascade,
  item_id uuid not null references public.items (id),
  section_key text not null,
  position integer not null default 0,
  selected_key text,
  is_correct boolean,
  response_time_ms integer,
  flagged boolean not null default false,
  confidence smallint check (confidence is null or confidence between 1 and 3),
  answered_at timestamptz,
  primary key (attempt_id, item_id)
);

create index if not exists attempt_items_item_idx on public.attempt_items (item_id);

create table if not exists public.item_statistics (
  id bigserial primary key,
  item_id uuid not null references public.items (id) on delete cascade,
  form_id uuid references public.forms (id) on delete set null,
  n integer not null default 0 check (n >= 0),
  p_value numeric,
  point_biserial numeric,
  a numeric,
  b numeric,
  c numeric,
  infit numeric,
  outfit numeric,
  dif jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists item_statistics_item_idx on public.item_statistics (item_id, updated_at desc);

-- ---------- View publik tanpa kunci jawaban ----------

create or replace view public.public_items as
select
  i.id,
  i.code,
  i.exam_family,
  i.level_code,
  i.cefr,
  i.section_code,
  i.scoring_section_code,
  i.item_type_code,
  i.instruction,
  i.stem,
  i.stem_furigana,
  i.blank_index,
  i.media,
  i.accessibility,
  i.time_estimate_sec,
  coalesce(
    (
      select jsonb_agg(ist.stimulus_id order by ist.position)
      from public.item_stimuli ist
      where ist.item_id = i.id
    ),
    '[]'::jsonb
  ) as stimulus_ids
from public.items i
where i.status = 'published';

create or replace view public.public_item_options as
select
  o.item_id,
  o.option_key,
  o.position,
  o.text
from public.item_options o
join public.items i on i.id = o.item_id
where i.status = 'published';

create or replace view public.public_stimuli as
select
  s.id,
  s.code,
  s.kind,
  s.level_code,
  s.title,
  s.body,
  s.segments,
  s.audio,
  s.image,
  s.table_data
from public.stimuli s
where s.status = 'published';

create or replace view public.public_forms as
select
  f.id,
  f.code,
  f.exam_family,
  f.level_code,
  f.minutes,
  f.total_items,
  (
    select jsonb_agg(
      jsonb_build_object(
        'key', fs.section_key,
        'position', fs.position,
        'items', fs.item_count,
        'minutes', fs.minutes,
        'max_points', fs.max_points,
        'min_pass', fs.min_pass
      )
      order by fs.position
    )
    from public.form_sections fs
    where fs.form_id = f.id
  ) as sections
from public.forms f
where f.status in ('frozen', 'published');

-- ---------- RPC penilaian di server ----------

create or replace function public.start_attempt(p_form_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_form public.forms%rowtype;
  v_attempt_id uuid;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  select * into v_form
  from public.forms
  where code = p_form_code and status in ('frozen', 'published');

  if not found then
    raise exception 'form not found or not available';
  end if;

  insert into public.attempts (user_id, form_id, mode, status)
  values (v_user_id, v_form.id, 'mock', 'in_progress')
  returning id into v_attempt_id;

  insert into public.attempt_items (attempt_id, item_id, section_key, position)
  select v_attempt_id, fi.item_id, fi.section_key, fi.position
  from public.form_items fi
  where fi.form_id = v_form.id
  order by fi.position;

  return v_attempt_id;
end;
$$;

create or replace function public.submit_attempt(p_attempt_id uuid, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt public.attempts%rowtype;
  v_correct integer := 0;
  v_total integer := 0;
begin
  select * into v_attempt
  from public.attempts
  where id = p_attempt_id and user_id = auth.uid();

  if not found then
    raise exception 'attempt not found';
  end if;
  if v_attempt.status <> 'in_progress' then
    raise exception 'attempt already submitted';
  end if;

  update public.attempt_items ai
  set selected_key = p_answers ->> ai.item_id::text,
      is_correct = (
        (p_answers ->> ai.item_id::text) is not null
        and (p_answers ->> ai.item_id::text) = (
          select o.option_key
          from public.item_options o
          where o.item_id = ai.item_id and o.is_correct
          limit 1
        )
      ),
      answered_at = now()
  where ai.attempt_id = p_attempt_id
    and p_answers ? ai.item_id::text;

  insert into public.attempt_sections
    (attempt_id, section_key, correct, total, score, max_points, passed_section)
  select
    ai.attempt_id,
    ai.section_key,
    count(*) filter (where ai.is_correct) as correct,
    count(*) as total,
    case
      when fs.max_points is null then null
      else round(
        (count(*) filter (where ai.is_correct))::numeric
        / nullif(count(*), 0)
        * fs.max_points
      )::integer
    end as score,
    fs.max_points,
    case
      when fs.max_points is null or fs.min_pass is null then null
      else round(
        (count(*) filter (where ai.is_correct))::numeric
        / nullif(count(*), 0)
        * fs.max_points
      ) >= fs.min_pass
    end as passed_section
  from public.attempt_items ai
  join public.form_sections fs
    on fs.form_id = v_attempt.form_id and fs.section_key = ai.section_key
  where ai.attempt_id = p_attempt_id
  group by ai.attempt_id, ai.section_key, fs.max_points, fs.min_pass
  on conflict (attempt_id, section_key) do update
  set correct = excluded.correct,
      total = excluded.total,
      score = excluded.score,
      max_points = excluded.max_points,
      passed_section = excluded.passed_section;

  select
    count(*) filter (where is_correct),
    count(*)
  into v_correct, v_total
  from public.attempt_items
  where attempt_id = p_attempt_id;

  update public.attempts
  set status = 'submitted',
      finished_at = now(),
      duration_sec = extract(epoch from (now() - started_at))::integer,
      raw_scores = jsonb_build_object('correct', v_correct, 'total', v_total)
  where id = p_attempt_id;

  return jsonb_build_object(
    'attempt_id', p_attempt_id,
    'correct', v_correct,
    'total', v_total,
    'sections', (
      select jsonb_agg(to_jsonb(s) order by s.section_key)
      from public.attempt_sections s
      where s.attempt_id = p_attempt_id
    )
  );
end;
$$;

grant execute on function public.start_attempt(text) to authenticated;
grant execute on function public.submit_attempt(uuid, jsonb) to authenticated;

-- ---------- RLS ----------

alter table public.exam_families enable row level security;
alter table public.levels enable row level security;
alter table public.sections enable row level security;
alter table public.item_types enable row level security;
alter table public.knowledge_nodes enable row level security;
alter table public.stimuli enable row level security;
alter table public.items enable row level security;
alter table public.item_options enable row level security;
alter table public.item_stimuli enable row level security;
alter table public.item_tags enable row level security;
alter table public.item_versions enable row level security;
alter table public.scoring_profiles enable row level security;
alter table public.form_blueprints enable row level security;
alter table public.forms enable row level security;
alter table public.form_sections enable row level security;
alter table public.form_items enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_sections enable row level security;
alter table public.attempt_items enable row level security;
alter table public.item_statistics enable row level security;

-- Taksonomi boleh dibaca publik.
create policy "taxonomy: read exam families" on public.exam_families for select using (true);
create policy "taxonomy: read levels" on public.levels for select using (true);
create policy "taxonomy: read sections" on public.sections for select using (true);
create policy "taxonomy: read item types" on public.item_types for select using (true);
create policy "taxonomy: read knowledge" on public.knowledge_nodes for select using (true);
create policy "taxonomy: read scoring profiles" on public.scoring_profiles for select using (true);
create policy "taxonomy: read form blueprints" on public.form_blueprints for select using (true);

-- Konten mentah hanya untuk editor konten/admin.
create policy "content: editor items" on public.items
  for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('content_editor', 'admin'))
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('content_editor', 'admin'));

create policy "content: editor stimuli" on public.stimuli
  for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('content_editor', 'admin'))
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('content_editor', 'admin'));

create policy "content: editor options" on public.item_options
  for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('content_editor', 'admin'))
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('content_editor', 'admin'));

create policy "content: editor item stimuli" on public.item_stimuli
  for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('content_editor', 'admin'))
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('content_editor', 'admin'));

create policy "content: editor tags" on public.item_tags
  for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('content_editor', 'admin'))
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('content_editor', 'admin'));

create policy "content: editor item versions" on public.item_versions
  for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('content_editor', 'admin'))
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('content_editor', 'admin'));

create policy "content: editor knowledge" on public.knowledge_nodes
  for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('content_editor', 'admin'))
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('content_editor', 'admin'));

-- Attempt hanya milik pengguna.
create policy "attempts: own" on public.attempts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "attempt sections: own" on public.attempt_sections
  for all
  using (exists (
    select 1 from public.attempts a
    where a.id = attempt_sections.attempt_id and a.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.attempts a
    where a.id = attempt_sections.attempt_id and a.user_id = auth.uid()
  ));

create policy "attempt items: own" on public.attempt_items
  for all
  using (exists (
    select 1 from public.attempts a
    where a.id = attempt_items.attempt_id and a.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.attempts a
    where a.id = attempt_items.attempt_id and a.user_id = auth.uid()
  ));

-- View publik: hanya kolom aman.
grant select on public.public_items to anon, authenticated;
grant select on public.public_item_options to anon, authenticated;
grant select on public.public_stimuli to anon, authenticated;
grant select on public.public_forms to anon, authenticated;

-- ---------- Trigger updated_at ----------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

drop trigger if exists stimuli_set_updated_at on public.stimuli;
create trigger stimuli_set_updated_at
  before update on public.stimuli
  for each row execute function public.set_updated_at();

-- ============================================================
-- Catatan operasional
-- ============================================================
-- 1. Saat mempublikasikan butir, isi `published_at` dan pastikan
--    `item_options` punya tepat satu kunci.
-- 2. Saat membekukan form, salin `item_version` ke `form_items` agar
--    skor historis dapat direproduksi.
-- 3. `item_statistics` diisi job kalibrasi bulanan; jangan diedit manual.
-- 4. JFT: jangan memakai `scaled_scores` resmi tanpa proses equating.
--    Simpan estimasi internal dan tandai sebagai non-resmi di UI.
-- ============================================================
