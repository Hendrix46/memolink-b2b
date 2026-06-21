# Memolink — Enterprise Event Dashboard

A media-first, dark, premium dashboard for **enterprise / B2B clients**: organizers run
events and curate incoming media; photographers upload from the field. One shell, two
role-gated lenses.

> This is the customer-facing product. It is **separate** from `memolink-admin`, which is
> for internal team administration only.

Built from the approved design spec (`Memolink Dashboard.dc.html` + the UI/UX contract) with
a production-grade, maintainable architecture.

## Stack

| Concern              | Choice                                   |
| -------------------- | ---------------------------------------- |
| Framework            | React 18 + TypeScript (strict)           |
| Build                | Vite 6                                    |
| Styling              | Tailwind CSS v4 (design tokens via `@theme`) |
| Server state         | TanStack React Query v5                  |
| Client state         | Zustand v5                               |
| Routing              | React Router v6 (data router)            |
| i18n                 | react-i18next (en · ru · uz)             |
| Date / time pickers  | react-day-picker + date-fns              |
| Icons                | lucide-react                             |
| Font                 | Geist / Geist Mono                       |

## Internationalization (i18n)

Full UI translation in **English, Russian and Uzbek** via `react-i18next`. Every user-facing
string across every screen reads from the locale files in `src/app/i18n/locales/{en,ru,uz}.json`
— there are no hardcoded UI strings in components. Status vocabularies, KPI labels, validation,
toasts, empty/error states and the event-builder are all translated.

- Language is switched from the top-bar globe and **persisted to `localStorage`** (with browser-
  language auto-detection on first load).
- Date pickers render with the active locale (`date-fns` locales), so calendars localize too.
- Rich interpolated sentences (e.g. the activity feed) use `<Trans>` for correct word order
  per language.

### Date & time pickers

Native browser date/time inputs are replaced with a themed **`react-day-picker`** calendar
(`shared/ui/DatePicker`) and a popover **`TimePicker`**, both styled to the dark palette and
wired into the event builder (Basics dates/times, Agenda session times).

## Architecture — Feature-Sliced Design (FSD)

Strict, one-directional layer imports (`app → pages → widgets → features → entities → shared`).
A layer may only import from layers **below** it. Each slice exposes a small public API via its
`index.ts`; deep imports across slices are avoided.

```
src/
├── app/            # composition root: providers, router, i18n, global styles
│   ├── i18n/       # i18next init + en/ru/uz locale files
│   ├── providers/  # React Query provider
│   ├── router/     # routes, route paths re-export, auth guard
│   └── styles/     # Tailwind + design tokens (global.css)
├── pages/          # one folder per route screen (thin; compose widgets/features/entities)
│   ├── dashboard/  events/  event-new/  event-detail/ (+ tabs/)
│   ├── auth/       # login / register / forgot-password
│   └── org-branding/ -delivery/ -analytics/ -team/ -billing/ -settings/
├── widgets/        # composite UI blocks: app-shell, sidebar, topbar
├── features/       # user interactions w/ their own state:
│   │               #   auth, command-palette, notifications, locale-switch,
│   │               #   event-builder, media-curation (selection + bulk bar + lightbox),
│   │               #   media-upload (organizer image/video/audio upload)
│   └──
├── entities/       # domain models + their api/hooks/ui:
│   │               #   session, event, media, kpi, activity
│   └──
└── shared/         # framework-agnostic foundation:
    ├── ui/         # design-system primitives (Button, Card, Modal, Toast, …)
    ├── lib/        # cn, formatters, visual seed helpers
    ├── api/        # mock transport + shared seed data
    └── config/     # status registry, query keys, route paths
```

### Key design decisions

- **Single status source of truth** (`shared/config/status.ts`) — every badge/tile/chip derives
  its color + label from one registry, never an inline color (design spec §8.1).
- **Server vs client state are separated** — React Query owns fetched data (events, media,
  photographers); Zustand owns ephemeral UI (selection, lightbox, upload queue, sidebar, lens).
- **Role gating in one place** — the active `lens` (Zustand) re-gates navigation, and
  `RequireLens` redirects cross-lens URL access gracefully (never a raw 403, §8.4).
- **Mock API mirrors a real one** — `shared/api/mock-client.ts` simulates latency + failures so
  loading / error / retry paths are real. Swapping to the live Memolink API is a per-entity
  `api` file change; signatures stay identical.
- **Every screen has empty / loading / error states** with skeletons that match final layout (§8.4).

## Implemented surfaces

