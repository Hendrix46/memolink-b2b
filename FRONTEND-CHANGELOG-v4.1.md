# Memolink Backend — Frontend Integration Guide & Changelog · v4.1

**Milestone:** "Enterprise Event Dashboard: Complete" (Phases 56–63)
**Audience:** Frontend / mobile developers integrating against the Memolink REST API.

This document is the single source of truth for the event-lifecycle API surface plus everything shipped in v4.1. Every endpoint, path, field, validation rule and enum below was read off the actual controllers and contract classes in the repo — not invented. Where a shape is large, the load-bearing fields are shown.

---

## 1. Overview

v4.1 layers an **enterprise event dashboard** on top of the existing B2C foundation. Organizations, photographers, conferences, branding, delivery galleries, analytics, billing/quotas and an AI draft assistant all sit on the same auth backbone and the same response envelope you already use.

**Zero-regression guarantee:** All existing `/api/auth/*` endpoints and every v4.0 contract are unchanged. Phone-registered users and existing mobile parsers keep working. New B2B rows may carry `orgId`; B2C flows ignore it.

Per-phase summary:

- **Phase 56 — Media Curation.** Organizers get an editorial review layer over event photos: approve / reject (with reason) / feature, plus all-or-nothing bulk actions. A photo is gallery-eligible only when *delivered* + *NSFW-approved* + *not editorial-rejected*. Editorial state is independent of NSFW moderation state.
- **Phase 57 — Branding.** Org-level default branding (colors, font, logo, watermark) with reusable named templates, plus per-event branding overrides that resolve org-default → event-override. Hex colors and watermark placement are validated.
- **Phase 58 — Delivery Galleries.** Organizers create shareable client galleries (PUBLIC / PASSWORD / INVITE_ONLY) with optional expiry and download policy. Public consumers hit share-token endpoints with **no auth**; the backend returns a precise 404/410/401/403/200/302 truth table the client must handle.
- **Phase 59 — Analytics.** Read-only per-event metrics, an org-wide rollup, and a configurable leaderboard (photographers or events, by metric). Counts only — no PII; unique-visitor hashes are never exposed.
- **Phase 60 — Billing & Quotas.** Per-org billing snapshot (tier + usage + limits + remaining) and a subscription tier change (payment stubbed). Quota breaches surface as typed **409** errors (storage / events / photographers / galleries).
- **Phase 61 — Pro Conference.** Venues & rooms, agenda tracks & sessions, session-speaker assignment, a **public agenda** endpoint, a self-scoped personal schedule, speaker profiles, and a `SESSION_STARTING` push notification.
- **Phase 62 — Photographer Profile + Resumable Upload.** Photographer profiles & availability windows, plus a chunked/resumable upload flow (init → upload part → status → complete → abort) so large photographer batches survive flaky networks.
- **Phase 63 — AI Event Draft (NEW).** A two-step assistant: generate a non-persisted event draft from a prompt, let the user edit, then atomically apply structured agenda + accent-color suggestions into the conference agenda and branding. Rate-limited 10/hour; feature-flagged (ON in stage, OFF in prod until GA → 503).

---

## 2. Conventions

### Base URL & auth

- **Base URL:** `https://<host>/` — all paths below are absolute from root (e.g. `POST /api/event`). Local dev: `http://localhost:8888`.
- **Auth header:** `Authorization: Bearer <keycloak-jwt>` on every secured endpoint.
- **Roles:** All v4.1 secured endpoints use `@Secured(MEMOLINK_USER)` — i.e. *any authenticated Memolink user*. **Relationship-level authorization** (org admin / event host / assigned photographer / attendee) is enforced **server-side inside the service layer**. A caller who lacks the relationship gets **403** (or **404** where existence itself is privileged). Do not assume the JWT role alone grants access.
- Keycloak realm roles are mapped without the `ROLE_` prefix: `MEMOLINK_USER`, `MEMOLINK_MODERATOR`, `MEMOLINK_ADMIN`.

### Public endpoints (no auth)

`permitAll` patterns from `SecurityConfiguration`:

| Method | Path | Notes |
|---|---|---|
| ANY | `/swagger/**`, `/actuator/**` | Docs / health |
| ANY | `/api/auth/**` | Login, register, SSO |
| ANY | `/api/test/**` | Test endpoints |
| GET | `/api/safety/resources` | Crisis resources |
| GET | `/api/event/{eventId}` | Event detail — PRIVATE events return 404 to anonymous |
| GET | `/api/event/{eventId}/agenda` | Public conference agenda (service gates PRIVATE visibility) |
| GET | `/api/event/{eventId}/poster` | OG/link-preview poster image |
| GET | `/api/capsule/{capsuleId}` | Capsule detail (non-PUBLIC → 404) |
| GET | `/api/discover/metadata`, `/api/discover/events` | Discovery browse |
| POST | `/api/waitlist`, GET `/api/waitlist/stats/public` | Waitlist |
| ANY | `/api/public/gallery/**` | Share-token delivery galleries (service enforces the access gate) |

All other requests require a valid bearer token.

### Response envelope — `BaseContractResponse<T>`

Every JSON endpoint returns this envelope.

**Success:**
```json
{
  "success": true,
  "data": { "...": "payload of type T" },
  "message": "Success",
  "statusCode": 200,
  "timestamp": "2026-06-27T14:32:10.123",
  "errorCode": null,
  "path": null,
  "errors": null
}
```

**Error:**
```json
{
  "success": false,
  "data": null,
  "message": "Event not found",
  "statusCode": 404,
  "errorCode": 404,
  "path": "/api/event/abc-123",
  "errors": null,
  "timestamp": "2026-06-27T14:32:10.123"
}
```

`errors` is a `List<String>` populated only for field-validation failures (one entry per invalid field).

> Note: A few endpoints return raw payloads instead of the envelope: image/file byte streams (`/poster`, `/file/{fileId}`, `/photo/{photoId}`), and the public gallery `view`/`download` endpoints which respond **302** to a presigned URL. The 429 rate-limit body is also a slim non-envelope shape (see error table).

