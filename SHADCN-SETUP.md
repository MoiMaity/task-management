# shadcn/ui setup

Config, tokens and dependencies are already committed. What remains is
generating the component source, which the CLI does — it writes real files
into `src/components/ui/` that you then own and edit.

Run everything from `apps/web`.

## 1. Install

```bash
cd apps/web
npm install
```

`package.json` already lists what shadcn components need at runtime:
`class-variance-authority`, `lucide-react`, `tw-animate-css`, and the Radix
primitives used so far.

## 2. Generate components

Do **not** run `npx shadcn@latest init`. Init would overwrite
`src/app/globals.css` with the stock token block and replace the two-axis
theming with a plain `.dark` class. `components.json` is already written, so go
straight to adding components:

```bash
npx shadcn@latest add button dropdown-menu
```

Start with just these two — the theme menu needs them. Add the rest as you
build the screens that use them:

| Screen | Likely components |
| --- | --- |
| Login | `button`, `input`, `card`, `separator` |
| Tasks — list | `table`, `badge`, `avatar`, `checkbox`, `select`, `popover` |
| Tasks — board | `card`, `badge`, `avatar`, `scroll-area` |
| Task detail | `dialog` or `sheet`, `textarea`, `tabs`, `tooltip` |
| Settings | `tabs`, `input`, `label`, `avatar`, `alert-dialog` |
| Global | `sidebar`, `sonner`, `skeleton` |

Install per screen rather than all at once. Every generated file is code you
have to be able to explain in the interview.

## 3. Verify the CLI did not rewrite the tokens

`shadcn add` sometimes appends to the CSS. After the first run, check
`src/app/globals.css` still has:

- `@custom-variant dark (&:where([data-theme="dark"], …))` — not `.dark`
- the `[data-accent="…"]` blocks
- no duplicate `:root` block appended at the end

If it added a stock `:root`, delete the addition and keep ours.

## How the tokens map

Component classes use shadcn's names, so generated code works unmodified:

| Token | Drives |
| --- | --- |
| `--background` / `--foreground` | page surface and text |
| `--card`, `--popover` | raised surfaces |
| `--primary` | **the design's Color Mode accent** — buttons, active states |
| `--accent` | subtle hover background for menu rows, *not* the brand colour |
| `--muted-foreground` | secondary text |
| `--ring` | focus outline, follows the accent |
| `--sidebar-*` | the persistent left rail |

Two deliberate differences from a stock shadcn install:

1. **Dark mode keys off `[data-theme="dark"]`, not a `.dark` class.** One
   attribute mechanism drives both axes, so the accent selectors and the theme
   selectors compose without a second system.
2. **Color Mode maps to `--primary`, not `--accent`.** In shadcn's vocabulary
   `--accent` is the hover surface for menu items. Mapping the brand colour
   there would tint every hover state and leave buttons unchanged — the exact
   opposite of the design.

## Adding an accent later

One block in `globals.css` and one entry in `ACCENTS` in `src/lib/theme.ts`.
No component changes.
