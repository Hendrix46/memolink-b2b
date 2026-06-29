# Memolink — Event Management: To'liq Implementatsiya Rejasi

> Maqsad: Event yaratish va boshqaruvini **professional darajaga** ko'tarish — Swagger'dagi
> Venue, Agenda (tracks/sessions/speakers), Branding va Event-core API'larini to'g'ri,
> bog'liqlik-zanjiriga mos flow bilan ulash.
>
> Sana: 2026-06-29 · Manba: `swagger.json` (server: `http://api.memolink.io`)
> Status: **Reja (implementatsiya boshlanmagan)**

---

## 0. Tasdiqlangan mahsulot qarorlari

| Qaror | Tanlov | Ta'sir |
|---|---|---|
| Venue + to'liq agenda qayerda yaratiladi | **Event-detail'da boshqariladi** (wizard yengil) | Orchestrator soddalashadi; chuqur CRUD detail tab'larida |
| Speaker boshqaruvi | **User-search → real `userId`** (`GET /api/user/list`) | Speaker = ro'yxatdan o'tgan user; autocomplete kerak |
| Boshlash | Avval shu reja hujjati | Kod keyingi bosqichda |

**Asosiy tamoyil:** *"Create'ni yengil tut, management'ni kuchli qil."*
Wizard faqat **core event + branding + cover** yaratadi. Venue, rooms, tracks, sessions,
speakers — event-detail sahifasida professional tahrirlanadi.

---

## 1. Backend API xaritasi (event management)

Resurslar **parent → child zanjir** bo'lib ishlaydi:

```
POST /api/event                                   → eventId        [CreateEventRequestContract]
  POST   /event/{id}/venue                         → venueId        [VenueRequestContract]
    POST /venue/{venueId}/rooms                    → roomId         [RoomRequestContract] (nested: parentRoomId)
  POST   /event/{id}/agenda/tracks                 → trackId        [TrackRequestContract]
  POST   /event/{id}/agenda/sessions               → sessionId      [SessionRequestContract] (trackId + roomId reference)
    POST /agenda/sessions/{sid}/speakers/{userId}                   (speaker = REAL userId)
  PUT    /event/{id}/branding                                       [UpdateBrandingRequestContract]
  POST   /event/{id}/poster                                         (multipart)
  POST   /discover/events/{id}/submit                               (ixtiyoriy, PUBLIC uchun)
```

### Kontrakt referenslari (Swagger'dan)

**CreateEventRequestContract** (req: `title, location, accessLevel, eventStartDate, eventEndDate`)
- `title*` (≤255), `description` (≤4096), `location*` → LocationDetails, `accessLevel*` ENUM[PUBLIC|PRIVATE]
- `eventStartDate*`/`eventEndDate*` (date-time), `maxAttendees`, `coHostUserIds[]`, `allowJoinRequests`, `orgId`

**LocationDetailsRequestContract** (req: `name`): `name*`, `address`, `latitude`, `longitude`

**VenueRequestContract** (req: `name`): `name*` (≤255), `address` (≤512), `latitude`, `longitude`, `notes`
→ **VenueResponseContract**: `venueId, name, address, lat, lng, notes, rooms[]`

**RoomRequestContract** (req: `name`): `name*` (≤255), `capacity`, `parentRoomId` (≤64), `sortOrder`
→ **RoomResponseContract**: `roomId, name, capacity, parentRoomId, sortOrder`

**TrackRequestContract** (req: `name`): `name*` (≤255), `color` (≤7, hex), `sortOrder`
→ **TrackResponseContract**: `trackId, name, color, sortOrder`

**SessionRequestContract** (req: `title, startTime, endTime`): `title*` (≤255), `description`,
`trackId` (≤64), `roomId` (≤64), `startTime*`/`endTime*` (date-time), `sortOrder`
→ **SessionResponseContract**: `sessionId, trackId, roomId, title, description, startTime, endTime, sortOrder, speakers[]`

**SpeakerSummaryContract**: `userId`, `headline`

**UpdateBrandingRequestContract** (hammasi optional): `primaryColor`, `accentColor`, `fontFamily` (≤64),
`logoFileId` (≤64), `watermarkType` ENUM[NONE|TEXT|IMAGE], `watermarkText` (≤120), `watermarkImageFileId`,
`watermarkOpacity` (int), `watermarkPosition` ENUM[CENTER|TOP_LEFT|TOP_RIGHT|BOTTOM_LEFT|BOTTOM_RIGHT]

**AgendaResponseContract** (`GET /agenda`): `tracks[]`, `sessions[]`

**Tegishli yordamchi endpoint'lar:** `GET /api/user/list` (speaker/cohost resolver),
`POST /event/{id}/host` (cohost), `PUT /event/{id}` (edit), `POST /event/{id}/cancel`,
`PUT /event/{id}/share-settings`, `GET /event/{id}/qrcode`.

---

## 2. Hozirgi holat — gap audit

