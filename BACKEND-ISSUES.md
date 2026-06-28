# Memolink — Backend Issues & Observations

Frontend (dashboard) integratsiyasi davomida topilgan backend / kontrakt / swagger
muammolari. Har bir yozuv: **Endpoint → Observed → Expected → Impact → Fix**.

> Sana: 2026-06-28 · Manba: `swagger.json` (v4.1) + `http://api.memolink.io` real javoblari
> Belgilar: 🔴 blocker · 🟠 major · 🟡 minor · 🔵 docs/nice-to-have

---

## A. Media / Photos kontrakti (real `/api/event/{id}/photos` javobidan)

### A1. 🟠 `mediaType` har doim `null`
- **Endpoint:** `GET /api/event/{eventId}/photos`
- **Observed:** Barcha itemlarda `"mediaType": null` (jumladan `.jpg`, `.png`, `.m4a` fayllar).
- **Expected:** Swagger enum: `IMAGE | GIF | VIDEO | AUDIO | PDF | LIVE_PHOTO`.
- **Impact:** Klient fayl turini ajrata olmaydi → audio/video fayllar rasm sifatida
  ko'rsatiladi. Hozir frontend fayl kengaytmasidan (`.m4a` → audio) heuristika bilan
  chaqiryapti, lekin bu ishonchsiz (kengaytmasiz/noma'lum fayllar uchun xato).
- **Fix:** Yuklashda media turini aniqlab (`Content-Type`/probe) saqlash; eski ("legacy")
  qatorlar uchun migratsiya bilan to'ldirish.

### A2. 🟠 Uploader ma'lumotlari `null`
- **Endpoint:** `GET /api/event/{eventId}/photos`
- **Observed:** `uploaderFirstName`, `uploaderLastName`, `uploaderAvatarUrl` — barchasi `null`
  (faqat `uploadedByUserId` keladi).
- **Expected:** Swaggerda bu maydonlar uchun ism/avatar (`John`, `Doe`, avatar URL) bor.
- **Impact:** Galereya va curation/"My Uploads" da kim yuklagani ko'rinmaydi — frontend
  noiloj raw UUID (`uploadedByUserId`) ko'rsatishga tushib qoladi.
- **Fix:** Photos query'da uploader `users` jadvaliga join qilib ism/avatarni qaytarish.

### A3. 🟠 Ko'p faylda `processingStatus: "FAILED"`
- **Endpoint:** `GET /api/event/{eventId}/photos`
- **Observed:** Real eventda 12 fayldan ~8 tasi `FAILED`, qolganlari `PENDING`; bironta
  ham `READY` yo'q.
- **Expected:** Yuklangan rasmlar uchun variant (THUMBNAIL/SMALL/...) generatsiyasi `READY`.
- **Impact:** Variant'lar yaratilmagan → THUMBNAIL endpoint original yoki 204 qaytaradi;
  galereya sekin yuklanadi yoki preview yo'q.
- **Fix:** Variant-generation pipeline'ni tekshirish (nega FAILED — format? hajm? worker?);
  FAILED'lar uchun retry mexanizmi.

### A4. 🟡 Timestamp'larda timezone yo'q
- **Endpoint:** Barcha javoblar (`dateCreated`, top-level `timestamp`).
- **Observed:** `"2026-06-20T05:19:48.898321"` va `"2026-06-28T08:39:10.759591808"` —
  `Z` yoki offset yo'q; fraksiya 6–9 xonali.
- **Expected:** Swagger misoli `"2025-06-10T19:00:00Z"` (offset bilan).
- **Impact:** Instant noaniq — klient uni local time deb o'qib, Asia/Tashkent vs UTC
  farqida soatlarni xato ko'rsatishi mumkin. 9-xonali nanosekund ham nostandart.
- **Fix:** ISO-8601 ni offset/`Z` bilan, millisekund (3 xona) aniqligida qaytarish.

### A5. 🟡 Audio uchun ishlamaydigan `thumbnailUrl`
- **Endpoint:** `GET /api/event/{eventId}/photos`
- **Observed:** Audio (`.m4a`) item ham `thumbnailUrl` (variant endpoint) qaytaradi, lekin
  u 204 (`No image preview`) beradi.
- **Expected:** Rasm preview'i yo'q media uchun `thumbnailUrl: null`.
- **Impact:** Buzuq rasm/bo'sh tile (frontend hozir audio'da thumbnailni o'zi `null`ga
  o'tkazib chetlab o'tyapti).
