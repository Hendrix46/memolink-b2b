# B2B "Photographer" roli — nima va nimaga dostupi bor

> Koddan tekshirilgan, evidence-based xarita (file:line bilan). Sana: 2026-06-30.
> Maqsad: "fotograf" rolida kim nimani qila oladi degan chalkashlikni yopish.

## TL;DR — eng muhim gap

**"Photographer" aslida IKKITA boshqa-boshqa narsa.** Chalkashlik shundan kelib chiqadi:

1. **Org a'zoligidagi rol `OrgMemberRole.PHOTOGRAPHER`** — backend'da **hech qanday alohida kuch bermaydi**. Bu shunchaki yorliq/flag.
2. **Event'ga biriktirish (per-event photographer assignment)** — fotografning **haqiqiy** ruxsatlari shu yerdan keladi, org rolidan emas.

Asosiy xulosa: org roli — inson uchun "label", enforcement chegarasi emas. Butun real kuch `EventAuthorizationHelper.isPhotographerFor()` (`ParticipantRole.PHOTOGRAPHER + ACTIVE`) orqali, **har bir event uchun alohida** beriladi.

---

## 1️⃣ Org roli `PHOTOGRAPHER` — deyarli inert

Enum: `OrgMemberRole { ADMIN, COORDINATOR, PHOTOGRAPHER, STAFF }`
(`jpa/enums/OrgMemberRole.java`).

`OrgAuthorizationHelper`da PHOTOGRAPHER uchun **maxsus tekshiruv yo'q**
(`service/helper/OrgAuthorizationHelper.java`):

| Metod | Qatorlar | Ruxsat | PHOTOGRAPHER o'tadimi? |
|---|---|---|---|
| `isOrgMember` | 33-35 | har qanday a'zo | ✅ |
| `isOrgAdmin` | 37-39 | faqat ADMIN | ❌ |
| `isOrgAdminOrCoordinator` | 41-44 | ADMIN/COORDINATOR | ❌ |
| `requireOrgAdmin` | 46-50 | faqat ADMIN | ❌ |
| `requireOrgAdminOrCoordinator` | 58-62 | ADMIN/COORDINATOR | ❌ |
| `canManageOrgEvent` | 69-73 | org admin/coord YOKI event host | ❌ |

`/api/org/mine`dagi `isPhotographer: true` — shunchaki **derived flag**, hech narsani ochmaydi
(`service/input/org/impl/OrgServiceImpl.java:219`).

### Org endpoint'lari — PHOTOGRAPHER nima qila oladi

| Route | Gate | Ruxsat | PHOTOGRAPHER? |
|---|---|---|---|
| `POST /api/org` (createOrg) | gate yo'q | har qanday user | ✅ |
| `GET /api/org/{orgId}` | `requireOrgMember` (:95) | a'zo | ✅ |
| `GET /api/org/events` | `isOrgMember` (:315) | a'zo | ✅ |
| `GET /api/org/mine` | user-scoped | har qanday user | ✅ |
| `POST /api/org/invites/accept` | token | taklif qilingan | ✅ |
| `GET /api/org/{orgId}/members` | `requireOrgAdmin` (:199) | ADMIN | ❌ |
| `POST /api/org/{orgId}/invites` | `requireOrgAdmin` (:106) | ADMIN | ❌ |
| `GET /api/org/{orgId}/invites` | `requireOrgAdmin` (:230) | ADMIN | ❌ |
| `PATCH /api/org/{orgId}/members/{userId}` (rol) | `requireOrgAdmin` (:241) | ADMIN | ❌ |
| `DELETE /api/org/{orgId}/members/{userId}` | `requireOrgAdmin` (:264) | ADMIN | ❌ |
| `DELETE /api/org/{orgId}/invites/{token}` | `requireOrgAdmin` (:283) | ADMIN | ❌ |

> Org darajasida fotograf = oddiy ko'ruvchi. Hech narsani boshqara olmaydi.

---

## 2️⃣ Event'ga biriktirish — asl kuch shu yerda

Alohida tizim: `photographer_assignment` jadvali
(`jpa/entity/PhotographerAssignmentEntity.java`):