### Pagination — `PagedResponse<T>` (offset) and `CursorPage<T>` (keyset)

**`PagedResponse<T>`** — **1-indexed** pages. `size` is capped at 100.
```json
{ "content": [ /* T[] */ ], "page": 1, "size": 20, "totalElements": 137, "totalPages": 7 }
```

**`CursorPage<T>`** — stable keyset paging (used by event photos `GET /{eventId}/photos`).
```json
{ "items": [ /* T[] */ ], "nextCursor": "b64opaque", "hasMore": true }
```
Pass the opaque `nextCursor` back as `?cursor=`; omit it for the first page. `size` defaults to 30, capped 100.

### Date / time & timezone

- All timestamps are ISO-8601 `LocalDateTime` (e.g. `2026-07-01T18:00:00`). No offset is serialized.
- Server business clock is **Asia/Tashkent** (UTC+5). "Future-or-present" checks (event start dates, AI draft) anchor to Asia/Tashkent. Send local Tashkent wall-clock times.

### Error / status mapping

`BaseBusinessException` subclasses carry an `int code` that the global handler (`ControllerExceptionHandler`) maps to HTTP status:

| `code` / situation | HTTP | When |
|---|---|---|
| 400 (default fallthrough) | 400 Bad Request | Validation, malformed JSON, type mismatch, bad arguments, `InvalidEventDates` |
| 401 | 401 Unauthorized | Invalid credentials / bad SSO token / gallery password invalid |
| 403 | 403 Forbidden | Relationship authz failed (not host / not org admin / not assigned) |
| 404 | 404 Not Found | Entity not found OR PRIVATE resource hidden from caller |
| 409 | 409 Conflict | `AlreadyAttending`, `MaxAttendeesReached`, all quota-exceeded, DB integrity |
| 410 | 410 Gone | Gallery soft-deleted or expired |
| 429 | 429 Too Many Requests | Rate-limit tier exhausted |
| 503 | 503 Service Unavailable | AI draft disabled/unavailable, safety resources unavailable |
| ≥500 | 500 Internal Server Error | Unhandled |

Notable typed errors (verbatim messages):

| Code | HTTP | Message |
|---|---|---|
| `EVENT_NOT_FOUND` | 404 | Event not found |
| `ALREADY_ATTENDING` | 409 | User is already attending this event |
| `MAX_ATTENDEES_REACHED` | 409 | Maximum number of attendees reached for this event |
| `INVALID_EVENT_DATES` | 400 | Event start date must be before end date |
| `AI_DRAFT_DISABLED` | 503 | AI draft generation is not enabled |
| `AI_DRAFT_UNAVAILABLE` | 503 | AI draft generation is temporarily unavailable |
| `STORAGE_QUOTA_EXCEEDED` | 409 | Upload would exceed your organization's storage quota |
| `EVENT_QUOTA_EXCEEDED` | 409 | Creating this event would exceed your organization's event quota |
| `ORG_PHOTOGRAPHER_QUOTA_EXCEEDED` | 409 | Assigning this photographer would exceed your organization's photographer quota |
| `GALLERY_QUOTA_EXCEEDED` | 409 | Creating this gallery would exceed your organization's gallery quota |
| `PHOTOGRAPHER_QUOTA_EXCEEDED` | 409 | Upload would exceed your assigned shoot quota |

### Rate limiting — 429 body