| Soha | Hozir | Gap |
|---|---|---|
| Create flow | 1 ta `POST /api/event` + best-effort poster/accent (`use-event-create-ai.ts:70`) | Faqat AI yo'li agenda saqlaydi; qo'lda agenda **yo'qoladi** |
| Draft agenda modeli | `AgendaDraftItem` (`time`, `track` enum, `room`/`speaker` string) `types.ts:26` | Backend `startTime/endTime`, `trackId`, `roomId`, `speakers[userId]` kutadi |
| Venue/Rooms | **Yo'q** (entity ham, UI ham) | To'liq qurish kerak |
| `conference` entity | tracks/sessions CRUD + `assignSpeaker` API bor | `updateTrack`/`assignSpeaker` hook + UI yo'q; venue yo'q |
| Agenda tab | track + session(title/start/end/track) `agenda-tab.tsx` | Room yo'q, speaker yo'q, session-edit yo'q, track-edit/o'chirish UI yo'q, kun guruhlash yo'q |
| Venue tab | **Yo'q** | Yangi tab kerak |
| Edit event | "Edit" tugma ishlamaydi (`event-detail-page.tsx:105`) | `PUT /api/event/{id}` ulanmagan |
| Branding | Faqat `accentColor` yuboriladi | To'liq `UpdateBrandingRequestContract` |
| Cohost invite | `invite-cohost-modal.tsx` — sof mock | `POST /event/{id}/host` ulanmagan |
| User-search | Frontend'da yo'q | Speaker/cohost resolver uchun shart |

---

## 3. Maqsadli arxitektura (FSD)

Yangi / o'zgaradigan bo'laklar:

- **`entities/venue`** *(yangi)* — venue + rooms API/hooks/types.
- **`entities/conference`** — `useAssignSpeaker`, `useUnassignSpeaker`, `useUpdateTrack` hooks qo'shish.
- **`entities/user`** *(yangi yoki session kengaytmasi)* — `searchUsers(query)` → `/api/user/list` (debounce'li autocomplete).
- **`entities/branding`** — to'liq branding mapping (type allaqachon bor).
- **`features/event-create`** — wizard yengillashadi (core event + branding + cover); orchestrator faqat shu uchta + ixtiyoriy discovery.
- **`pages/event-detail`** — yangi **Venue tab**, **Agenda tab** professional darajaga, **Edit-event drawer**, cohost real ulash.

---

## 4. Implementatsiya fazalari

### FAZA 0 — Poydevor (entity & contract)
- [ ] `entities/venue/` yaratish:
  - `model/types.ts` — `Venue`, `Room`, `VenueInput`, `RoomInput` (Swagger kontraktlariga mos).
  - `api/venue.api.ts` — `listVenues`, `createVenue`, `updateVenue`, `deleteVenue`, `createRoom`, `updateRoom`, `deleteRoom`.
  - `model/use-venue.ts` — `useVenues`, `useCreateVenue`, `useUpdateVenue`, `useDeleteVenue`, `useCreateRoom`, ...
  - `index.ts` (public API).
- [ ] `shared/config/query-keys.ts` — `events.venues(eventId)` qo'shish.
- [ ] `entities/conference/model/use-conference.ts` — `useAssignSpeaker`, `useUnassignSpeaker`, `useUpdateTrack` qo'shish (api'da mavjud).
- [ ] `entities/user/api/user.api.ts` — `searchUsers(query, page, size)` → `GET /api/user/list`; type `UserSummary`.
- [ ] `shared/ui` — kerak bo'lsa `UserPicker`/`Autocomplete` primitivi (debounce + dropdown).

