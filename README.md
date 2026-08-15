# Task Management System

Full-stack task management application built for the Full Stack Developer
(Fresher) technical assessment.

> **Status: scaffold.** Infrastructure, theming and API conventions are in
> place. Screens are built once the Figma design is available — see
> [Deviations from the design](#deviations-from-the-design).

---

## Live demo

| | |
| --- | --- |
| **App** | _TODO: deployed URL_ |
| **API** | _TODO: deployed URL_ `/api` |

No credentials needed — choose **Continue as guest** on the login screen.

## Screenshots

_TODO: desktop and mobile, one row per theme._

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | Next.js (App Router) | Server components keep the initial task list out of a client-side fetch waterfall. |
| Styling | Tailwind CSS v4 | CSS-first config lets themes live as CSS variables rather than a JS config object. |
| Backend | NestJS | Module boundaries and DI make the auth/tasks split explicit and the services testable in isolation. |
| Database | MongoDB + Mongoose | Tasks are self-contained documents with no cross-entity joins, so a document store fits the access pattern. |
| Language | TypeScript throughout | A shared types package means the API contract is compiler-checked on both sides. |

## Getting started

**Prerequisites:** Node.js 20.11+, npm 10+, and a MongoDB instance (local, or a
free MongoDB Atlas cluster).

```bash
git clone <repo-url>
cd task-management
npm install

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# edit apps/api/.env — set MONGODB_URI and a JWT_SECRET of 32+ characters

npm run dev
```

Web on <http://localhost:3000>, API on <http://localhost:4000/api>.

### Scripts

| Command | Effect |
| --- | --- |
| `npm run dev` | Both apps in watch mode |
| `npm run dev:web` / `npm run dev:api` | One app only |
| `npm run build` | Shared package, then API, then web |
| `npm run typecheck` | `tsc --noEmit` across every workspace |
| `npm run lint` | ESLint across every workspace |
| `npm test` | API unit tests |

## Architecture

```
task-management/
├── apps/
│   ├── api/                    NestJS REST API
│   │   └── src/
│   │       ├── config/         typed env access + boot-time validation
│   │       ├── common/         filters, interceptors, decorators
│   │       └── modules/        auth, users, tasks
│   └── web/                    Next.js client
│       └── src/
│           ├── app/            routes, layouts, global styles
│           ├── components/     ui/ (generic) · layout/ · theme/
│           └── lib/            api client, hooks, theme registry, utils
├── packages/
│   └── shared/                 types used by both apps
└── docs/                       Part 2 write-up
```

**Why a monorepo.** One deliverable repository, and `packages/shared` gives the
task contract a single definition. If the API renames a field, the web build
fails at compile time instead of rendering `undefined` in production.

**Why `ui/` is separate from feature components.** Components in
`components/ui/` take props and render; they know nothing about tasks. Feature
components compose them. That boundary is what makes a component reusable in
practice rather than just in name.

### API conventions

Three global pieces in `main.ts` do most of the work, so controllers stay thin:

- **`ValidationPipe`** with `whitelist` and `forbidNonWhitelisted` — unknown
  fields are rejected rather than silently dropped, so a client typo surfaces
  as a 400 instead of a field that mysteriously never saves.
- **`TransformInterceptor`** — every success wraps as `{ success: true, data }`.
- **`HttpExceptionFilter`** — every failure becomes
  `{ success: false, error: { code, message, details } }`, with
  `class-validator` messages regrouped by field name so the frontend can attach
  them to the right input without parsing strings.

Environment variables are validated at boot (`config/env.validation.ts`). A
missing `JWT_SECRET` crashes the process on startup rather than surfacing as a
500 on the first login.

### API reference

_TODO once the modules land._

| Method | Path | Auth | Body | Returns |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/guest` | — | — | `{ accessToken, user }` |
| GET | `/api/auth/me` | Bearer | — | `User` |
| GET | `/api/tasks` | Bearer | — | `Paginated<Task>` |
| POST | `/api/tasks` | Bearer | `CreateTaskInput` | `Task` |
| PATCH | `/api/tasks/:id` | Bearer | `UpdateTaskInput` | `Task` |
| DELETE | `/api/tasks/:id` | Bearer | — | `{ id }` |

## Theming

Themes are semantic CSS variables under `[data-theme="..."]` selectors in
`app/globals.css`, mapped into Tailwind's namespace with `@theme inline`.

The `inline` keyword is load-bearing: without it Tailwind resolves each
variable at build time and every theme renders identically. With it, the
generated utility keeps the `var()` reference, so switching the attribute on
`<html>` re-themes the page instantly with no React re-render.

Deliberately **not** using Tailwind's `dark:` variant as the mechanism — it
only expresses two states, and adding a third theme would mean touching every
component. Adding one here means adding one CSS block.

Persistence uses `localStorage` plus a blocking inline script (`ThemeScript`)
in `<head>`. The script runs before first paint, so a refresh never shows a
flash of the wrong theme. `suppressHydrationWarning` on `<html>` is required
because that script legitimately mutates an attribute the server rendered.

## Design decisions

**JWT in `localStorage`, not an httpOnly cookie.** The web app and API deploy
to different origins; a cookie would need `SameSite=None; Secure` and
credentialed CORS. `localStorage` plus an `Authorization` header is simpler and
easier to reason about. The trade-off is real: a successful XSS can read the
token, which an httpOnly cookie prevents. For a production app handling real
user data I would use httpOnly cookies with a refresh-token rotation and accept
the CORS configuration cost.

**Guest-only auth.** The brief asks for guest login specifically. Each guest
gets a persisted user document, and every task query filters by the
authenticated user id taken from the token — never from the request body.

_TODO: add decisions made once the design lands (responsive strategy,
component API choices)._

## Deviations from the design

_TODO. The brief requires intentional deviations to be documented; state
"none" explicitly if there are none._

## Responsive approach

_TODO: breakpoints used and what changes at each._

## Testing

_TODO: what is covered and what is not._

## What I'd do next

- Optimistic updates on task mutations
- E2E coverage of the guest-login → create-task path
- Real authentication alongside guest sessions
- Server-side pagination cursors instead of page/limit for large lists