- `UNIQUE(eventId, photographerId)`
- ustunlar: `eventId`, `photographerId`, `orgId`, `shootQuota` (nullable), `accessWindowStart/End` (nullable), `status`, `assignedAt`, `assignedByUserId`
- status enum: `PhotographerAssignmentStatus { ACTIVE, REMOVED }`
  (`jpa/enums/PhotographerAssignmentStatus.java`)

**Kim biriktiradi:** faqat **ADMIN yoki COORDINATOR**
(`api/controller/event/PhotographerAssignmentController.java`, gate `isOrgAdminOrCoordinator`):

| Endpoint | Ruxsat |
|---|---|
| `POST /api/event/{eventId}/photographers` (assign) | ADMIN/COORDINATOR |
| `DELETE /api/event/{eventId}/photographers/{userId}` (unassign) | ADMIN/COORDINATOR |
| `GET /api/event/{eventId}/photographers` (list) | ADMIN/COORDINATOR |

Biriktirishda event-participant qatori yaratiladi:
`ParticipantRole.PHOTOGRAPHER + ParticipantStatus.ACTIVE`
(`PhotographerAssignmentServiceImpl` → `eventParticipantSyncHelper.sync(...)`).

### Biriktirilgan ACTIVE fotograf nima qila oladi

Gate: `EventAuthorizationHelper.isPhotographerFor(eventId, userId)` (:39-42) →
`existsByEventIdAndUserIdAndRoleAndStatus(..., PHOTOGRAPHER, ACTIVE)`.