When a rate-limit tier is exhausted the response is **429** with a slim body:
```json
{ "success": false, "message": "Rate limit exceeded. Please try again later." }
```
Headers on every rate-limited request:
- `Retry-After: <seconds>` (429 only) — seconds until tokens refill.
- `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

The notable tier for v4.1 is **`eventDraftAi` = 10 requests / hour** per authenticated user (AI draft generate). Read `Retry-After` and back off; do not retry tight.

---

## 3. Event lifecycle & management

Controller: `EventController` — base `/api/event`. Unless noted, every endpoint is `@Secured(MEMOLINK_USER)` and returns the `BaseContractResponse` envelope. Host/creator relationship checks happen in the service (403 on violation). **Writes to a CANCELLED event are rejected.** Event status lifecycle: `UPCOMING → ONGOING → COMPLETED`, plus terminal `CANCELLED` (auto-advanced by `EventStatusScheduler`).

### Enums you need here

- **`EventStatus`**: `UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED`
- **`RSVPStatus`**: `INVITED`, `GOING`, `MAYBE`, `NOT_GOING`, `CANCELLED`
- **`PhotoAccessLevel`**: `PRIVATE_TO_ME`, `EVENT_ATTENDEES_ONLY`, `PUBLIC`
- **`CapsuleAccessLevel`** (event accessLevel): `PUBLIC`, `PRIVATE`
- **`EventViewerRole`** (in summaries): `HOST`, `ATTENDEE`, `INVITED`, `OUTSIDER`

### CRUD

**`POST /api/event`** — Create event. Body `CreateEventRequestContract`:

| Field | Type | Required / validation |
|---|---|---|
| `title` | String | required, `@NotBlank`, max 255 |
| `description` | String | optional, max 4096 |
| `location` | object | required `@NotNull @Valid` (name, address, latitude, longitude) |
| `accessLevel` | enum | required `@NotNull` — `PUBLIC` / `PRIVATE` |
| `eventStartDate` | LocalDateTime | required, `@FutureOrPresent` |
| `eventEndDate` | LocalDateTime | required (must be after start → else `INVALID_EVENT_DATES` 400) |
| `maxAttendees` | Integer | optional, `@Min(1)` |
| `coHostUserIds` | String[] | optional, max 50 |
| `allowJoinRequests` | Boolean | optional |
| `orgId` | String | optional — links event to an organization (B2B) |

Returns `CreateEventResponseContract` → `{ eventId, title, description, location, accessLevel, eventStartDate, eventEndDate, eventStatus, maxAttendees, hosts[], dateCreated }`.

**`GET /api/event/{eventId}`** — **Public** for PUBLIC events; PRIVATE → 404 for anonymous. Returns `GetEventResponseContract` (rich): `eventId, title, description, eventUrl, location, accessLevel, allowJoinRequests, discoveryStatus, eventStartDate, eventEndDate, eventStatus, maxAttendees, currentAttendeeCount, hosts[], attendees[], posterFileId, coverPhotoUrl, files[], photos[], creator, dateCreated, dateUpdated`.

**`PUT /api/event/{eventId}`** — Update (hosts only). Body `UpdateEventRequestContract` — all fields optional: `title (max255)`, `description (max4096)`, `location`, `accessLevel`, `eventStartDate`, `eventEndDate`, `eventStatus`, `maxAttendees (@Min 1)`. Returns `UpdateEventResponseContract`.

**`DELETE /api/event/{eventId}`** — Delete (hosts only). Returns `Void`.

**`POST /api/event/{eventId}/cancel`** — Cancel (hosts only). Body `CancelEventRequestContract`:

| Field | Type | Required |
|---|---|---|
| `reason` | String | required, `@NotBlank`, 10–500 chars |
| `notifyAttendees` | Boolean | optional, default true |

Returns `CancelEventResponseContract` → `{ eventId, eventTitle, cancellationReason, cancelledAt, cancelledByUserId, attendeesNotified }`. After cancel, the event is terminal — subsequent writes are rejected.

### List & search

**`GET /api/event/list`** — Paged `PagedResponse<EventSummaryResponseContract>`.

**`GET /api/event/search`** — Query params (`SearchEventsRequestContract`): `query`, `status` (EventStatus), `startDateFrom/To`, `endDateFrom/To`, `location`, `page` (default 1), `size` (default 20, cap 100), `sortBy` (`eventStartDate`|`eventEndDate`|`title`|`dateCreated`, default `eventStartDate`), `sortDirection` (`asc`|`desc`). Returns `PagedResponse<EventSummaryResponseContract>`.

`EventSummaryResponseContract` → `{ eventId, title, description, locationName, accessLevel, eventStartDate, eventEndDate, eventStatus, maxAttendees, currentAttendeeCount, hostCount, posterFileId, coverPhotoUrl, dateCreated, viewerRole, rsvpStatus, creatorUserId }`.

### RSVP & joining

**`POST /api/event/{eventId}/rsvp`** — Body `RespondToEventRequestContract` `{ "rsvpStatus": "GOING" }` (required; one of `INVITED`/`GOING`/`MAYBE`/`NOT_GOING`/`CANCELLED`). The going / maybe / not-going values are `GOING`, `MAYBE`, `NOT_GOING`. Returns success message.

**`POST /api/event/{eventId}/join`** — Self-register for a PUBLIC event. Errors: `ALREADY_ATTENDING` (409), `MAX_ATTENDEES_REACHED` (409).

### Join-request approval (private events with `allowJoinRequests`)

**`GET /api/event/{eventId}/attendees/pending`** — Pending (INVITED) attendees awaiting approval (hosts only). Returns `ListEventAttendeesResponseContract` `{ attendees[] }`.

**`PUT /api/event/{eventId}/attendee/{userId}/approve`** — Approve (INVITED → GOING). Body optional `ApproveAttendeeRequestContract` `{ message? }`.

**`PUT /api/event/{eventId}/attendee/{userId}/reject`** — Reject (removes from list). Body `RejectAttendeeRequestContract` `{ reason }` (required `@NotBlank`).

> Note: approve/reject use **PUT** with `{userId}` in the path.

### Attendee management

**`POST /api/event/{eventId}/invite`** — Invite a user. Body `InviteAttendeeRequestContract` `{ userId }` (required).

**`DELETE /api/event/{eventId}/attendee/{attendeeUserId}`** — Remove an attendee (hosts only). The path var is `attendeeUserId`.

**`GET /api/event/{eventId}/attendees/paginated`** — `?page=&size=` (1-indexed, cap 100). Each `EventAttendeeResponseContract` → `{ attendeeId, userId, phoneNumber, firstName, lastName, avatarUrl, rsvpStatus, respondedAt, checkedIn, checkedInAt, checkedInByHostUserId, dateCreated }`.

### Hosts

**`POST /api/event/{eventId}/host`** — Add co-host. Body `AddEventHostRequestContract` `{ userId }` (required).
**`DELETE /api/event/{eventId}/host/{userId}`** — Remove a host. **The original creator cannot be removed.**
**`GET /api/event/{eventId}/hosts`** — `ListEventHostsResponseContract` `{ hosts[] }`. Each host: `{ eventHostId, userId, phoneNumber, firstName, lastName, avatarUrl, dateCreated }`.

### QR generate & check-in

**`GET /api/event/{eventId}/qrcode`** — Generate the caller's attendance QR. Returns `GenerateQRCodeResponseContract` `{ qrCodeBase64, eventId, attendeeId, userId }`. (Path is `/qrcode`.)

**`POST /api/event/{eventId}/checkin`** — Host scans an attendee in. Body `CheckInAttendeeRequestContract` `{ qrCodeData }` (required `@NotBlank`; format `eventId,attendeeId,userId`). Returns `CheckInAttendeeResponseContract` → `{ attendeeId, userId, firstName, lastName, checkedIn, checkedInAt, checkedInByHostUserId, checkedInByHostFirstName, checkedInByHostLastName }`.

### Invite links & sharing

**`GET /api/event/{eventId}/invite-link`** — Generate a shareable invite link (hosts only). `GenerateEventInviteLinkResponseContract` → `{ eventId, inviteToken, inviteUrl, shortUrl, allowJoinRequests }`.

**`PUT /api/event/{eventId}/share-settings`** — Body `UpdateEventShareSettingsRequestContract`: `allowJoinRequests` (required `@NotNull`), `regenerateToken` (optional, default false — invalidates old links).

**`POST /api/event/join-by-token?token=<inviteToken>`** — Join via invite token (no `{eventId}` path; token is a query param).

**`POST /api/event/{eventId}/send-update`** — Broadcast an update push to attendees. Body `SendEventUpdateRequestContract`: `title` (required, max 200), `message` (required, max 1000), `actionUrl` (optional deep link). Returns `SendEventUpdateResponseContract` `{ eventId, attendeesNotified, title, message }`.

### Event media (files & photos)

- **`POST /api/event/{eventId}/poster`** (multipart `file`) / **`GET /api/event/{eventId}/poster`** (public byte stream) / **`DELETE …/poster`**.
- **`POST /api/event/{eventId}/file`** (multipart `file`, `?accessLevel=`) → `FileResponseContract` `{ fileId, fileUrl, streamUrl?, smallUrl?, mediumUrl? }`. **`DELETE …/file/{fileId}`**, **`GET …/file/{fileId}`** (byte stream), **`GET …/file/{fileId}/variant/{size}`**.
- **`POST /api/event/{eventId}/photos/batch`** (multipart `files`, `?accessLevel=`) — batch photo upload.
- **`PUT /api/event/{eventId}/photo/{photoId}/access`** — Body `UpdatePhotoAccessLevelRequestContract` `{ accessLevel }` (`PRIVATE_TO_ME`/`EVENT_ATTENDEES_ONLY`/`PUBLIC`).
- **`GET /api/event/{eventId}/photos/paginated`** — offset `PagedResponse`.
- **`GET /api/event/{eventId}/photos`** — cursor `CursorPage` (`?cursor=&size=`, default 30). Items carry `thumbnailUrl` + `processingStatus` for lazy full-size loading.
- **`GET /api/event/{eventId}/photo/{photoId}`** — byte stream.

---

## 4. AI Event Draft (Phase 63 — NEW)

A two-step assistant. **Generate persists nothing**; **apply** routes user-confirmed suggestions into the conference agenda + branding atomically.

Controllers: `EventDraftController`, `EventDraftApplyController`. Both `@Secured(MEMOLINK_USER)`, both gated by feature flag `memolink.event.ai-draft.enabled` (ON in stage, OFF in prod until GA). When disabled → **503** (`AI_DRAFT_DISABLED`).

### Step (a) — Generate

**`POST /api/event/ai/draft`** — Body `EventDraftRequestContract`:

| Field | Type | Validation |
|---|---|---|
| `prompt` | String | required `@NotBlank`, max 2000 |
| `locale` | String | optional, `@Pattern ^(uz\|ru\|en)$` |

- **Rate-limited:** `eventDraftAi` = **10 / hour** per user → **429** (`Retry-After` header) on exhaustion.
- **503** when the feature flag is off (prod) or the LLM client is unavailable.

Response `EventDraftResponseContract` — create-mappable fields (drop straight into `POST /api/event`):
```json
{
  "title": "Tashkent Tech Summit 2026",
  "description": "...",
  "location": { "name": "...", "address": "...", "latitude": 41.31, "longitude": 69.27 },
  "accessLevel": "PUBLIC",
  "eventStartDate": "2026-09-12T09:00:00",
  "eventEndDate": "2026-09-12T18:00:00",
  "maxAttendees": 300,

  "suggestedEventType": "conference",
  "agenda": ["09:00 Registration", "10:00 Keynote", "..."],
  "ticketTypes": ["General", "VIP"],
  "suggestedAccent": "#1E88E5"
}
```
The first block mirrors `CreateEventRequestContract` (validated). The bottom block is **draft-only hints** — `agenda` is `string[]` (max 50 items, ≤512 chars each), `ticketTypes` `string[]`, `suggestedAccent` free text. Nothing is saved.

### Step (b) — Apply (NEW)

After the user creates the event and edits the suggestions, apply a **structured** agenda + accent into the live conference agenda (Phase 61) and branding (Phase 57), atomically. Host/organizer-gated.

**`POST /api/event/{eventId}/ai/draft/apply`** — Body `ApplyDraftSuggestionsRequestContract`:

| Field | Type | Validation |
|---|---|---|
| `agenda` | `AgendaSuggestionContract` | optional `@Valid` |
| `accentColor` | String | optional, `@Pattern ^#([0-9a-fA-F]{6})$` (hex #RRGGBB) |