**Auth (public):** Login · Register (create workspace) · Forgot password — split-screen layout,
inline validation, show/hide password, mock auth via React Query mutations. Session is persisted
to `localStorage` (Zustand `persist`); `RequireAuth` gates every protected route and `RedirectIfAuthed`
keeps signed-in users out of the auth screens. Sign-out lives in the top-bar account menu.

> Demo sign-in: any valid email + a 6+ character password (pre-filled on the login screen).

**Organizer (the product):** Dashboard · Events (cards/table + filters) · **Event builder** (fully
dynamic, fully customizable wizard — see below) · Event detail
(Overview, **Media library** ★ (upload + delete, image/video/audio), Agenda, Registrations,
Branding, Delivery, Analytics, Settings) · Branding templates · Delivery · Analytics ·
Team & Roles · Billing · Settings.

### Scope decision — organizer-only, no photographer role

This is a **B2B dashboard for the enterprise client (the organizer)**. There is **no photographer
role anywhere** — the organizer's own team uploads and curates media directly. The photographer
concept (entity, directory, per-event tab, assignment, lens) was removed entirely.

**Media is uploaded by the organizer**, from the event's Media tab (`features/media-upload`), and
can be **image, video or audio** (`MediaType = 'image' | 'video' | 'audio'`). There is **no review
workflow** (no approve/reject/feature) — media is *upload + delete only*. The grid supports
multi-select (click + shift-click range), a type filter, full-screen viewing, and **bulk delete
with one-tap Undo** (deleted assets are restored if the user hits Undo on the toast). Uploads and
deletes run through React Query mutations that invalidate the media cache so the grid stays live.
The grid, lightbox and type filter render the three formats distinctly (audio shows a waveform +
player; video shows a play affordance + duration).

### Premium UX layer

Grounded in the organizer's journey (create → collect → deliver → measure):

- **Confidence:** bulk delete is reversible (Undo toast); optimistic mutations; "saved" toasts.
- **Delivery as a moment:** publishing a gallery plays a **restrained success seal** — a ring +
  checkmark that draw themselves with a single calm ping (no particles; enterprise-appropriate) —
  and elegantly reveals the live share card with link + QR + copy + "preview as attendee", plus a
  pre-publish readiness note. (`shared/ui/SuccessCheck`)
- **Activation:** an empty workspace gets a **guided 3-step onboarding hero**; the dashboard
  surfaces events that still need setting up.
- **Command center:** ⌘K with create / navigate / event search; **saved views** (events list view +
  filter + density persist to localStorage); a comfortable/compact **density toggle**; **actionable
  notifications** that deep-link into the right event tab.
- **Delight:** KPI values **count up** on load (`AnimatedNumber`), real **SVG charts** (`AreaChart`,
  `DonutChart`) replace flat sparklines in analytics, positive framing ("18% above your average"),
  and subtle page-entrance motion — all gated by `prefers-reduced-motion`.

### Event builder (`features/event-builder`)

A B2B-grade, **dynamic** event-creation flow. The client picks which capabilities the event
uses (agenda, registrations, ticketing, media gallery, QR check-in, delivery, networking,
livestream); **enabling a capability adds its own configuration step** — so the wizard adapts to
each event. Fully customizable:

- **Custom registration form builder** — add your own attendee fields (text / email / number /
  dropdown / checkbox), required or optional.
- **Dynamic ticket tiers** — priced tiers with quantities and perks.
- **Agenda builder** — sessions with time, speaker, room and track.
- **Branding** — accent color (presets + custom), gallery layout, cover, welcome message, watermark.
- **Live preview** — a sticky panel re-renders on every keystroke and toggle.

All draft state lives in one Zustand store (`event-draft-store.ts`); steps and the preview read
from it, reset on submit/unmount.

**Cross-cutting:** ⌘K command palette · notifications · full-screen lightbox review with keyboard
shortcuts (← → navigate, A/R/F decide, Esc close) · bulk selection & actions · toasts.

## Scripts

```bash
npm run dev        # start dev server (http://localhost:5180)
npm run build      # typecheck (tsc -b) + production build
npm run preview    # serve the production build
npm run typecheck  # type-only check
```

## Notes

- Backend is intentionally deferred (design spec §11). All data comes from the in-memory mock
  layer; quotas, transcode states and counts are UI assumptions to be wired to the Memolink
  backend later.
- Placeholder media uses deterministic gradients (`shared/lib/visual.ts`) so the UI reads as
  "full of media" without binary assets.
