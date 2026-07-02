# Memolink — Backend Issues & Observations

Frontend (dashboard) integratsiyasi davomida topilgan **ochiq** backend / kontrakt / swagger
muammolari. Hal qilinganlari olib tashlangan.

> Sana: 2026-07-02 · Manba: `swagger.json` (joriy) + `backend-buglist-status-2026-07.md`
> (branch `fix/dashboard-buglist-260630`) + live API kuzatuvlari
> Belgilar: 🔴 blocker · 🟠 major · 🟡 minor · 🔵 docs/nice-to-have
>
> **2026-07 backend batch'ida tuzatilgan va frontend'da integratsiya qilinganlar:**
> A1/A2/A5 (gallery mediaType/uploader/audio-thumbnail), A4-L1/L2 + E5 (UTC millis + event
> `timezone`), B1 (presigned `/url` sibling'lar — frontend to'liq o'tdi), C1 (register token'lar —
> adaptiv), D1/D2 (swagger), E1 (org-scoping path — eski endpoint frontend'da ishlatilmaydi),
> E6 (org members / photographers / speakers'da ism-avatar — frontend kontrakt ismini afzal ko'radi,
> directory-cache fallback qoladi).

---

## Ochiq itemlar

### 1. ⚙️ A3 — Variant-generation pipeline (OPS, userlarga ta'sir qilyapti)
- **Observed:** Real eventlarda ko'p fayl `processingStatus: FAILED/PENDING`, `READY` yo'q —
  variant'lar (THUMBNAIL/SMALL/…) yaratilmagan, preview'lar bo'sh.
- **Holat:** Kod bug emas — prod'da media_job **re-enqueue + worker diagnostikasi** kerak
  (backend hisobotida ham alohida ish deb belgilangan).

### 2. 📄 C2 — OTP / verification flow hujjati
- OTP TTL, resend cooldown, `verificationToken` muddati — qiymatlar kodda bor, hujjat yo'q.

### 3. 🆕 E2 — Ticketing backendi
- Ticket tier CRUD + event bilan bog'lash endpointlari yo'q (AI draft `ticketTypes` hint xolos).
- Frontend'da ticket UI olib tashlangan; endpoint kelganda qaytariladi.

### 4. 🆕 E3 — Org-darajasidagi yagona galereya
- `GET /api/org/{orgId}/photos` (aggregat media + pagination) hali yo'q; frontend har eventni
  alohida (`useQueries`) yig'yapti.

### 5. 🆕 E4-guest — Akkauntsiz tashqi spiker
- Speaker'ga ism/avatar qo'shildi (E6 ✅), lekin Memolink akkaunti yo'q **guest speaker**
  (ism + headline) hali qo'llab-quvvatlanmaydi.

### 6. ⏳ A4-L3 — Timestamp'larda `Z`/offset
- Millis normalizatsiya + event `timezone` bor; instant'larga `Z`/offset qo'shish **mobile bilan
  kelishilgan release'ga** qoldirilgan. Frontend naive-wall-clock taxminida ishlayapti.

---

## ⚠️ Swagger drift (sinxronlash kerak)

Joriy `swagger.json` backend branch'idagi ba'zi o'zgarishlarni **hali aks ettirmaydi** —
frontend bu joylarda hisobotga tayanib, **adaptiv** (optional maydonlar) qilib kodlangan:

| O'zgarish | Hisobot | swagger.json |
|---|---|---|
| B1 `/url` presign sibling'lar + `MediaUrlResponseContract` | ✅ | ✅ bor |
| E1 `GET /api/org/{orgId}/events` (path) | ✅ | ❌ hali `/api/org/events` |
| C1 register javobida `accessToken/refreshToken` | ✅ | ❌ yo'q |
| E6 `firstName/lastName/avatarUrl` (members/photographers/speakers) | ✅ | ❌ yo'q |
| A4-L2/E5 event `timezone` maydoni | ✅ | ❌ yo'q |
| D1 `securitySchemes` (bearerAuth) | ✅ | ❌ yo'q |

**Fix:** backend deploy'idan keyin swagger'ni qayta generatsiya qilib repoga qo'yish.

---

_Eslatma: 1–6 backend jamoasi uchun; swagger drift — hujjat sinxronligi._
