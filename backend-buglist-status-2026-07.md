# Backend Buglist — Bajarilgan ishlar hisoboti

> **Sana:** 2026-07-02 · **Branch:** `fix/dashboard-buglist-260630` (off `main`)
> **Manba buglist:** frontend backend-issues (2026-06-30)
> **Migrationlar:** 076 (file media_type backfill), 077 (event timezone)
>
> Belgilar: ✅ tuzatildi · ⚙️ ops · 📄 docs · 🆕 feature · ⏳ deferred (mobile-coord)

---

## TL;DR

**Buglistdagi barcha haqiqiy backend BUG'lar tuzatildi.** Qolgan itemlar tuzatilmagan bug emas —
ular ops (A3), yangi feature (E2/E3/E4-guest), docs (C2), yoki mobile bilan kelishiladigan enhancement
(A4-L3). **B1 esa backend tomonda allaqachon hal qilingan** — frontend integratsiya masalasi.

---

## To'liq holat jadvali

| # | Item | Holat | Izoh |
|---|------|-------|------|
| **A1** | `mediaType` har doim null | ✅ | Gallery projection'ga `media_type` qo'shildi + `buildGalleryItem`'da set; **migration 076** eski NULL qatorlarni fayl kengaytmasidan backfill qiladi |
| **A2** | uploader ism/avatar null | ✅ | Cursor gallery uploader'larni batch-resolve qiladi (N+1 yo'q) → `uploaderFirstName/LastName/AvatarUrl` to'ladi |
| **A3** | ko'p fayl FAILED/PENDING | ⚙️ **OPS** | Bu **variant-generation pipeline** muammosi (kod bug emas). Prod'da re-enqueue + worker diagnostikasi kerak |
| **A4** | timestamp'da timezone yo'q | ✅ (qisman) | **Layer 1:** UTC pin + millisekund (3-xona) normalizatsiya (nano 6–9 xona endi yo'q). **Layer 2:** event'ga `timezone` (IANA) maydoni. **Layer 3** (`Z`/offset qo'shish) — mobile bilan kelishilgan release'ga qoldirildi (⏳) |
| **A5** | audio uchun buzuq thumbnailUrl (204) | ✅ | `hasVisualDerivative()` — AUDIO/no-preview media endi `thumbnailUrl=null` (204 beruvchi URL emas) |
| **B1** | variant URL `<img>` orqali auth qilinmaydi | ✅ **backend'da hal** | Presigned `/url` sibling'lar mavjud (pastda "Frontend action" bo'limiga qarang) |
| **C1** | register token qaytarmaydi | ✅ | `register` endi `accessToken`+`refreshToken` qaytaradi (verification gate buzilmagan, additive) |
| **C2** | OTP TTL/resend/token muddati (docs) | 📄 **DOCS** | Hujjatlash ishi (qiymatlar kod'da bor — so'rasangiz chiqaramiz) |
| **D1** | swagger `securitySchemes` yo'q | ✅ | `bearerAuth` (http/bearer/JWT) + global security; public yo'llar `security:[]`; stray `oauth2` ref tuzatildi |
| **D2** | swagger variant misoli noto'g'ri prefiks | ✅ | event-photo `thumbnailUrl` misoli capsule→event yo'liga moslandi |
| **E1** | org-scoping nomuvofiq (path vs header) | ✅ **BREAKING** | `GET /api/org/events` → **`GET /api/org/{orgId}/events`** (path). `X-Org-Id` header olib tashlandi |
| **E2** | ticketing backend yo'q | 🆕 **FEATURE** | Yangi ish (buglist doirasidan tashqari) |
| **E3** | org-darajasidagi galereya yo'q | 🆕 **FEATURE** | `GET /api/org/{orgId}/photos` — yangi endpoint |
| **E4** | speaker faqat userId | ✅ (qisman) | Ism/avatar qo'shildi (E6). **Guest speaker** (akkauntsiz tashqi spiker) = 🆕 feature |
| **E5** | LocalDateTime tz semantika noaniq | ✅ | Event `timezone` maydoni + siyosat: naive vaqt = event mahalliy wall-clock, audit vaqt (dateCreated) = UTC |
| **E6** | userId-only referenslar (ism/avatar yo'q) | ✅ | **3 surface**: org members, org photographers, agenda speakers — hammasi `firstName/lastName/avatarUrl` bilan boyitildi |

---

## Frontend uchun ACTION kerak (contract o'zgarishlari)

### 🔴 E1 — BREAKING (deploy bilan sinxron)
- **Eski:** `GET /api/org/events` + `X-Org-Id` header
- **Yangi:** `GET /api/org/{orgId}/events` (orgId path'da, majburiy)
- Shaxsiy listing (avval: header'siz) → `GET /api/event/list?filter=mine`da qoladi

### 🟠 B1 — variant'ni `<img>`da ko'rsatish
`<img src="/api/event/{eventId}/file/{fileId}/variant/THUMBNAIL">` **ishlamaydi** (Bearer kerak, `<img>` yubora olmaydi). To'g'ri usul:
1. `GET /api/event/{eventId}/file/{fileId}/variant/{size}/url` — Bearer bilan fetch qiling
2. Javob: `MediaUrlResponseContract { url, expiresAt }` (presigned, auth kerak emas; no-preview = 204)
3. Qaytgan `url`ni `<img src>`ga qo'ying

Capsule uchun ham: `GET /api/capsule/file/{fileId}/variant/{size}/url`. (302 endpoint'lar server-to-server ishlaydi; `<img>` uchun `/url` sibling'ni ishlating.)

### 🟡 A4 — timestamp format
- Fraksiya endi **3-xonali millis** (`...898` — avvalgi `...898321` emas). Parserlaringiz hozir ham ishlaydi.
- Event javobida yangi **`timezone`** (IANA, masalan `Asia/Tashkent`) maydoni — event start/end vaqtini shu zonada render qiling. `Z`/offset **hali qo'shilmagan** (keyingi release).

### 🟢 Additive (breaking emas — yangi maydonlar)
- **Gallery** (`GET /api/event/{id}/photos`): `mediaType`, `uploaderFirstName/LastName/AvatarUrl`, audio uchun `thumbnailUrl=null`
- **Register** (`POST /api/auth/register`): `accessToken` + `refreshToken` (endi login round-trip shart emas)
- **Org members / photographers / agenda speakers**: `firstName/lastName/avatarUrl`
- **Event create/update**: ixtiyoriy `timezone` maydoni (yaroqsiz IANA → 400)
- **Swagger UI**: "Authorize" tugmasi endi ishlaydi (bearer JWT)

---

## Backend jamoasi / deploy eslatmalari

- **Migrationlar 076 + 077** — additive/online/idempotent, lekin Docker o'chiq bo'lgani uchun jonli
  boot tekshirilmagan. Deploy'dan oldin `MigrationSmokeIntegrationTest` + prod `ddl-validate` boot.
- **A3 (variant pipeline)** — foydalanuvchilarga hozir ta'sir qilyapti (preview yo'q). Prod'da
  media_job re-enqueue + worker holatini tekshirish alohida ish.
- **Test debt (bloklamaydi):** `main` test moduli avvaldan ~20 ta compile xato bilan (Minio/Capsule/
  EventPhoto konstruktor drift) — bu batch fayllariga aloqasi yo'q; CI'da test stage yo'q, shuning
  uchun pipeline'ni bloklamaydi. Alohida ticket.

---

## Commit'lar (traceability)

| Commit | Item |
|--------|------|
| `0b773b86` | D1 swagger bearerAuth |
| `e58f6856` | A1/A2/A5 gallery (+ migration 076) |
| `024d390d` | C1 register tokens |
| `5af91851` | D2 swagger misol |
| `cd2cc041` | A4 layer 1 (UTC + millis) |
| `106eb3ef` | A4 layer 2 / E5 (event timezone + migration 077) |
| `08f1a5ca` | E6 org members |
| `6e90b6d2` | E1 org-scoping (breaking) |
| `81c9b626` | E6-rest (photographer + agenda speaker) |
