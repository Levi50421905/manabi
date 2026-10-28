-- ============================================================
-- Manabi — skema backend (disiapkan untuk v0.2)
-- ============================================================
-- Catatan: MVP berjalan tanpa backend (localStorage). Skema ini
-- dipakai saat auth + sinkronisasi progres diaktifkan.
--
-- Jalankan lewat Supabase CLI:
--   supabase db reset          (lokal)
--   supabase db push           (remote)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- Profil pengguna ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  daily_goal integer not null default 20,
  target_level text not null default 'N5'
    check (target_level in ('N5', 'N4', 'N3', 'N2', 'N1')),
  created_at timestamptz not null default now()
);

-- ---------- Progres agregat ----------
create table if not exists public.user_progress (
  user_id uuid primary key references auth.users on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  last_study_date date,
  updated_at timestamptz not null default now()
);

-- ---------- Kartu SRS ----------
create table if not exists public.srs_cards (
  user_id uuid not null references auth.users on delete cascade,
  content_id text not null,                       -- contoh: "vocab:n5:gakusei"
  kind text not null check (kind in ('kana', 'vocab', 'kanji', 'grammar')),
  ease real not null default 2.5 check (ease between 1.3 and 2.8),
  interval_days integer not null default 0 check (interval_days >= 0),
  repetitions integer not null default 0 check (repetitions >= 0),
  lapses integer not null default 0 check (lapses >= 0),
  reviews integer not null default 0 check (reviews >= 0),
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  primary key (user_id, content_id)
);

create index if not exists srs_cards_due_idx
  on public.srs_cards (user_id, due_at);

-- ---------- Riwayat quiz ----------
create table if not exists public.quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  label text not null,
  correct integer not null check (correct >= 0),
  total integer not null check (total > 0),
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_user_idx
  on public.quiz_attempts (user_id, created_at desc);

-- ---------- Aktivitas harian (untuk grafik streak) ----------
create table if not exists public.daily_activity (
  user_id uuid not null references auth.users on delete cascade,
  day date not null,
  actions integer not null default 0 check (actions >= 0),
  primary key (user_id, day)
);

-- ============================================================
-- Row Level Security — setiap pengguna hanya melihat datanya sendiri
-- ============================================================

alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.srs_cards enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.daily_activity enable row level security;

create policy "profiles: baca sendiri"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: ubah sendiri"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles: buat sendiri"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "progress: akses sendiri"
  on public.user_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "srs: akses sendiri"
  on public.srs_cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "quiz: akses sendiri"
  on public.quiz_attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "activity: akses sendiri"
  on public.daily_activity for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Trigger: buat profil + progres otomatis saat pengguna baru daftar
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email))
  on conflict (id) do nothing;

  insert into public.user_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
