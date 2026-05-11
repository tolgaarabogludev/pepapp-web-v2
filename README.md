# PepWeb2

PepWeb2; **Next.js (App Router)** üzerinde çalışan, **Payload CMS v3** ile içerik yönetimi sağlayan ve varsayılan olarak **Postgres** kullanan web projesidir.

## Tech Stack

- **Next.js**: `next@^16` (App Router)
- **React**: `react@^19`
- **CMS**: `payload@^3`
- **DB**: `@payloadcms/db-postgres` (zorunlu), migration/legacy için `@payloadcms/db-sqlite`
- **Storage**: `@payloadcms/storage-vercel-blob`
- **i18n**: `next-intl`
- **Analytics**: PostHog

## Proje Yapısı (Özet)

- `src/app/(payload)/...`
  - Payload Admin UI: `src/app/(payload)/admin/[[...segments]]/page.tsx`
  - Payload REST: `src/app/(payload)/api/[...slug]/route.ts`
  - Payload GraphQL: `src/app/(payload)/api/graphql/route.ts`
  - GraphQL Playground: `src/app/(payload)/api/graphql-playground/route.ts`
- `payload.config.ts`: Payload collections, localization, media upload ayarları, Postgres adapter
- `scripts/migration/*.ts`: WordPress/SQLite → Payload/Postgres migration araçları
- `src/app/api/admin/bootstrap-db/route.ts`: DB bağlantısı / Payload runtime health-check benzeri bootstrap endpoint’i
- `src/app/api/public-redirects/route.ts`: `redirects` collection üzerinden public redirect lookup endpoint’i

## Kurulum

```bash
npm install
```

## Environment Variables

> Not: Repo içinde `.env.local` varsa **token/secret** değerlerini dokümana kopyalamayın. Aşağıdaki liste sadece değişken adlarını ve amaçlarını verir.

- **Zorunlu**
  - `DATABASE_URL` *(veya `POSTGRES_URL`)*: Postgres connection string. `payload.config.ts` bu değişken olmadan hata fırlatır.
- **Önerilen**
  - `PAYLOAD_SECRET`: Payload secret (prod’da zorunlu).
  - `BOOTSTRAP_SECRET`: `/api/admin/bootstrap-db` endpoint’i için shared secret.
- **Opsiyonel / Entegrasyon**
  - `BLOB_READ_WRITE_TOKEN`: Vercel Blob (media storage) için.
  - `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`: PostHog entegrasyonu için.

Örnek şablon:

```bash
# .env.local (örnek)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require"
PAYLOAD_SECRET="change-me"
BOOTSTRAP_SECRET="change-me"
BLOB_READ_WRITE_TOKEN="..."
NEXT_PUBLIC_POSTHOG_HOST="https://eu.posthog.com"
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN="..."
```

## Lokal Geliştirme

```bash
npm run dev
```

Uygulama ayağa kalktıktan sonra:

- **Payload Admin**: `http://localhost:3000/admin`
- **Payload REST**: `http://localhost:3000/api/*`
- **Payload GraphQL**: `http://localhost:3000/api/graphql`
- **GraphQL Playground**: `http://localhost:3000/api/graphql-playground`

## Yönetim / Bootstrap Endpoint’leri

### Payload DB Bootstrap Check

`GET /api/admin/bootstrap-db?secret=...`

- `BOOTSTRAP_SECRET` tanımlı değilse `500` döner.
- `secret` yanlışsa `401` döner.
- Doğruysa bazı collection’larda `find(limit: 1)` çalıştırıp özet döner.

Örnek:

```bash
curl "http://localhost:3000/api/admin/bootstrap-db?secret=$BOOTSTRAP_SECRET"
```

### Public Redirect Lookup

`GET /api/public-redirects?source=/eski-path`

- `redirects` collection’ından `source` + `enabled=true` eşleşmesini arar.
- Response `redirect: null` veya `{ source, destination, statusCode, enabled }` döner.

## Payload Collections (Kısa Liste)

`payload.config.ts` içinde tanımlı temel collection’lar:

- `users` (auth)
- `media` (upload: `public/payload/media`, image resize + webp)
- `categories` (localized `title`, unique `slug`)
- `tags` (localized `title`, unique `slug`)
- `posts` (drafts + SEO + relations + localized alanlar)
- `redirects` (public read; `source` → `destination`, 301/302)

## Migration Script’leri

`scripts/migration/*.ts` dosyaları çoğunlukla örnek olarak `npx tsx ...` komutunu kullanıyor.

Bu repo’da script’leri çalıştırmak için `tsx` kullanılır.

Örnekler:

```bash
# Postgres bağlantısını test etmek / Payload runtime bootstrap
DATABASE_URL="postgresql://..." npx tsx scripts/migration/bootstrap-postgres.ts

# SQLite’dan category import (Payload REST ile, login gerekir)
PAYLOAD_EMAIL="you@example.com" PAYLOAD_PASSWORD="..." npx tsx scripts/migration/import-categories-from-sqlite.ts

# payload.db (SQLite) → Neon (Postgres) tam tablo kopyası
# UYARI: Hedef DB doluysa CLEAR_TARGET=1 ile önce TRUNCATE ... CASCADE yapar.
CLEAR_TARGET=1 DATABASE_URL="postgresql://..." npx tsx scripts/migration/copy-sqlite-to-postgres.ts
```

## Build / Prod

```bash
npm run build
npm run start
```