- **Fix:** Server tomonda preview yo'q fayllar uchun `thumbnailUrl`/variant maydonlarini
  `null` qaytarish.

---

## B. Media fayllarga kirish (auth) — dizayn muammosi

### B1. 🔴 Variant/file URL'lari `<img>` orqali autentifikatsiya qilinmaydi
- **Endpoint:** `GET /api/event/{eventId}/file/{fileId}` va `.../variant/{size}`
- **Observed:** Bu endpointlar bearer-token bilan himoyalangan ("owner-OR-PUBLIC,
  deny-by-default") va 302 → presigned URL qaytaradi. Klient ularni `<img src>` /
  CSS-background sifatida ishlatadi.
- **Problem:** Brauzer `<img>`/`background-image` so'rovlarida `Authorization` header
  **yubora olmaydi**. PUBLIC fayllar anonim ochilsa ishlaydi; ammo `PRIVATE_TO_ME` /
  `EVENT_ATTENDEES_ONLY` fayllar **umuman yuklanmaydi**.
- **Impact:** Shaxsiy/cheklangan media dashboardda ko'rsatilmaydi.
- **Fix (variantlar):** (a) list payload'ida to'g'ridan-to'g'ri qisqa muddatli presigned
  URL qaytarish; yoki (b) variant endpointida `?token=` (qisqa muddatli) query-param'ni
  qo'llab-quvvatlash; yoki (c) PUBLIC'lar uchun anonim kirishni rasman kafolatlash.
  Aniqlik kiritilsa, frontend moslashtiriladi (kerak bo'lsa blob-fetch + objectURL).

---

## C. Auth flow kontrakti

### C1. 🟠 `/api/auth/register` token qaytarmaydi
- **Endpoint:** `POST /api/auth/register` → `CreateUserResponseContract`
- **Observed:** Javobda faqat `userId, phoneNumber, email, firstName, lastName, status`;
  `accessToken`/`refreshToken` **yo'q**.
- **Expected (mantiqan):** Ro'yxatdan o'tish odatda darhol sessiya ochadi (token qaytaradi).
- **Impact:** Frontend register'dan keyin majburan ikkinchi `POST /api/auth/login` chaqirishi
  kerak (qo'shimcha round-trip, parolni qayta yuborish).
- **Fix:** Register ham `LoginUserResponseContract` (token juftligi) qaytarsa, flow soddalashadi.
  (Hozir frontend register → login zanjiri bilan ishlayapti.)

### C2. 🔵 OTP / verification flow noaniqliklari (tasdiqlash kerak)
- `user-type-check` `NEW_USER` da OTP yuboradi va `ttl` qaytaradi — qayta yuborish ham shu
  endpoint orqalimi? (Rate-limit bormi?)
- `verify-phone-number` qaytargan `verificationToken` bir martalikmi, muddati qancha?
- **Fix:** Hujjatda OTP TTL, resend cooldown va verificationToken amal qilish muddatini
  aniq yozish.

---

## D. Swagger / hujjat muammolari

### D1. 🟠 `securitySchemes` va global `security` umuman yo'q
- **Observed:** `swagger.json` da `components.securitySchemes` = `undefined`,
  top-level `security` = `undefined`. Holbuki butun API bearer JWT bilan ishlaydi.
- **Impact:** Codegen / Swagger UI "Authorize" tugmasi token biriktira olmaydi; qaysi
  endpoint public, qaysi himoyalangani hujjatdan bilib bo'lmaydi.
- **Fix:** `bearerAuth` (http, bearer, JWT) sxemasini qo'shib, global `security` belgilash;
  public endpointlarda (`/api/auth/*`) `security: []` bilan override qilish.

### D2. 🔵 Variant URL misollari noto'g'ri prefiks bilan
- **Observed:** `EventPhotoResponseContract.thumbnailUrl` misoli `/api/capsule/file/abc-123/...`
  (event emas, **capsule** yo'li) — copy-paste xatosi. `smallUrl/mediumUrl` da esa event yo'li.
- **Fix:** Misollarni `/api/event/{eventId}/file/{fileId}/variant/...` ga moslash.

### D3. 🟡 Klient enum nomuvofiqligi (ma'lumot uchun)
- **Observed:** `accessLevel` real enum: `PRIVATE_TO_ME | EVENT_ATTENDEES_ONLY | PUBLIC`.
  Frontend ilk redizaynda `PUBLIC/PRIVATE` deb taxmin qilingan edi.
- **Fix (frontend tomon):** `PhotoAccessLevel` ni 3 qiymatga moslash (backendda muammo emas,
  bu yerga to'liqlik uchun yozildi).

---

## E. Yetishmayotgan endpointlar (gaps)

### E1. 🔴 Caller'ning `orgId`'sini aniqlash yo'li YO'Q → barcha org endpointlari 403
- **Symptom:** Ko'p endpointda `403 "User is not an org admin"`, masalan
  `GET /api/org/ws_jb/members`.
- **Root cause (2 qatlam):**
  1. **Backend gap:** Foydalanuvchi qaysi org(lar)ga a'zo ekanini qaytaradigan **hech qanday
     endpoint yo'q.** Tekshirildi:
     - `GET /api/user/me` (`UserInfoResponseContract`) — org/orgId **yo'q** (faqat
       userId, phone, email, ism, status, avatar).
     - Event javoblari (`GetEventResponseContract`, event list) — `orgId` **yo'q**.
     - `orgId` faqat quyidagilarda bor: `OrgResponseContract` (org yaratganda qaytadi),
       `PhotographerAssignmentResponseContract`, `OrgAnalyticsResponseContract` — ya'ni
       orgId'ni **oldindan bilmasdan** uni topib bo'lmaydi.
     - `GET /api/org` (list) endpointi **yo'q** (faqat `POST /api/org`).
  2. **Frontend natija:** orgId'ni bilolmagani uchun dashboard placeholder seed
     `ws_jb`/`ws_kotlin` ni `orgId` sifatida yuboryapti → har bir path-based org
     endpoint `403`.
- **Impact:** 🔴 **Blocker.** Mobil ilovada org yaratgan mavjud foydalanuvchi dashboardda
  o'z org'iga **umuman kira olmaydi** — barcha org-scoped sahifalar (members, branding,
  billing, analytics, photographers) 403 beradi.
- **Fix (backend):** `GET /api/user/me/organizations` (yoki `me` javobiga `organizations: [{orgId, name, role}]`
  qo'shish). Shu bo'lsa frontend real orgId bilan ishlaydi.
- **Vaqtinchalik yechim (frontend) — ✅ BAJARILDI:** Soxta `ws_jb` seed olib tashlandi;
  org topilmasa shell o'rniga "Create organization" onboarding ko'rsatiladi
  (`POST /api/org` → ADMIN + real orgId qaytaradi, session'ga saqlanadi), hamda
  workspace switcher'da "Create organization" tugmasi qo'shildi.
  ⚠️ **Cheklov:** Bu faqat YANGI (org'i yo'q) userlarni qutqaradi. Mobil ilovada
  allaqachon org yaratgan user dashboardda baribir bu onboarding'ni ko'radi va
  **dublikat org yaratib qo'yishi mumkin** — to'liq yechim uchun backendda org-discovery
  (me-orgs) endpointi shart.

### E1b. 🟡 Tushunmovchilikni rad etish: rol/organizer **berish endpointlari BOR**
> Eslatma: 403 sababi "rol berish yo'q" emas. Rol berish mavjud — muammo yuqoridagi
> orgId-aniqlash (E1). To'liqlik uchun mavjudlar:
- `POST /api/org` — org yaratadi va **chaqiruvchini avtomatik ADMIN** qiladi
  ("auto-admits the caller as an ADMIN member"). `OrgResponseContract {orgId, name, ownerUserId, dateCreated}`.
- `PATCH /api/org/{orgId}/members/{userId}` — **Change a Member's Role** (`changeRole`).
- `POST /api/org/{orgId}/invites` + `POST /api/org/invites/accept` — taklif qilish;
  rol enum: `ADMIN | COORDINATOR | PHOTOGRAPHER | STAFF`.
- Event hostlari: `POST /api/event/{eventId}/host`, `/hosts`, `host/{userId}`.

### E1c. 🟠 Org-scoping nomuvofiq: `{orgId}` path vs `X-Org-Id` header
- **Observed:** Aksar org endpointlari path'da `{orgId}` oladi
  (`/api/org/{orgId}/members`, `/branding`, `/billing`, `/analytics`, `/photographers`),
  lekin `GET /api/org/events` esa **`X-Org-Id` header** orqali tanlaydi (header bo'lmasa
  shaxsiy default ro'yxat; non-member header → 403).
- **Impact:** Klient ikki xil mexanizmni boshqarishi kerak; chalkashlik va xato manbai.
- **Fix:** Bitta yondashuvga keltirish (afzal: hamma joyda `X-Org-Id` header, chunki u
  "active org" tushunchasiga mos va orgId'ni URL'ga yozmaslik xavfsizroq).

### E1d. 🟡 Ticketing (chipta) backendi yo'q
- **Observed:** Swagger + changelog'da `ticket` faqat AI draft `ticketTypes` (`string[]` hint)
  sifatida bor. Chipta yaratish/saqlash endpointi, `CreateEventRequestContract`'da
  ticket maydoni — **yo'q**.
- **Impact:** Event-create UI'da ticket muharriri hech narsani saqlay olmaydi (chalg'ituvchi).
  Frontend'da ticket UI **olib tashlandi** (funksional bo'lganda qaytariladi).
- **Fix (backend):** Ticketing kerak bo'lsa — ticket tier CRUD + event bilan bog'lash endpointlari.

### E2. 🟡 "Mening fotosurat topshiriqlarim" yo'q
- **Need:** Fotograf lens'i uchun shaxsiy assignment ro'yxati.
- **Observed:** Maxsus endpoint yo'q; frontend `GET /api/org/events` dan hosil qilyapti.
- **Fix:** `GET /api/photographer/assignments` qo'shish.

### E2. 🟡 "Mening fotosurat topshiriqlarim" yo'q
- **Need:** Fotograf lens'i uchun shaxsiy assignment ro'yxati.
- **Observed:** Maxsus endpoint yo'q; frontend `GET /api/org/events` dan hosil qilyapti.
- **Fix:** `GET /api/photographer/assignments` qo'shish.

### E3. 🟡 Org-darajasidagi yagona galereya yo'q
- **Need:** Tashkilotning barcha eventlari bo'yicha umumiy media oqimi.
- **Observed:** Endpoint yo'q; frontend har eventni alohida so'rab (`useQueries`) yig'yapti.
- **Fix:** `GET /api/org/{orgId}/photos` (aggregatsiya + pagination) qo'shish.

---

## F. Frontend buglar (kecha topilgan — ma'lumot uchun, allaqachon tuzatilgan)

> Bular backend emas, frontend tomon bo'lib, code-review paytida topilib **tuzatilgan**.
> Ro'yxat to'liq bo'lishi uchun yozib qo'yildi.

- **F1.** `registrations-tab` — `total / capacity` da `capacity = 0` bo'lsa NaN width
  (progress bar). Fix: `capacity > 0 ? total/capacity : 0`.
- **F2.** `progress-bar` — `value` NaN/Infinity bo'lsa buzilgan en. Fix:
  `Number.isFinite(value) ? value : 0`.
- **F3.** (bu sessiya) Auth flow — register OTP'ni `verificationToken` o'rnida ishlatardi va
  `user-type-check` qadami yo'q edi; swagger flow'iga moslab tuzatildi.
- **F4.** (bu sessiya) Media mapper — `mediaType: null` da hamma narsa `image`; `FAILED`
  abadiy "processing"; audio'da buzuq thumbnail; lightbox rasmni umuman ko'rsatmasdi.
  Barchasi tuzatildi.

---

_Eslatma: A/B/C/D/E bo'limlari backend jamoasi hal qilishi kerak bo'lgan elementlar._
