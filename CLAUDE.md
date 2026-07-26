# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Before Writing Code

This project pins **Next.js 16.2.3**, a version newer than most training data. Per `AGENTS.md`, APIs, conventions, and file structure may differ from what you expect — check the bundled docs at `node_modules/next/dist/docs/` before relying on prior Next.js knowledge, and heed any deprecation notices found there.

## Development Commands

```bash
npm run dev      # start dev server at http://localhost:3000 (Turbopack)
npm run build    # production build + TypeScript check
npm run lint     # ESLint
```

Always run `npm run build` after any change to confirm TypeScript passes — the project uses strict mode and React 19.

## Browser Tooling (chrome-devtools MCP) — Explicit Request Only

Do **not** use the `mcp__chrome-devtools__*` tools, launch the debug Chrome, or start the dev server for the purpose of viewing the page unless the user has explicitly asked for it in the current request.

Explicit means the user asked in words like: "screenshot it", "open it in the browser", "check how it looks", "run the site", "verify it renders", "use chrome devtools", or invoking the `run-portfolio` skill. A request to build a feature, fix styling, or match a screenshot is **not** by itself permission to open the browser.

Without an explicit request, verify work with `npm run build` (and reading the code) and stop there. Say what was and wasn't verified rather than opening a browser to close the gap — if visual confirmation seems genuinely necessary, offer it and let the user decide.

## Stack

- **Next.js 16.2.3** — App Router, Turbopack dev, no Pages Router
- **React 19.2.4** — use `useRef<T | undefined>(undefined)` not `useRef<T>()` (breaking change in React 19)
- **Tailwind CSS v4** — configured via `@tailwindcss/postcss`; import as `@import "tailwindcss"` in globals.css (no tailwind.config.js)
- **framer-motion** — used for animations in `components/ui/`
- **TypeScript strict** — no `any`; WebGL uniform maps use `WebGLProgram & Record<string, WebGLUniformLocation | null>`

## Project Architecture

```
app/
  page.tsx          ← single-page portfolio, all sections inline
  layout.tsx        ← minimal root layout, imports globals.css
  globals.css       ← CSS custom properties + utility classes (see below)
components/ui/
  animated-shader-hero.tsx  ← WebGL2 hero with framer-motion overlays
  typewriter.tsx            ← framer-motion typewriter with spring cursor
  hero-section-1.tsx        ← HeroHeader (site nav, used by page.tsx) + reference HeroSection
  button.tsx                ← shadcn/ui button (cva variants, radix Slot)
  animated-group.tsx        ← framer-motion stagger wrapper
  text-effect.tsx           ← framer-motion per-word/char text animation
lib/
  utils.ts          ← cn() helper (clsx + tailwind-merge)
```

### CSS Design Tokens (globals.css)

All color/style tokens live in `:root` and utility classes in `globals.css` — never hardcode these values:

| Token | Value | Use |
|---|---|---|
| `--color-pink` | `#f756a3` | accent / secondary |
| `--color-lime` | `#cdfb52` | lime / primary CTA (renamed from `--color-accent`) |
| `--color-red` | `#d4423b` | clan section, decorative |
| `--color-hero-bg` | `#151a2f` | fallback hero bg |
| `--color-hero-bg-2` | `#1f2547` | fallback hero bg, secondary |

A full shadcn/ui token set (`--background`, `--muted`, `--primary`, `--border`, `--ring`, …) also lives in `:root` and is mapped through `@theme inline` so shadcn components work. `--color-accent` now belongs to shadcn — use `--color-lime` for the brand lime. Tailwind v4 defaults `border` to `currentColor`, so `@layer base` sets `border-color: var(--border)` globally.

Key utility classes: `.hero-title`, `.section-title` (Impact font + skew), `.highlight-box` (black bg inline text), `.diagonal-band` (pink rotated strip), `.clan-grid` (2-col → 1-col responsive).

### Hero Component (`animated-shader-hero.tsx`)

- WebGL2 fragment shader runs cloud FBM + comet streaks as the canvas background
- `WebGLRenderer` and `PointerHandler` classes are defined at **module scope** (not inside the hook) to avoid per-render redefinition
- `headline.line2` accepts `string | string[]` — pass an array to get the animated Typewriter instead of static text
- Sparkle decorations (`✦` / `✧`) are framer-motion `motion.span` siblings inside the `h1`
- Scroll indicator at bottom uses a pulsing `scaleY` animation
- Uses `styled-jsx` for keyframe CSS — requires `"use client"` directive

### Typewriter Component (`typewriter.tsx`)

- Root element is `<span>` (not `<div>`) — required because it renders inside `<p>` / `<h1>` in the hero
- Cursor uses spring bounce variants (scale + rotate loop) for a lively feel
- `cursorClassName` accepts Tailwind color utilities like `text-[color:var(--color-accent)]`

### Page Sections (page.tsx, top to bottom)