### FAZA 1 — Wizard yengillashtirish (create flow)
- [ ] `event-wizard.tsx` — agenda step'ni wizard'dan **olib tashlash** (detail'ga ko'chadi); step'lar: Basics → Capabilities → Branding → (Registration agar yoqilgan) → Access → Review.
- [ ] `event-draft-store.ts` / `types.ts` — `agenda`/agenda-helperlarni draftdan olib tashlash (yoki "preview-only" qilib qoldirish); branding to'liq maydonlar (`primaryColor`, `fontFamily`, watermark) qo'shish.
- [ ] `use-event-create-ai.ts` orchestrator'ni soddalashtirish:
  - `POST /api/event` (coHostUserIds bilan) → eventId
  - `PUT /event/{id}/branding` (to'liq `UpdateBrandingRequestContract`)
  - `POST /event/{id}/poster` (cover)
  - agar PUBLIC + foydalanuvchi tanlasa: `POST /discover/events/{id}/submit`
  - AI yo'li: `ai/draft/apply` atomik agenda+accent saqlab qoladi (mavjud).
- [ ] Review step — yaratiladigan event + branding + cohostlar summary; "yaratgandan keyin agenda/venue qo'shasiz" eslatmasi.
- [ ] Create muvaffaqiyatidan keyin → event-detail Agenda/Overview tab'iga yo'naltirib, "Agenda qo'shing" CTA.

### FAZA 2 — Venue tab (event-detail)
- [ ] `pages/event-detail/ui/tabs/venue-tab.tsx` *(yangi)*:
  - Venue ro'yxati (`useVenues`); venue qo'shish/tahrirlash/o'chirish (name, address, lat/lng, notes).
  - Har venue ichida **rooms** (nested daraxt — `parentRoomId`), capacity, sortOrder; CRUD.
  - Empty/loading/error state.
- [ ] `event-detail-page.tsx` — tabs ro'yxatiga `venue` qo'shish (agenda'dan oldin).
- [ ] i18n: `eventDetail.venue.*`.

### FAZA 3 — Agenda tab'ni professional darajaga ko'tarish
- [ ] `agenda-tab.tsx` qayta ishlash:
  - **Kun bo'yicha guruhlash** + vaqt tartibi; track rangi ustun sifatida.
  - **Track boshqaruvi**: yaratish (rang tanlash), **tahrirlash** (`useUpdateTrack`), **o'chirish** (mavjud hook, UI yo'q edi).
  - **Room tanlash**: session formida Venue tab'dagi rooms'dan tanlash (`roomId`).
  - **Session tahrirlash**: `useUpdateSession` ulash (hozir faqat create/delete).
  - **Speaker tayinlash/olib tashlash**: `UserPicker` (user-search → userId) + `useAssignSpeaker`/`useUnassignSpeaker`; speaker `headline` ko'rsatish.
  - `sortOrder` bilan reorder (drag yoki ↑↓ tugmalar).
- [ ] i18n: `eventDetail.agenda.*` kengaytirish (room, speaker, edit, day).

### FAZA 4 — Edit event + cohost (event-detail)
- [ ] **Edit-event drawer/modal**: `PUT /api/event/{id}` — title, description, location, dates, accessLevel, maxAttendees, eventStatus. Hero'dagi "Edit" tugmasini ulash (`event-detail-page.tsx:105`).
- [ ] `eventApi.update` allaqachon bor (`event.api.ts:166`) — form + invalidatsiya.
- [ ] **Cohost real ulash**: `invite-cohost-modal.tsx` — `UserPicker` (user-search) → `POST /event/{id}/host`; hosts tab invalidatsiya. (Email-invite alohida `POST /event/{id}/invite` bilan.)
- [ ] Share tugmasi: `GET /event/{id}/invite-link` / `share-settings`.

### FAZA 5 — Polish & verifikatsiya
- [ ] i18n (en/ru/uz) — barcha yangi string'lar `locales/{en,ru,uz}.json`'ga (hardcode yo'q).
- [ ] Har yangi surface uchun empty/loading/error skeletonlar.
- [ ] `BACKEND-ISSUES.md` yangilash: speaker=userId resolver talabi, timezone (A4) ta'siri, agenda apply qisman-xato semantikasi.
- [ ] `npm run typecheck` + `npm run lint` toza.
- [ ] Qo'lda smoke test: create → detail → venue qo'shish → track/session/speaker → branding → edit.

---

## 5. Risklar va backend cheklovlari

- **Timezone (BACKEND-ISSUES A4):** datetime'lar offset'siz qaytadi. Session `startTime/endTime`
  yuborishda naive local↔UTC nomuvofiqligi xavfi — bitta konvertatsiya helperidan foydalanish.
- **Speaker = userId:** backend faqat ro'yxatdan o'tgan userni tayinlaydi. Org-tashqari/tashqi
  speaker uchun yechim yo'q → "speaker profile" yoki tashqi taklif mexanizmi kerak bo'lishi mumkin
  (backend gap sifatida yozish).
- **orgId aniqlash (BACKEND-ISSUES E1):** create'da `orgId` opsional; org-discovery hali ham gap.
- **Qisman-xato:** core event yaratilgach sub-resurs xatosi event'ni bloklamaydi, lekin
  "silently swallow" o'rniga foydalanuvchiga aniq toast + detail'da to'g'rilash imkoni.

---

## 6. Yangi/o'zgaradigan fayllar (xulosa)

**Yangi:**
- `src/entities/venue/{api/venue.api.ts, model/types.ts, model/use-venue.ts, index.ts}`
- `src/entities/user/{api/user.api.ts, index.ts}`
- `src/pages/event-detail/ui/tabs/venue-tab.tsx`
- `src/shared/ui/UserPicker` (autocomplete)

**O'zgaradi:**
- `src/entities/conference/model/use-conference.ts` (+hooks)
- `src/shared/config/query-keys.ts` (venues key)
- `src/features/event-builder/{model/types.ts, model/event-draft-store.ts, ui/*}` (yengillashtirish + branding)
- `src/features/event-create-ai/{model/use-event-create-ai.ts, lib/draft-mapping.ts}` (orchestrator)
- `src/pages/event-new/ui/event-wizard.tsx` (agenda step olib tashlash)
- `src/pages/event-detail/ui/tabs/agenda-tab.tsx` (professional)
- `src/pages/event-detail/ui/event-detail-page.tsx` (venue tab + edit/share ulash)
- `src/features/invite-cohost/ui/invite-cohost-modal.tsx` (real host API)
- `src/app/i18n/locales/{en,ru,uz}.json`
