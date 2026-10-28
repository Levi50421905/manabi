# Supabase (opsional)

MVP Manabi **tidak** memerlukan Supabase. Semua progres disimpan di
`localStorage` browser lewat `apps/web/lib/store.ts`.

Aktifkan Supabase saat ingin:

- progres tersinkron antardevice,
- login (Google/email),
- leaderboard dan fitur sosial.

## Langkah

```bash
# 1. Install Supabase CLI (sekali saja)
pnpm add -g supabase

# 2. Login & inisialisasi
supabase login
supabase init

# 3. Jalankan Postgres lokal
supabase start

# 4. Terapkan skema
supabase db reset        # membaca supabase/schema.sql otomatis
```

Lalu isi `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key dari `supabase status`>
```

## Titik integrasi di kode

| Kebutuhan | File |
|---|---|
| Baca/tulis progres | `apps/web/lib/store.ts` → ganti `read()` & `persist()` |
| Riwayat quiz | `apps/web/lib/store.ts` → `recordQuiz()` |
| Jadwal SRS | kolom tabel `srs_cards` (identik dengan tipe `SrsCard`) |

Karena bentuk data di `srs_cards` sengaja dibuat sama dengan tipe `SrsCard`
di `@manabi/srs`, migrasi cukup memetakan nama kolom
(`interval_days` ↔ `interval`, `due_at` ↔ `due`).