`AgendaSuggestionContract`:
```json
{
  "tracks": [ { "name": "Main Stage" } ],              // max 20; name @NotBlank max255
  "sessions": [                                          // max 200
    {
      "title": "Opening Keynote",                        // @NotBlank max255
      "startTime": "2026-09-12T10:00:00",                // @NotNull
      "endTime":   "2026-09-12T11:00:00",                // @NotNull
      "trackName": "Main Stage",                         // optional, matched by name to a track
      "speakerNames": ["Aziz K."]                        // optional, max 5, free-text
    }
  ]
}
```
You may apply agenda-only, accent-only, or both. The whole apply is one transaction.

### End-to-end example

1. `POST /api/event/ai/draft` `{ "prompt": "1-day developer conference in Tashkent, ~300 people, blue branding", "locale": "en" }` → draft.
2. User reviews/edits in the UI. Frontend creates the event: `POST /api/event` using the draft's create-mappable fields.
3. Frontend turns the edited agenda into structured tracks/sessions + picks an accent hex.
4. `POST /api/event/{eventId}/ai/draft/apply` `{ "agenda": { tracks, sessions }, "accentColor": "#1E88E5" }` → agenda + branding persisted atomically.

> Handle **429** (back off per `Retry-After`) and **503** (hide the AI button in prod until GA).

---

## 5. Pro Conference (Phase 61)

All write endpoints `@Secured(MEMOLINK_USER)` + per-event organizer gate in service. Base `/api/event` (conference) and `/api/speaker` (profiles).