| Imkoniyat | Endpoint / manba | File:line |
|---|---|---|
| **50 GB + resumable** yuklash (oddiy = 500 MB, resumable yo'q) | multipart/resumable door | `UploadLimitPolicy.java:36`, `MultipartUploadServiceImpl.java:207` |
| Batch rasm yuklash | `POST /api/event/{id}/photographer/photos/batch` | `PhotographerPhotoController.java:60` |
| O'z **DRAFT** rasmlarini ko'rish | `GET /api/event/{id}/photographer/photos` | `:86` |
| DRAFT → DELIVERED (e'lon qilish) | `POST /api/event/{id}/photographer/photos/deliver` | `:74` |
| PRIVATE event'ni ko'rish (biriktirilgan bo'lsa) | `GET /api/event/{id}` | participant gate |
| Menga biriktirilgan event'lar ro'yxati | `GET /api/event/list?filter=assigned` | `EventController.java:185` |

### Upload limit logikasi

`service/helper/UploadLimitPolicy.java:30-41`:

```java
public EffectiveLimit resolve(final String userId, final UploadTarget target) {
    if (target.getKind() == UploadTarget.Kind.CAPSULE) {
        return new EffectiveLimit(upload.getCapsuleFileMaxBytes(), false);   // 250 MiB, resumable yo'q
    }
    final boolean photographer = eventAuthorizationHelper.isPhotographerFor(target.getEventId(), userId);
    if (photographer) {
        return new EffectiveLimit(upload.getMultipartMaxBytes(), true);      // 50 GiB, resumable HA
    }
    return new EffectiveLimit(upload.getEventFileMaxBytes(), false);         // 500 MiB, resumable yo'q
}
```

Resumable door faqat fotografga ochiq (`MultipartUploadServiceImpl.java:203-209`):
```java
final UploadLimitPolicy.EffectiveLimit limit =
        uploadLimitPolicy.resolve(userId, UploadTarget.event(request.getParentId()));
if (!limit.resumableAllowed()) {
    throw new UserNotOwnerException();   // oddiy yuklovchi 403
}
```

Event javobida ko'rinadi (`contract/response/GetEventResponseContract.java:100-107`):
`myFileUploadMaxBytes` (500 MB / 50 GB), `resumableUploadAllowed` (faqat ACTIVE fotograf uchun `true`).

---

## 3️⃣ "Dashboard"da fotograf nima ko'radi

Backend'da bitta "dashboard" endpoint **yo'q** — bu client UI tushunchasi. Uni quyidagilar to'ldiradi:

- `GET /api/org/mine` → qaysi org, roli (label + `isPhotographer` flag)
- `GET /api/event/list?filter=assigned` → **menga biriktirilgan event'lar** (asosiy ish ro'yxati)
- har event ichida: o'z rasmlari (DRAFT/DELIVERED), yuklash limiti
  (`myFileUploadMaxBytes`, `resumableUploadAllowed`)

**Qila olmaydi** (host-only): attendee ro'yxati, check-in/QR, host boshqaruvi, event yaratish/tahrirlash.

---

## 4️⃣ To'liq qobiliyat matritsasi

| Qobiliyat | ADMIN | COORDINATOR | PHOTOGRAPHER | STAFF | Enforcing |
|---|:--:|:--:|:--:|:--:|---|
| Org yaratish | ✅ | ✅ | ✅ | ✅ | gate yo'q |
| Org o'qish | ✅ | ✅ | ✅ | ✅ | `OrgServiceImpl:95` |
| A'zolarni ko'rish | ✅ | ❌ | ❌ | ❌ | `:199 requireOrgAdmin` |
| Taklif qilish | ✅ | ❌ | ❌ | ❌ | `:106` |
| Taklif qabul qilish | ✅ | ✅ | ✅ | ✅ | `:149` token |
| Rol o'zgartirish | ✅ | ❌ | ❌ | ❌ | `:241` |
| A'zo o'chirish | ✅ | ❌ | ❌ | ❌ | `:264` |
| Org event'larini ko'rish | ✅ | ✅ | ✅ | ✅ | `:315 isOrgMember` |
| Event yaratish (org) | ✅ | ✅ | ❌ | ❌ | event org gate |
| Event tahrirlash/bekor qilish | ✅ | ✅ | ❌ | ❌ | `OrgAuthorizationHelper:82-87` |
| Host qo'shish/olib tashlash | ✅ | ❌* | ❌ | ❌ | host-only |
| Attendee qo'shish/olib tashlash | ✅ | ✅* | ❌ | ❌ | host gate |
| Check-in / QR | ✅ | ✅* | ❌ | ❌ | host-only |
| Fotograf biriktirish/olib tashlash | ✅ | ✅ | ❌ | ❌ | `PhotographerAssignmentServiceImpl:69/106` |
| Rasm yuklash (oddiy) | ✅ | ✅ | ❌* | ✅ | attendee gate |
| Rasm yuklash (biriktirilgan fotograf) | — | — | ✅ | — | `PhotographerPhotoServiceImpl:102` |
| Resumable 50GB yuklash | ❌ | ❌ | ✅ | ❌ | `UploadLimitPolicy:36`, `MultipartUploadServiceImpl:207` |
| O'z DRAFT rasmlarini ko'rish | ❌ | ❌ | ✅ | ❌ | `PhotographerPhotoController:86` |
| DRAFT → DELIVERED | ❌ | ❌ | ✅ | ❌ | `:74` |
| PRIVATE event ko'rish (biriktirilgan) | (host) | (host) | ✅ | ❌ | participant gate |
| Biriktirilgan event'lar ro'yxati | — | — | ✅ | — | `EventController:185 filter=assigned` |

\* COORDINATOR ba'zi host op'larda endpoint bo'yicha farq qiladi (ba'zilari host-only).
PHOTOGRAPHER "oddiy rasm yuklash"ni event-darajasidagi assignment orqali oladi, org rolidan emas.

---

## 5️⃣ Tugallanmagan joylar (gap'lar)

- `shootQuota` va `accessWindow` `photographer_assignment`da **saqlanadi**, lekin **faqat batch upload**da (Phase 54) qisman tekshiriladi.
  **Resumable (50GB) yo'lda access-window tekshiruvi YO'Q** (`PhotographerAssignmentEntity.java:32-34` izoh; `ResumableUploadController`da window check yo'q).
  → Biriktirilgan fotograf access-window tashqarisida ham katta fayl yuklay oladi.
- `shootQuota` Phase 53'da faqat storage — "never read/enforced" deb belgilangan.

---

## Bir jumlada

Org `PHOTOGRAPHER` roli — inson uchun yorliq, backend'da kuchi yo'q. Haqiqiy fotograf qobiliyatlari (50GB yuklash, batch/draft/deliver, biriktirilgan event'larni ko'rish) **har bir event uchun alohida biriktirish** (`photographer_assignment`, `ParticipantRole.PHOTOGRAPHER + ACTIVE`) orqali beriladi va `EventAuthorizationHelper.isPhotographerFor()` bilan tekshiriladi.