1. **Hero** — full-viewport WebGL shader + nav overlay + animated headline
2. **Editorial block** — white section, `.highlight-box` paragraph
3. **Diagonal band** — pink `.diagonal-band` strip with repeating ✦ icons
4. **Featured project** — dark radial gradient, placeholder card (real projects TBD)
5. **Pick Your Clan** — teal / pink split columns, red PICK YOUR CLAN overlay
6. **Contact CTA** — white, three accent dots, Play button

---

# Next.js Portfolio / Landing Page Recreation

## Goal

Recreate a full-page website as accurately as possible in Next.js using React and Tailwind CSS, based on a provided screenshot and any additional style notes.

The reference may be a highly visual landing page with custom typography, layered imagery, bold section transitions, editorial text blocks, diagonal separators, and strong art-direction. The implementation should preserve that same composition, spacing, and energy while remaining clean and maintainable in a Next.js project.

## Workflow

When the user provides a full-page screenshot and optional styles:

1. Build the page in Next.js using React and Tailwind CSS.
2. Recreate only the sections and visible content present in the screenshot.
3. Structure the page cleanly, but do not over-abstract early.
4. Match the reference first on layout and composition, then on styling details.
5. After the first pass, compare the implementation against the screenshot and identify mismatches in:
   - overall page proportions
   - section heights
   - spacing and padding
   - font size and weight
   - line height and letter spacing
   - color values
   - text placement
   - image scale and positioning
   - overlap/layer depth
   - border radii
   - shadows and glow
   - diagonal bands and dividers
   - button size and styling
   - whitespace balance
6. Fix all visible mismatches.
7. Do a second comparison pass.
8. Continue refining until the recreated page is visually very close to the reference.

Do not stop after one pass. Always do at least 2 refinement rounds.

## Technical Defaults

- Use Next.js with React
- Use Tailwind CSS for styling
- Prefer App Router unless the project already uses Pages Router
- Use `next/image` where helpful
- Use placeholder images from `https://placehold.co/` when source assets are not provided
- Keep content inline unless splitting into components clearly improves maintainability
- Use layered absolute positioning when necessary to match the visual composition
- Use custom CSS only when Tailwind utilities alone are not enough

## Reference Matching Rules

- Treat the screenshot as the source of truth
- Do not invent extra sections or content not visible in the reference
- If the user provides exact classes, tokens, or style notes, use them exactly
- If text is partially unreadable, infer the closest visually appropriate placeholder while preserving layout
- Match the mood, proportions, and hierarchy of the design, not just the rough structure
- Preserve any intentionally dramatic layout choices such as oversized type, skewed separators, floating elements, and asymmetrical spacing

## Screenshot-Specific Design Characteristics To Recreate

This type of page may include:

- a dark atmospheric hero section
- very large distorted or decorative headline typography
- centered top navigation with small text
- star-like or particle-like background details
- layered foreground scene imagery
- strong red and blue high-contrast palette in the hero
- editorial text blocks with black highlight backgrounds
- a diagonal band or ticker-like strip cutting across the layout
- oversized whitespace sections
- a featured character/product section on a dark gradient background
- a split-color selection section with centered bold heading
- sparse final call-to-action area with minimal controls

These characteristics should be recreated faithfully when present in the reference.

## What To Compare Carefully

During each refinement pass, check:

- hero headline width and distortion feel
- navbar size, spacing, and vertical placement
- amount of top empty space
- character or object placement relative to the viewport
- exact positioning of highlighted text blocks
- angle and thickness of diagonal separators
- size and spacing of decorative repeated icons
- ratio between image-heavy and whitespace-heavy sections
- vertical rhythm between sections
- heading scale in feature sections
- color block widths in split layouts
- button dimensions and placement
- responsiveness when stacking sections on smaller screens

Be specific when identifying issues. For example:
- hero title is too small by about 20 to 30px
- top navigation sits too low
- diagonal strip should be steeper and thicker
- text highlight boxes need tighter padding
- lower CTA area has too much empty space
- central red panel in the clan section is too narrow
- featured product image is not tall enough
- section transition between hero and white area is too abrupt

## Layout Priorities

Prioritize accuracy in this order:

1. overall composition
2. section heights
3. typography scale
4. image placement
5. spacing and padding
6. colors and effects
7. responsiveness

A visually correct structure matters more than premature component abstraction.

## Code Style

- Keep JSX clean and readable
- Favor Tailwind utilities first
- Use semantic HTML when helpful
- Group repeated content into arrays only when it improves clarity
- Avoid unnecessary component splitting for one-off sections
- Keep the page easy to edit after generation

## Completion Standard

A recreation is only complete when:

- the page structure closely matches the reference
- the section spacing feels aligned to the screenshot
- typography is proportionally close
- imagery and major shapes are positioned correctly
- key colors and contrast feel right
- at least 2 comparison and refinement passes have been done
- the result feels like a faithful recreation, not a loose interpretation