### Venues & rooms — `ConferenceVenueController`

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/event/{eventId}/venue` | Create venue → `VenueResponseContract` |
| GET | `/api/event/{eventId}/venue` | List venues |
| PUT | `/api/event/{eventId}/venue/{venueId}` | Update venue |
| DELETE | `/api/event/{eventId}/venue/{venueId}` | Delete venue |
| POST | `/api/event/{eventId}/venue/{venueId}/rooms` | Create room |
| PUT | `/api/event/{eventId}/venue/{venueId}/rooms/{roomId}` | Update room |
| DELETE | `/api/event/{eventId}/venue/{venueId}/rooms/{roomId}` | Delete room |
| GET | `/api/event/{eventId}/venue/{venueId}/rooms` | List rooms |

`VenueResponseContract` → `{ venueId, name, address, latitude, longitude, notes, rooms[] }`.
`RoomResponseContract` → `{ roomId, name, capacity, parentRoomId?, sortOrder }`.

### Agenda — `ConferenceAgendaController`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST/PUT/DELETE/GET | `/api/event/{eventId}/agenda/tracks[/{trackId}]` | user | Track CRUD → `TrackResponseContract` |
| POST/PUT/DELETE/GET | `/api/event/{eventId}/agenda/sessions[/{sessionId}]` | user | Session CRUD → `SessionResponseContract` |
| POST | `/api/event/{eventId}/agenda/sessions/{sessionId}/speakers/{userId}` | user | Assign speaker |
| DELETE | `/api/event/{eventId}/agenda/sessions/{sessionId}/speakers/{userId}` | user | Unassign speaker |
| **GET** | **`/api/event/{eventId}/agenda`** | **public** | Full resolved agenda (service gates PRIVATE) |

`TrackResponseContract` → `{ trackId, name, color, sortOrder }`.
`SessionResponseContract` → `{ sessionId, trackId?, roomId?, title, description, startTime, endTime, sortOrder, speakers[] }`.

### Personal schedule (self-scoped) — `PersonalScheduleController`

No `userId` param — caller derived from JWT; per-event attendee gate.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/event/{eventId}/schedule/sessions/{sessionId}` | Save session to my schedule |
| DELETE | `/api/event/{eventId}/schedule/sessions/{sessionId}` | Remove from my schedule |
| GET | `/api/event/{eventId}/schedule` | Get my personal schedule |

### Speaker profiles — `SpeakerProfileController` (base `/api/speaker`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| PUT | `/api/speaker/profile` | user (self) | Upsert my speaker profile |
| GET | `/api/speaker/profile` | user (self) | Get my profile |
| POST | `/api/speaker/profile/photo` | user (self) | Upload my profile photo (multipart) |
| GET | `/api/speaker/{userId}/profile` | user | Public profile — returned only when `isPublic=true`, else 404 |

`SpeakerProfileResponseContract` → `{ userId, headline, bio, photoFileId, photoUrl, links, isPublic }`.

**Push:** Attendees who saved a session receive `NotificationType.SESSION_STARTING` (`"type":"SESSION_STARTING"`) shortly before it begins.

---

## 6. Branding (Phase 57)

Hex colors validated `^#([0-9a-fA-F]{6})$` (#RRGGBB). Shared body `UpdateBrandingRequestContract`:

| Field | Type | Validation |
|---|---|---|
| `primaryColor` | String | `^#([0-9a-fA-F]{6})$` |
| `accentColor` | String | `^#([0-9a-fA-F]{6})$` |
| `fontFamily` | String | max 64 |
| `logoFileId` | String | max 64 |
| `watermarkType` | enum | `NONE` / `TEXT` / `IMAGE` (null → NONE) |
| `watermarkText` | String | max 120 (when TEXT) |
| `watermarkImageFileId` | String | max 64 |
| `watermarkOpacity` | Integer | 0–100 |
| `watermarkPosition` | enum | `CENTER`/`TOP_LEFT`/`TOP_RIGHT`/`BOTTOM_LEFT`/`BOTTOM_RIGHT` |

`BrandingResponseContract` = the same fields plus a resolved `logoUrl`.

### Org branding — `OrgBrandingController` (base `/api/org`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/org/{orgId}/branding` | Get org default branding |
| PUT | `/api/org/{orgId}/branding` | Update org default branding |
| POST | `/api/org/{orgId}/branding/logo` | Upload org logo (multipart, image/*) |
| POST | `/api/org/{orgId}/branding/watermark-image` | Upload watermark image |
| GET | `/api/org/{orgId}/branding/templates` | List templates |
| POST | `/api/org/{orgId}/branding/templates` | Create template (**201**) — `{ name (max120), attributes: UpdateBranding } ` |
| POST | `/api/org/{orgId}/branding/templates/{templateId}/apply` | Apply template — `{ target: ORG\|EVENT, eventId? }` |

`BrandingTemplateResponseContract` → `{ id, name, attributes }`.

### Event branding — `EventBrandingController` (base `/api/event`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/event/{eventId}/branding` | **Resolved** branding (event override layered over org default) |
| PUT | `/api/event/{eventId}/branding` | Update event branding override |

---

## 7. Delivery Galleries (Phase 58)

### Organizer — `GalleryController`

| Method | Path | Status | Purpose |
|---|---|---|---|
| POST | `/api/event/{eventId}/galleries` | 201 | Create gallery from eligible media → `GalleryDetailResponseContract` |
| GET | `/api/event/{eventId}/galleries` | 200 | List event galleries |
| GET | `/api/gallery/{galleryId}` | 200 | Gallery detail (includes `shareToken`, invite emails) |
| PATCH | `/api/gallery/{galleryId}` | 200 | Update title / shareType / password / expiry / published / download policy |
| DELETE | `/api/gallery/{galleryId}` | 204 | Soft-delete (share link → 410) |
| GET | `/api/gallery/{galleryId}/invites` | 200 | List INVITE_ONLY allow-list emails |
| POST | `/api/gallery/{galleryId}/invites` | 200 | Add email to allow-list — `{ email }` |
| DELETE | `/api/gallery/{galleryId}/invites/{email}` | 204 | Remove email |

`CreateGalleryRequestContract`: `title?` (max255), `shareType` (`@NotNull` — `PUBLIC`/`PASSWORD`/`INVITE_ONLY`), `password?` (max128, hashed when PASSWORD), `expiresAt?` (Instant), `downloadEnabled?`, `downloadQuality?` (`WEB`/`FULL`).

`UpdateGalleryRequestContract` (PATCH, all nullable): `title`, `published`, `shareType`, `password`, `expiresAt`, `clearExpiry` (true removes expiry), `downloadEnabled`, `downloadQuality`. Switching away from PASSWORD nulls the stored hash.

`GalleryDetailResponseContract` → `{ galleryId, shareToken, eventId, title, published, shareType, expiresAt, downloadEnabled, downloadQuality, inviteEmails[] }` (password hash never exposed).

### Public (no auth) — `PublicGalleryController` (base `/api/public/gallery`)

| Method | Path | Success | Purpose |
|---|---|---|---|
| GET | `/{shareToken}` | 200 | Public metadata (no media URLs) → `GalleryMetadataResponseContract` |
| POST | `/{shareToken}/unlock` | 200 | Verify PASSWORD, mint a 30-min unlock token (in `$.data`). Rate-limited 5/min |
| GET | `/{shareToken}/photos` | 200 | List eligible photos (featured-first, ≤100) → `GalleryPhotoItemResponseContract[]` |
| GET | `/{shareToken}/photos/{photoId}/view` | 302 | Redirect to presigned (watermarked) image |
| GET | `/{shareToken}/photos/{photoId}/download` | 302 | Redirect to presigned download (quality per policy) |

`GalleryMetadataResponseContract` → `{ galleryId, title, shareType, downloadEnabled, branding, accessRequirement? }` (`accessRequirement` set when locked).
`GalleryPhotoItemResponseContract` → `{ photoId, featuredRank?, thumbnailUrl }`.

**Access truth table** the FE must handle (enforced before any presign):

| Situation | HTTP |
|---|---|
| Unknown share token | 404 |
| Gallery soft-deleted or expired | 410 |
| PASSWORD gallery, no/invalid unlock token | 401 |
| INVITE_ONLY, no authenticated user | 401 |
| INVITE_ONLY, authed user not on allow-list | 403 |
| Accessible (metadata / photo list) | 200 |
| `view` / `download` (gate passed) | 302 → presigned URL |

Pass the unlock token via header `X-Gallery-Unlock-Token` (preferred) or `?unlockToken=`. Token is multi-use, 30-min, gallery-scoped.

---

## 8. Media Curation (Phase 56)

Controller `EventCurationController` (base `/api/event`). Organizer/host-gated.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/event/{eventId}/curation/photos` | Review list — **ALL** photos (incl. DRAFT + NSFW-BLOCKED), `PagedResponse<CurationPhotoResponseContract>`, 1-indexed, cap 100 |
| PATCH | `/api/event/{eventId}/curation/photos/{photoId}` | Update one photo's editorial state |
| POST | `/api/event/{eventId}/curation/photos/bulk` | Bulk action (ALL-OR-NOTHING; any cross-event id → 404, zero rows changed) |

`CurationPhotoUpdateRequestContract`: `state` (`@NotNull` — `PENDING`/`APPROVED`/`REJECTED`/`FEATURED`), `reason` (max1024, **required when REJECTED**).

`BulkCurationRequestContract`: `photoIds` (`@NotEmpty`, max 500, each `@NotBlank`), `action` (`@NotNull` — `APPROVE`→APPROVED, `REJECT`→REJECTED, `FEATURE`→FEATURED), `reason` (max1024, **required when REJECT**).

`CurationPhotoResponseContract` → `{ eventPhotoId, fileId, thumbnailUrl, uploadedByUserId, uploaderFirstName, uploaderLastName, moderationStatus, editorialState, featuredRank?, reason?, dateCreated }`.

> `moderationStatus` (NSFW) and `editorialState` are **independent**. **Gallery-eligibility:** a photo appears in delivery galleries only when *delivered* (non-DRAFT) **and** NSFW-approved (or legacy null) **and** `editorialState ≠ REJECTED`.

---

## 9. Analytics (Phase 59)

Controller `AnalyticsController`. Counts only — no PII; visitor hashes never exposed.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/event/{eventId}/analytics` | Per-event metrics → `EventAnalyticsResponseContract` |
| GET | `/api/org/{orgId}/analytics` | Org-wide rollup → `OrgAnalyticsResponseContract` |
| GET | `/api/org/{orgId}/analytics/leaderboard` | Ranked leaderboard → `List<LeaderboardEntryContract>` |

`EventAnalyticsResponseContract` → `{ eventId, views, downloads, uniqueVisitors, photographers[], attendance }`.
`OrgAnalyticsResponseContract` → `{ orgId, totalViews, totalDownloads, totalUniqueVisitors, totalEvents, perEvent[] }` (perEvent capped ≤100).
`LeaderboardEntryContract` → `{ rank, entityId, entityLabel, metricValue }`.

Leaderboard query params: `entity` (`PHOTOGRAPHERS`|`EVENTS`), `metric` (events: `VIEWS`/`UNIQUE_VISITORS`/`DOWNLOADS`/`ATTENDANCE`; photographers: `DELIVERED`/`FEATURED`/`UPLOADS`), `limit` (default 10, clamped 1–100).

---

## 10. Billing & Quotas (Phase 60)

Controller `BillingController`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/org/{orgId}/billing` | Tier + limits + usage + remaining (admin/coordinator) |
| POST | `/api/org/{orgId}/billing/subscription` | Change tier (payment stubbed) (admin) |

`UpdateSubscriptionRequestContract`: `tier` (`@NotNull` — `SubscriptionTier`: `DEFAULT`/`FREE`/`PRO`/`ENTERPRISE`).

`OrgBillingResponseContract` (both endpoints return this):
```json
{
  "tier": "PRO",
  "limits":    { "storageBytes": 107374182400, "maxEvents": 100, "maxPhotographers": 20, "maxGalleries": 200 },
  "usage":     { "storageBytesUsed": 5234880, "eventsCount": 12, "photographersCount": 4, "galleriesCount": 9 },
  "remaining": { "storageBytes": 107368947520, "events": 88, "photographers": 16, "galleries": 191 }
}
```
A `null` limit / remaining field = **unlimited** for that dimension (the default for legacy orgs with no subscription row → resolves `DEFAULT`).

**Quota errors to surface (all 409):** `STORAGE_QUOTA_EXCEEDED`, `EVENT_QUOTA_EXCEEDED`, `ORG_PHOTOGRAPHER_QUOTA_EXCEEDED`, `GALLERY_QUOTA_EXCEEDED`, `PHOTOGRAPHER_QUOTA_EXCEEDED` (per-photographer shoot quota). These are thrown by the relevant create/assign/upload endpoints, not by billing GET.

---

## 11. Photographer Profile + Resumable Upload (Phase 62)

### Profile — `PhotographerProfileController` (base `/api/photographer`)

| Method | Path | Purpose |
|---|---|---|
| PUT | `/api/photographer/profile` | Upsert my profile |
| GET | `/api/photographer/profile` | Get my profile |
| POST | `/api/photographer/profile/photo` | Upload my profile photo (multipart) |
| GET | `/api/photographer/{userId}/profile` | Public profile (isPublic-gated, 404 otherwise) |

`PhotographerProfileRequestContract`: `bio` (max4000), `gear` (max4000), `portfolioUrl` (max512), `isPublic` (boolean).
`PhotographerProfileResponseContract` → `{ userId, bio, gear, portfolioUrl, photoFileId, photoUrl?, isPublic }`.

### Availability — `PhotographerAvailabilityController` (base `/api/photographer/availability`)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/photographer/availability` | Add window — `{ startTime, endTime, note? }` |
| GET | `/api/photographer/availability` | List my windows |
| DELETE | `/api/photographer/availability/{availabilityId}` | Delete window (idempotent) |

`PhotographerAvailabilityResponseContract` → `{ id, startTime, endTime, note }`. `startTime` must be before `endTime`.

### Resumable / chunked upload — `ResumableUploadController`

Base `/api/event/{eventId}/photographer/photos/resumable`. Flow: **init → upload part(s) → status (resume) → complete → abort**.

**1. `POST …/resumable/init`** — `ResumableInitRequestContract`: `fileName` (max255), `contentType` (max255), `totalSize` (`@NotNull @Positive`), `accessLevel` (`@NotNull`). Returns `ResumableInitResponseContract` → `{ uploadSessionId, partSize, objectKey }`. **Slice the file into `partSize`-byte chunks.**

**2. `PUT …/resumable/{uploadSessionId}/part/{partNumber}`** — raw `application/octet-stream` body (one chunk, never multipart; `Content-Length` ≤ `partSize` or 400). Returns `ResumablePartResponseContract` → `{ partNumber, etag, sizeBytes }`.

**3. `GET …/resumable/{uploadSessionId}`** — resume contract (source of truth = DB). Returns `ResumableUploadStatusResponseContract` → `{ uploadSessionId, status, totalSize, uploadedBytes, completedPartNumbers[] }`. **Resume by re-uploading only the part numbers missing from `completedPartNumbers`.** `status` ∈ `INITIATED`/`IN_PROGRESS`/`COMPLETED`/`ABORTED`/`FAILED`. Progress = `uploadedBytes / totalSize`.

**4. `POST …/resumable/{uploadSessionId}/complete`** — assembles parts, hands to the photo pipeline (**201**). Returns `ResumableCompleteResponseContract` → `{ fileId, eventPhotoId, state }` (`state` = `"draft"` — invisible until delivered).

**5. `DELETE …/resumable/{uploadSessionId}`** — abort (**204**).

### Org & assignment (supporting B2B)

- **`OrgController`** (`/api/org`): `POST /` create (201, `{ name }`), `GET /{orgId}`, `GET /events`, `GET /{orgId}/members`, `GET/POST /{orgId}/invites`, `POST /invites/accept`, `PATCH /{orgId}/members/{userId}`, `DELETE /{orgId}/members/{userId}`, `DELETE /{orgId}/invites/{token}`. `OrgResponseContract` → `{ orgId, name, ownerUserId, dateCreated }`.
- **`OrgPhotographersController`**: `GET /api/org/{orgId}/photographers` → `[{ userId, profile?, availability[] }]` (admin/coordinator only).
- **`PhotographerAssignmentController`** (`/api/event/{eventId}/photographers`): `POST /` assign (201) — `AssignPhotographerRequestContract` `{ photographerId (@NotBlank), shootQuota? (@Min1), accessWindowStart?, accessWindowEnd? }`; `DELETE /{userId}` (204); `GET /?includeRemoved=`. `PhotographerAssignmentResponseContract` → `{ eventId, photographerId, orgId, shootQuota?, accessWindowStart, accessWindowEnd, status (ACTIVE/REMOVED), assignedAt, assignedByUserId, dateCreated }`.
- **`PhotographerPhotoController`** (`/api/event/{eventId}/photographer/photos`): `POST /batch` (multipart `files`, `?accessLevel=`, 201, DRAFT/invisible; enforces quota + access window → 403/409 on violation); `POST /deliver` (flip all my DRAFT → DELIVERED); `GET ` (list own incl. DRAFT, with derived `state` = `processing`/`draft`/`delivered`).

---

## 12. ⚠ Breaking / behavior changes the FE must handle

1. **Waitlist duplicate signup is now anti-enumeration.** `POST /api/waitlist` returns HTTP 200 both for new and duplicate signups. On a **duplicate** the response is `{ "alreadyJoined": true, "position": null, "total": null }`. **Do not depend on `position`/`total` for duplicates** — they are intentionally null so an attacker cannot probe membership. On a new signup: `{ "alreadyJoined": false, "position": <id>, "total": <count> }`.

2. **Event media delivery is stricter.** A file/photo/variant request must resolve to *its own* event (the `{fileId}`/`{photoId}` must belong to `{eventId}`). Mismatches return 404 instead of serving bytes. Always build media URLs from the parent event you fetched them under.

3. **Canonical 429 rate-limit body + `Retry-After`.** Rate-limit rejections return the slim `{ "success": false, "message": "Rate limit exceeded. Please try again later." }` body (not the full envelope) with a `Retry-After` header. Parse `success:false` + status 429 generically and honor `Retry-After`. The AI draft tier is the strict one (10/hour).

4. **Public gallery 410 on expiry/delete.** A previously-working share link can flip to **410 Gone** (expired or unpublished/deleted). Treat 410 distinctly from 404 (never existed) in the public gallery UI.

5. **PASSWORD / INVITE_ONLY galleries require the unlock/auth step.** Photo list and byte endpoints return 401/403 until the unlock token (or eligible auth) is presented. Don't render media URLs before passing the gate.

6. **Curation REJECT requires a reason.** `state=REJECTED` (PATCH) and `action=REJECT` (bulk) fail validation without a non-empty `reason`.

---

## 13. Quick reference — all new v4.1 endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/event/ai/draft` | user (10/hr) | Generate non-persisted AI event draft |
| POST | `/api/event/{eventId}/ai/draft/apply` | user (host) | Apply agenda+accent to agenda/branding (atomic) |
| POST/GET/PUT/DELETE | `/api/event/{eventId}/venue[/{venueId}]` | user (org) | Venue CRUD |
| POST/PUT/DELETE/GET | `/api/event/{eventId}/venue/{venueId}/rooms[/{roomId}]` | user (org) | Room CRUD |
| POST/PUT/DELETE/GET | `/api/event/{eventId}/agenda/tracks[/{trackId}]` | user (org) | Track CRUD |
| POST/PUT/DELETE/GET | `/api/event/{eventId}/agenda/sessions[/{sessionId}]` | user (org) | Session CRUD |
| POST/DELETE | `/api/event/{eventId}/agenda/sessions/{sessionId}/speakers/{userId}` | user (org) | Assign/unassign speaker |
| GET | `/api/event/{eventId}/agenda` | public | Full agenda |
| POST/DELETE | `/api/event/{eventId}/schedule/sessions/{sessionId}` | user (attendee) | Personal schedule add/remove |
| GET | `/api/event/{eventId}/schedule` | user (attendee) | My personal schedule |
| PUT/GET/POST | `/api/speaker/profile[/photo]` | user (self) | Speaker profile upsert/get/photo |
| GET | `/api/speaker/{userId}/profile` | user | Public speaker profile |
| GET/PUT | `/api/org/{orgId}/branding` | user (org admin) | Org branding get/update |
| POST | `/api/org/{orgId}/branding/logo` | user (org admin) | Upload org logo |
| POST | `/api/org/{orgId}/branding/watermark-image` | user (org admin) | Upload watermark image |
| GET/POST | `/api/org/{orgId}/branding/templates` | user (org admin) | List/create branding template |
| POST | `/api/org/{orgId}/branding/templates/{templateId}/apply` | user (org admin) | Apply template |
| GET/PUT | `/api/event/{eventId}/branding` | user (host) | Event branding resolved/override |
| POST/GET | `/api/event/{eventId}/galleries` | user (host) | Create/list galleries |
| GET/PATCH/DELETE | `/api/gallery/{galleryId}` | user (host) | Gallery detail/update/delete |
| GET/POST/DELETE | `/api/gallery/{galleryId}/invites[/{email}]` | user (host) | INVITE_ONLY allow-list |
| GET | `/api/public/gallery/{shareToken}` | public | Gallery metadata |
| POST | `/api/public/gallery/{shareToken}/unlock` | public (5/min) | Unlock password gallery |
| GET | `/api/public/gallery/{shareToken}/photos` | public | List gallery photos |
| GET | `/api/public/gallery/{shareToken}/photos/{photoId}/view` | public | 302 → presigned view |
| GET | `/api/public/gallery/{shareToken}/photos/{photoId}/download` | public | 302 → presigned download |
| GET/PATCH/POST | `/api/event/{eventId}/curation/photos[/{photoId}\|/bulk]` | user (host) | Curation list/update/bulk |
| GET | `/api/event/{eventId}/analytics` | user (org) | Per-event analytics |
| GET | `/api/org/{orgId}/analytics` | user (org) | Org rollup |
| GET | `/api/org/{orgId}/analytics/leaderboard` | user (org) | Leaderboard |
| GET/POST | `/api/org/{orgId}/billing[/subscription]` | user (org admin) | Billing snapshot / tier change |
| PUT/GET/POST | `/api/photographer/profile[/photo]` | user (self) | Photographer profile |
| GET | `/api/photographer/{userId}/profile` | user | Public photographer profile |
| POST/GET/DELETE | `/api/photographer/availability[/{availabilityId}]` | user (self) | Availability windows |
| POST | `/api/event/{eventId}/photographer/photos/resumable/init` | user (assigned) | Init resumable upload |
| PUT | `/api/event/{eventId}/photographer/photos/resumable/{uploadSessionId}/part/{partNumber}` | user (assigned) | Upload one part |
| GET | `/api/event/{eventId}/photographer/photos/resumable/{uploadSessionId}` | user (assigned) | Resume status |
| POST | `/api/event/{eventId}/photographer/photos/resumable/{uploadSessionId}/complete` | user (assigned) | Complete upload (201) |
| DELETE | `/api/event/{eventId}/photographer/photos/resumable/{uploadSessionId}` | user (assigned) | Abort upload (204) |
| POST/GET | `/api/org[/{orgId}]` | user | Create/get org |
| GET | `/api/org/events` | user | List active-org events |
| GET/POST/DELETE | `/api/org/{orgId}/members[/{userId}]` | user (org) | Members list/role/remove |
| GET/POST/DELETE | `/api/org/{orgId}/invites[/{token}]` | user (org) | Org invites |
| POST | `/api/org/invites/accept` | user | Accept org invite |
| GET | `/api/org/{orgId}/photographers` | user (org admin) | Org photographers + profile/availability |
| POST/GET | `/api/event/{eventId}/photographers[/{userId}]` | user (org admin) | Assign/list/unassign photographer |
| POST/GET | `/api/event/{eventId}/photographer/photos[/batch\|/deliver]` | user (assigned) | Batch upload / deliver / list own |

---

*Verified against commit `dc3620da`.*
