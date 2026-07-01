# hubzero — Complete Project Analysis

> Produced by reading every source file, data file, configuration, and public asset in the repository.
> This document is intended to serve as complete technical documentation for rebuilding the project from scratch.

---

## 1. Project Overview

### Purpose

HubZero is the official website of Hub Zero — a creative technology collective based in Bhatkal, Karnataka, India. The site serves two primary audiences:

1. **Potential clients** — showcasing services (web development, UI/UX, branding, SEO), client work (case studies), and a contact path.
2. **Team & professional network** — each team member has a dedicated portfolio page under their username (e.g., `/rifaque`, `/iyad`).

The site also includes a public-facing blog and an internal markdown editor tool for writing blog posts.

### Overall Architecture

- **Monorepo root:** `hubzero/`
- **Application root:** `hubzero/client/` (the only application)
- No separate backend server — all data is static JSON or filesystem-based markdown
- Contact forms delegate to third-party services (Formspree, FormSubmit.co)
- No database connection, no authentication, no API routes

### Tech Stack

| Concern                                    | Technology                                                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Framework                                  | Next.js 15.3.8 (App Router)                                                                                                           |
| Language                                   | TypeScript 5                                                                                                                          |
| UI Library                                 | React 19                                                                                                                              |
| Styling                                    | Tailwind CSS 4                                                                                                                        |
| Animation                                  | GSAP 3 + ScrollTrigger, Framer Motion 12                                                                                              |
| Blog editor                                | Monaco Editor (via `@monaco-editor/react`)                                                                                            |
| Markdown processing — blog editor preview  | remark + rehype pipeline (remark-gfm, remark-rehype, rehype-highlight, rehype-raw, rehype-stringify) via `lib/blog/markdown-utils.ts` |
| Markdown processing — published blog posts | `remark` + `remark-html` only — **no GFM, no syntax highlighting** (see §7.9)                                                         |
| Typewriter effect                          | `react-simple-typewriter`                                                                                                             |
| Icons                                      | `react-icons` 5                                                                                                                       |
| Analytics                                  | Vercel Analytics + Speed Insights                                                                                                     |
| Form handling                              | Formspree (company contact), FormSubmit.co (portfolio contact)                                                                        |
| Sitemap                                    | `next-sitemap`                                                                                                                        |
| PWA                                        | `site.webmanifest` (standalone display)                                                                                               |

### Framework Versions

- `next`: 15.3.8
- `react` / `react-dom`: 19.0.0
- `typescript`: ^5

### Styling Approach

- Tailwind CSS 4 via `@tailwindcss/postcss` (not the legacy v3 CLI)
- `darkMode: 'class'` — theme toggling via `.light` class on `<html>`
- Dark mode is the **default** (no class needed; `:root` sets dark variables)
- Light mode activates when `.light` class is on the root element
- Custom CSS variables defined in `globals.css` using OKLCH color space
- Color tokens: `--bg`, `--bg-dark`, `--bg-light`, `--text`, `--text-muted`, `--border`, `--border-muted`, `--primary`, `--secondary`, `--accent`, `--danger`, `--warning`, `--success`, `--info`, glow gradient vars, home gradient vars
- Tailwind plugins: `@tailwindcss/typography`, `@tailwindcss/line-clamp`, `tailwind-scrollbar`

### Folder Structure

```
hubzero/
├── README.md                          # Project overview
├── .gitignore
└── client/                            # The Next.js application
    ├── next.config.ts                 # Next.js config (has bug — missing export default)
    ├── next-sitemap.config.js         # Sitemap config (siteUrl: hubzero.in)
    ├── tailwind.config.ts             # Tailwind config
    ├── tsconfig.json                  # TypeScript config
    ├── eslint.config.mjs              # ESLint config (flat config format)
    ├── postcss.config.mjs             # PostCSS config
    ├── package.json                   # Dependencies and scripts
    ├── content/
    │   └── blog/
    │       └── devpilot-readme.md     # The only existing blog post
    ├── public/
    │   ├── favicon.ico
    │   ├── HubZeroLogoICO.png         # Brand logo
    │   ├── og-image.png               # Default Open Graph image
    │   ├── site.webmanifest           # PWA manifest
    │   ├── robots.txt                 # Generated by next-sitemap
    │   ├── sitemap.xml / sitemap-0.xml
    │   ├── resume/
    │   │   └── Rifaque-Ahmed-Resume.pdf
    │   ├── data/
    │   │   └── team.json              # Fetched client-side by /team page
    │   ├── images/
    │   │   ├── team/                  # Team member photos (Rifaque, Iyad, Raif, Sultan, Salsabeel)
    │   │   ├── rifaque/               # Rifaque's OG images + favicon
    │   │   ├── project1-4.png         # Service tile icons
    │   │   ├── graphics-design.png    # AboutSection image
    │   │   ├── web-design.png         # AboutSection image
    │   │   └── discord/youtube/instagram icons
    │   └── projectscreenshots/        # Project thumbnails (7 screenshots)
    └── src/
        ├── app/                       # Next.js App Router
        │   ├── layout.tsx             # Root layout
        │   ├── globals.css            # Global styles + CSS variables
        │   ├── page.tsx               # / (Home)
        │   ├── not-found.tsx          # 404 page
        │   ├── about/page.tsx
        │   ├── contact/page.tsx
        │   ├── team/page.tsx
        │   ├── thanks/page.tsx
        │   ├── privacy-policy/page.tsx
        │   ├── work/
        │   │   ├── page.tsx
        │   │   └── bhatkaltimeluxe/page.tsx
        │   ├── blog/
        │   │   ├── page.tsx
        │   │   └── [slug]/page.tsx
        │   ├── blog-editor/page.tsx
        │   ├── branding/page.tsx
        │   ├── web-development/page.tsx
        │   ├── ui-ux/page.tsx
        │   ├── seo/page.tsx
        │   ├── rifaque/page.tsx
        │   ├── iyad/page.tsx
        │   ├── sultan/page.tsx
        │   ├── raif/page.tsx
        │   └── salsabeel/page.tsx
        ├── components/
        │   ├── Navbar.tsx
        │   ├── Footer.tsx
        │   ├── Home.tsx
        │   ├── AboutSection.tsx
        │   ├── ProjectSection.tsx
        │   ├── Testimonials.tsx
        │   ├── CTASection.tsx
        │   ├── FadeInSection.tsx
        │   ├── PortfolioClient.tsx
        │   ├── CommandTerminal.tsx
        │   ├── CmdButton.tsx
        │   └── blog/
        │       ├── BlogIndex.tsx
        │       ├── BlogPostLayout.tsx
        │       ├── BlogPostPreviewLayout.tsx
        │       ├── MarkdownPreview.tsx    # Appears unused
        │       ├── ReadingProgressBar.tsx
        │       └── useReadingProgress.ts
        ├── data/                          # Static JSON for portfolio pages
        │   ├── rifaque.json
        │   ├── iyad.json
        │   ├── sultan.json
        │   ├── raif.json
        │   ├── salsabeel.json
        │   └── team.json                  # Duplicate of public/data/team.json (with different content!)
        ├── lib/
        │   ├── blog.ts                    # Server-only blog file system reader
        │   ├── markdownToHtml.ts          # Full remark/rehype pipeline (appears unused)
        │   └── blog/
        │       └── markdown-utils.ts      # Frontmatter parser + client-side HTML converter
        └── types/
            └── portfolio.d.ts             # PortfolioData type definition
```

### Build Process

```bash
npm run dev       # Next.js dev server
npm run build     # next build && next-sitemap (generates sitemap + robots.txt)
npm run start     # Production server
npm run lint      # ESLint
```

### Environment Variables

No `.env` file or `.env.local` is present in the repository. No `process.env.*` reads exist in the Next.js source code. The project has zero server-side environment variable requirements for its core functionality.

Note: `dotenv` is listed as a dependency but is never imported or used in any source file.

### Deployment

- **Server:** Ubuntu Server 24.04 LTS (self-hosted)
- **Reverse Proxy:** NGINX
- **CDN / Security:** Cloudflare (DNS, HTTPS, DDoS protection)
- **Domain:** hubzero.in
- **CI/CD:** Manual — `npm run build` then shell script (`deploy.sh` at project root, not committed)
- **Image optimization:** Disabled (`images: { unoptimized: true }` in next.config.ts)
- **Trailing slash:** Enabled in config (`trailingSlash: true`) — but see §16 for a critical config bug

---

## 2. Application Structure

### App Router Structure

The application uses Next.js 15's App Router. There is exactly **one** root layout (`src/app/layout.tsx`) with no nested layouts.

### Layout Hierarchy

```
RootLayout (src/app/layout.tsx)
└── <html lang="en">
    └── <body class="geist-sans geist-mono antialiased">
        ├── {children}
        ├── <Analytics />        ← Vercel Analytics
        └── <SpeedInsights />    ← Vercel Speed Insights
```

The root layout is a **Server Component** that:

- Loads Geist Sans and Geist Mono fonts from Google Fonts
- Applies base CSS variable tokens
- Injects global analytics scripts

### Shared Layouts

There are **no nested layouts** (`layout.tsx` files only at root). Every page is responsible for rendering its own `<Navbar />` and `<Footer />`. This is a repeated pattern — the navbar and footer are manually imported in every page component.

### Templates

No `template.tsx` files exist.

### Client vs Server Components

| Component / Page                | Type             | Reason                                               |
| ------------------------------- | ---------------- | ---------------------------------------------------- |
| `layout.tsx`                    | Server           | No hooks                                             |
| `page.tsx` (home)               | Server           | Only re-exports `<Home />`                           |
| `Home.tsx`                      | Client           | `'use client'` — imports client components           |
| `about/page.tsx`                | Client           | GSAP animations                                      |
| `contact/page.tsx`              | Client           | Framer Motion animation                              |
| `team/page.tsx`                 | Client           | `useEffect` + `fetch`                                |
| `work/page.tsx`                 | Client           | GSAP animations                                      |
| `work/bhatkaltimeluxe/page.tsx` | Client           | GSAP animations                                      |
| `blog/page.tsx`                 | **Server**       | Uses `getAllPostsMeta()` (server-only)               |
| `blog/[slug]/page.tsx`          | **Server**       | Uses `getPostBySlug()` (server-only)                 |
| `blog-editor/page.tsx`          | Client           | Monaco editor, no SSR                                |
| `branding/page.tsx`             | Server           | Static content only                                  |
| `web-development/page.tsx`      | Server           | Static content only                                  |
| `ui-ux/page.tsx`                | Server           | Static content only                                  |
| `seo/page.tsx`                  | Server           | Static content only                                  |
| `rifaque/page.tsx`              | Server (wrapper) | Metadata only; passes to Client                      |
| `iyad/page.tsx`                 | Server (wrapper) | Metadata only                                        |
| `sultan/page.tsx`               | Server (wrapper) | Metadata only                                        |
| `raif/page.tsx`                 | Server (wrapper) | Metadata only                                        |
| `salsabeel/page.tsx`            | Server (wrapper) | Metadata only                                        |
| `privacy-policy/page.tsx`       | Client           | Framer Motion animation                              |
| `thanks/page.tsx`               | Client           | Framer Motion animation                              |
| `not-found.tsx`                 | Client           | `useEffect` + Framer Motion                          |
| `Navbar.tsx`                    | Client           | `useState`, `useRef`, `useEffect`, `AnimatePresence` |
| `Footer.tsx`                    | Server           | No hooks                                             |
| `AboutSection.tsx`              | Client           | GSAP `useEffect` + `useRef`                          |
| `ProjectSection.tsx`            | Client           | GSAP `useEffect` + `useRef`                          |
| `Testimonials.tsx`              | Client           | GSAP + `useState`                                    |
| `CTASection.tsx`                | Client           | `'use client'` (but has no hooks — could be server)  |
| `FadeInSection.tsx`             | Client           | Framer Motion                                        |
| `PortfolioClient.tsx`           | Client           | Many hooks, keyboard events                          |
| `CommandTerminal.tsx`           | Client           | `useRouter`, keyboard events                         |
| `CmdButton.tsx`                 | Client           | `onClick`                                            |
| `BlogIndex.tsx`                 | Client           | Scroll listener                                      |
| `BlogPostLayout.tsx`            | Client           | Reading progress, scroll listener                    |
| `BlogPostPreviewLayout.tsx`     | Client           | Reading progress, scroll listener                    |
| `MarkdownPreview.tsx`           | Client           | `useEffect` async remark                             |
| `ReadingProgressBar.tsx`        | Client           | DOM manipulation                                     |
| `useReadingProgress.ts`         | Client           | Scroll listener hook                                 |

### Route Groups

None used.

### Middleware

No `middleware.ts` file exists.

### Metadata

- Root layout: `title: "Hub Zero"`, `description: "Building the Future of Technology and Design"`, `icon: "/favicon.ico"`
- Each page exports its own `metadata` object overriding the root defaults
- Portfolio pages additionally set OG images, Twitter card, keywords, canonical URLs, viewport color, and Schema.org JSON-LD structured data via `<Head>`

### Dynamic Routes

- `/blog/[slug]` — dynamically generates blog post pages from `.md` files in `content/blog/`

### Static Routes (explicitly defined)

Every other route is a static page file:
`/`, `/about`, `/contact`, `/team`, `/work`, `/work/bhatkaltimeluxe`, `/blog`, `/blog-editor`, `/branding`, `/web-development`, `/ui-ux`, `/seo`, `/rifaque`, `/iyad`, `/sultan`, `/raif`, `/salsabeel`, `/privacy-policy`, `/thanks`

### Route Tree

```
/
├── (home)                     → page.tsx → Home.tsx
├── about                      → about/page.tsx
├── contact                    → contact/page.tsx
├── team                       → team/page.tsx
├── work
│   ├── (index)                → work/page.tsx
│   └── bhatkaltimeluxe        → work/bhatkaltimeluxe/page.tsx
├── blog
│   ├── (index)                → blog/page.tsx
│   └── [slug]                 → blog/[slug]/page.tsx
├── blog-editor                → blog-editor/page.tsx
├── branding                   → branding/page.tsx
├── web-development            → web-development/page.tsx
├── ui-ux                      → ui-ux/page.tsx
├── seo                        → seo/page.tsx
├── rifaque                    → rifaque/page.tsx
├── iyad                       → iyad/page.tsx
├── sultan                     → sultan/page.tsx
├── raif                       → raif/page.tsx
├── salsabeel                  → salsabeel/page.tsx
├── privacy-policy             → privacy-policy/page.tsx
├── thanks                     → thanks/page.tsx
└── * (404)                    → not-found.tsx
```

---

## 3. Every Page

### 3.1 Home Page

- **URL:** `/`
- **File:** `src/app/page.tsx` → `src/components/Home.tsx`
- **Type:** Server (page.tsx) + Client (Home.tsx)
- **Data:** None — all content is hardcoded in components

**Visible Sections:**

1. **Navbar** (fixed, top) — Logo + nav links + "GET IN TOUCH"
2. **Hero Section** — Full-screen, centered. H1: "Welcome to HubZero Community". Subtext describing services. Single CTA button: "GET IN TOUCH" → `/contact`
3. **AboutSection** — Stats grid (6 items: clients, satisfaction, team size, year founded, ongoing projects, availability). Below: "Hubzero Family Guide" with 2 image+text pairs about graphics and web design
4. **ProjectSection** — 2-column layout: H2 "Our Projects & Fields" + 4 service tiles (Software & Hardware Solutions, Website Development, SEO, Branding & Ads)
5. **Testimonials** — Carousel with 3 testimonials, left/right arrow buttons, pagination dots
6. **CTASection** — "Join Hubzero Team" with two paragraphs + link. Below: "Contact Us" section with gradient button → `/contact`
7. **Footer**

**Animations:**

- Hero section wrapped in `FadeInSection` (Framer Motion fade-in, 1.3s)
- `AboutSection`: GSAP `fromTo` on scroll — section fades in, stats stagger in, "Family Guide" section fades in, grid items stagger
- `ProjectSection`: GSAP `fromTo` on scroll — section fades, project tiles stagger
- `Testimonials`: GSAP `fromTo` on each testimonial change (slide from left)
- Background: absolute gradient overlay (`--home-grad-1` to `--home-grad-2`, blur-2xl)

**Interactions:**

- Testimonials prev/next buttons cycle through 3 testimonials
- "GET IN TOUCH" CTA scrolls to contact page

**SEO:**

- `title: "HubZero | Home"`, full OpenGraph + Twitter card metadata
- OG image: `/og-image.png`
- `locale: "en_IN"`

**Responsive:** Mobile-first, hero uses `sm:text-6xl`, section breaks at `md:` breakpoints

---

### 3.2 About Page

- **URL:** `/about`
- **File:** `src/app/about/page.tsx`
- **Type:** Client (`'use client'`)
- **Data:** None — all hardcoded

**Visible Sections:**

1. **Navbar**
2. **Hero** — Full-screen. H1 (gradient text): "Redefining Digital Experiences". Subtext about HubZero. Button: "Explore Our Vision" → scrolls to `#values`
3. **What We Do** — 3 service cards: Web Development, UI/UX Design, Brand Strategy
4. **Our Story** — Two-column text + decorative blur blob. Text: "Founded in 2024…"
5. **Core Values** (`id="values"`) — 3 cards: Collaboration 🤝, Excellence 🎯, Innovation 🚀
6. **Team CTA** — H2 "Meet Our Team" + button → `/team`
7. **Footer**

**Animations:**

- All 5 sections use GSAP `scrollTrigger` (`fromTo opacity:0 y:50 → opacity:1 y:0`, `toggleActions: 'play none none reverse'`)

**Buttons:**

- "Explore Our Vision" → anchor `#values`
- "View Team Profiles" → `/team`

**SEO:** No custom metadata exported (inherits root layout default: "Hub Zero")

---

### 3.3 Contact Page

- **URL:** `/contact`
- **File:** `src/app/contact/page.tsx`
- **Type:** Client
- **Data:** None

**Visible Sections:**

1. **Navbar**
2. **Contact Form** — Glassmorphism card. H1: "Contact Us". Subtext: "Have an idea or a question? Reach out! ✨"
3. **Footer**

**Form:**

- Action: `https://formspree.io/f/xqalkylo` (POST)
- Fields: Name (required), Email (required), Message (required, textarea 5 rows)
- Hidden fields: `_captcha: false`, `_template: table`, `_subject: "New message from HubZero Website"`, `_next: https://hubzero.in/thanks`
- Submit button: "Send Message" (blue-500)
- On success: Formspree redirects to `/thanks`

**Animations:** Framer Motion `initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}`

**Validation:** HTML5 `required` attributes only — no client-side validation logic

**Background:** Two absolute blur orbs (teal + purple)

---

### 3.4 Team Page

- **URL:** `/team`
- **File:** `src/app/team/page.tsx`
- **Type:** Client
- **Data:** Fetched from `/data/team.json` (public directory) via `fetch` in `useEffect`

**Data Loading:**

```
useEffect → fetch('/data/team.json') → setTeam(data)
```

The fetch happens on the client after mount. No loading state is shown while data loads (the grid is simply empty until the data arrives).

**Visible Sections:**

1. **Navbar**
2. **Hero** — Gradient H1: "Meet the HubZero Team". Animated underline bar. Subtext about the team.
3. **Team Grid** — Responsive grid (1→2→3 columns). Each card: avatar image, name, role (in blue), short bio. Each card is a `<Link href="/{username}">`.
4. **Footer**

**Animations:**

- H1: Framer Motion `initial={{ opacity: 0, y: -30 }}`
- Underline bar: `initial={{ scaleX: 0 }}` (scale animation)
- Subtext: `initial={{ opacity: 0 }}`
- Cards: staggered `custom={i}` variants with delay `i * 0.15`

**Team Members (from `/public/data/team.json`):**

| Name                 | Username  | Role                      |
| -------------------- | --------- | ------------------------- |
| Rifaque Ahmed        | rifaque   | Full Stack Developer      |
| Mohammed Iyad        | iyad      | UI/UX Designer            |
| Raif Karani          | raif      | Software Engineer         |
| Syed Mohammad Sultan | sultan    | Branding & SEO            |
| Salsabeel Kobattey   | salsabeel | Electronics & Integration |

**Navigation:** Each card links to `/{username}` → individual portfolio page

**Empty State:** When `team` state is empty (before fetch completes), the grid renders nothing

**Error State:** Console.error only — no UI error state

---

### 3.5 Work Page (Case Studies)

- **URL:** `/work`
- **File:** `src/app/work/page.tsx`
- **Type:** Client
- **Data:** Hardcoded array `caseStudies` (1 active item, 2 commented out)

**Visible Sections:**

1. **Navbar**
2. **Hero** — 60vh height. Gradient H1: "Our Work & Case Studies". Subtext.
3. **Case Study Grid** — Currently only 1 case study: "Bhatkal Time Luxe". Image + title + subtitle + "View Case Study →" link
4. **CTA** — "Want to work with us?" → `/contact`
5. **Footer**

**Animations:** GSAP `scrollTrigger` on all 3 sections

**Case Studies:**

| Title                                | Link                    |
| ------------------------------------ | ----------------------- |
| Bhatkal Time Luxe                    | `/work/bhatkaltimeluxe` |
| _(Mobile App UI/UX — commented out)_ |                         |
| _(SEO Campaign — commented out)_     |                         |

---

### 3.6 Work — Bhatkal Time Luxe Case Study

- **URL:** `/work/bhatkaltimeluxe`
- **File:** `src/app/work/bhatkaltimeluxe/page.tsx`
- **Type:** Client
- **Data:** Hardcoded

**Visible Sections:**

1. **Navbar**
2. **Hero** — H1: "Bhatkal Time Luxe". Description. Large hero image (ecommerce-thumbnail.png)
3. **Details Grid** — Two columns: "Project Overview" (text) and "Tech Stack" (bullet list)
4. **CTA** — "Visit Live Site →" → `https://bhatkaltimeluxe.in` (external, new tab)
5. **Footer**

**Animation:** GSAP `fromTo` on the section ref on scroll

**Tech Stack listed:**

- Frontend: React.js + TailwindCSS
- Animations: GSAP + ScrollTrigger
- Deployment: Ubuntu Server + Cloudflare Tunnel
- Performance: WebP images, Lazy loading, CDN
- SEO: Structured data, meta tags, sitemap

---

### 3.7 Blog Index

- **URL:** `/blog`
- **File:** `src/app/blog/page.tsx` → `src/components/blog/BlogIndex.tsx`
- **Type:** Server (page) → Client (component)
- **Data:** `getAllPostsMeta()` — reads all `.md` files from `content/blog/` on the server at request time

**Visible Sections:**

1. **Sticky Header** — Back button (←) + "HubZero Blog" subtitle. Hides on desktop until user scrolls 120px.
2. **Hero** — H1: "Stories at the intersection of design, engineering & strategy." Subtext. Category pills. CTA: "← Back to HubZero" + "Browse posts ↓". Featured card (the first/newest post).
3. **Promo Strip** — Placeholder ad slot (320×80). States "Minimal ad space. Reserve for announcements or promos."
4. **Posts Grid** — 3-column responsive. Each card: category pill, title, summary (line-clamp-3), author + date + reading time, tags (up to 4), "Read article →" link.
5. **Footer** — Links: HubZero Home, Team, Work with us.

**Current Blog Posts:** 1 post — "Introducing DevPilot" (by Rifaque Ahmed, 2025-11-28, 8 min read, category: "Product", tags: ai, development, productivity, automation)

**Empty State:** "No posts yet. Check back soon."

**SEO:** `title: "Blog | HubZero"`, `description: "Insights, case studies, and guides from the HubZero team."`

---

### 3.8 Blog Post Page

- **URL:** `/blog/[slug]`
- **File:** `src/app/blog/[slug]/page.tsx` → `src/components/blog/BlogPostLayout.tsx`
- **Type:** Server (page) → Client (layout)
- **Data:** `getPostBySlug(slug)` — reads specific `.md` file, processes with remark-html

**Data Loading Flow:**

1. `generateStaticParams()` returns all slugs from `getAllPostsMeta()` → generates static pages at build time
2. `generateMetadata()` fetches post for dynamic title/description
3. `getPostBySlug(slug)` → reads file → parses frontmatter → converts markdown to HTML
4. On `notFound()`: shows Next.js 404 page

**Visible Sections:**

1. **Reading Progress Bar** — Fixed top, sky-to-violet gradient, tracks scroll through `#blog-reading-root`
2. **Sticky Header** — Back to `/blog` button. Appears after 120px scroll on desktop.
3. **Hero** — Post metadata (author, date, reading time). H1 (post title). Summary. Category + tags.
4. **Promo Strip** — Placeholder ad slot (468×60).
5. **Article Body** — `dangerouslySetInnerHTML` with custom Tailwind arbitrary-CSS classes for headings, lists, code blocks, blockquotes, links, images.
6. **Read More Section** — Up to 3 more posts from `allPosts.filter(p => p.slug !== slug).slice(0, 3)`
7. **Footer**

**Metadata:** Dynamic — `${post.title} | HubZero Blog`, `description: post.summary`

---

### 3.9 Blog Editor

- **URL:** `/blog-editor`
- **File:** `src/app/blog-editor/page.tsx`
- **Type:** Client (entire page)
- **Purpose:** Internal tool for writing blog posts. Writers write markdown, preview the full blog post layout, then download a `.md` file to send to Rifaque for publishing.

**Visible Sections:**

1. **Top Bar** — Back button (←), "HubZero Blog Editor" title, Help button (?), Download button (disabled if frontmatter invalid)
2. **Info Stripe** — Workflow steps. Frontmatter validation errors (yellow list).
3. **Left Panel (Markdown Editor)** — Monaco Editor, `vs-dark` theme, word wrap on, no minimap
4. **Right Panel (Blog Preview)** — Live `BlogPostPreviewLayout` re-rendering on each keystroke

**State:**

- `markdown` — editor content (initialized with `FRONTMATTER_TEMPLATE`)
- `isModalOpen` — download slug modal
- `isHelpOpen` — help modal
- `renderedHtml` — async markdown → HTML result
- `parsedMeta` — parsed frontmatter fields
- `issues` — frontmatter validation errors

**Interactions:**

- Typing in Monaco editor → debounced parse → updates preview in real time
- ⬇ Download button → opens `DownloadModal` (only if `issues.length === 0`)
- `DownloadModal` — user types a slug → click "Download .md" → triggers browser download as `{slug}.md` + shows `alert()`
- `HelpModal` — explains 6-step workflow
- `?` button → opens HelpModal
- `← ` link → navigates to `/`

**Validation (parseFrontmatterStrict):** Requires: `title`, `summary`, `author`, `date` (YYYY-MM-DD), `category`, `tags` (array of strings), `readingTimeMinutes` (number). Any missing field adds to `issues[]` and disables the download button.

**Monaco Config:** `fontSize: 13`, no minimap, word wrap, line numbers, smooth scrolling, automatic layout

**SEO:** None (no `metadata` export) — this is an internal tool

---

### 3.10 Service Pages (Web Development, UI/UX, Branding, SEO)

These four pages follow the exact same structure.

- **URLs:** `/web-development`, `/ui-ux`, `/branding`, `/seo`
- **Files:** Respective `page.tsx` files
- **Type:** Server Components
- **Data:** None — hardcoded

**Shared Structure:**

1. **Navbar**
2. **Content** — Centered container `max-w-4xl`, padded `py-32`. H1 (service name). Subtext. 2-column grid: left column (bulleted service list), right column (why choose us / description). Bottom CTA button → `/contact`
3. **Footer**

**CTA Buttons:**

- Web Development: "Start Your Project"
- UI/UX: "Talk to a Designer"
- Branding: "Brand With Us"
- SEO: "Improve Your SEO"

**SEO:** Each page exports `metadata` with title and description.

---

### 3.11 Portfolio Pages (rifaque, iyad, sultan, raif, salsabeel)

- **URLs:** `/rifaque`, `/iyad`, `/sultan`, `/raif`, `/salsabeel`
- **Files:** Each has a `page.tsx` (Server wrapper) that imports data from `src/data/{username}.json` and renders `<PortfolioClient data={data} />`
- **Type:** Server wrapper → Client component

**Server wrapper does:**

1. Exports rich `metadata` (title, description, keywords from skills, OG, Twitter card, canonical URL)
2. Renders Schema.org `Person` JSON-LD via `<Head>` (Note: `next/head` in App Router may not work as expected)
3. Sets `viewport.themeColor: '#0e0e10'`

**Portfolio sections (PortfolioClient.tsx):**

1. **Custom Navbar** — Fixed. Brand name `<name />` in code style. Nav buttons scroll to sections. Mobile hamburger menu.
2. **Hero** (`id="hero"`) — Full-screen. Username path. Animated cursor. Typewriter effect (react-simple-typewriter). "Download Resume" button + social links (GitHub, LinkedIn, Email).
3. **About** (`id="about"`) — Bio paragraphs (data.about[0-2]). Social links. Location.
4. **Experience** (`id="experience"`) — Optional (only if `data.experience` exists). Vertical timeline with cards. Each: role, company, location, date range, description bullets, tech tags.
5. **Education** (`id="education"`) — Optional (only if `data.education` exists). Cards: degree, institution, location, dates, details.
6. **Skills** (`id="skills"`) — Category cards with icon mapping. Each skill badge: icon + label. Framer Motion stagger animation on badges.
7. **Projects** (`id="projects"`) — Filter buttons (by category). Grid of project cards: screenshot, name, date range, description, tech tags, GitHub/Demo links.
8. **Contact** (`id="contact"`) — Two-column: contact form (FormSubmit.co) + contact info card (email, phone, location) + social links card (GitHub, LinkedIn).
9. **Scroll to Top** — Fixed button, visible after 300px scroll, hidden when terminal is open.
10. **Footer** — Copyright. Discord/YouTube/Instagram icons (not linked — decorative).
11. **CMD Button** — Fixed bottom-left. Opens CommandTerminal.
12. **CommandTerminal** — Modal terminal (see §4.10).

**Features unique to rifaque:**

- Custom favicon (`/images/rifaque/RSX-favicon.ico`)
- Custom OG images (thumbnail.png + thumbnail-square.png)
- Resume PDF at `/resume/Rifaque-Ahmed-Resume.pdf`
- `experience` and `education` sections rendered (others may not have these)

---

### 3.12 Privacy Policy

- **URL:** `/privacy-policy`
- **File:** `src/app/privacy-policy/page.tsx`
- **Type:** Client
- **Data:** None — hardcoded

**Sections:** 7 numbered sections (Information We Collect, How We Use, Data Security, Third-Party Forms, Cookies & Analytics, Policy Updates, Contact Us). Formspree and FormSubmit privacy policy links. Last updated: July 16, 2025.

**Animation:** Framer Motion on H1 and first paragraph.

---

### 3.13 Thanks Page

- **URL:** `/thanks`
- **File:** `src/app/thanks/page.tsx`
- **Type:** Client

**Content:** Large winking smiley icon. H1 "Thank You!". "Your message has been sent." Framer Motion card entrance. "Back to Home" button → `/`.

**Purpose:** Redirect target after Formspree contact form submission.

---

### 3.14 404 Not Found

- **File:** `src/app/not-found.tsx`
- **Type:** Client

**Content:** `document.title = '404 – Page Not Found'` in useEffect. H1 "404 – Page Not Found". Two buttons: "GO HOME" (gradient) → `/`, "CONTACT SUPPORT" → `/contact`. Framer Motion entrance animation. Background is hardcoded `bg-black text-white` (ignores CSS variables).

---

## 4. Components

### 4.1 Navbar

**File:** `src/components/Navbar.tsx`

**Purpose:** Global site navigation. Fixed at top of every HubZero page (NOT used on portfolio pages — those have their own navbar).

**Props:** None

**Internal State:**

- `isOpen: boolean` — services dropdown open/closed
- `isMobileMenuOpen: boolean` — mobile overlay open/closed

**Hooks:** `useState`, `useRef`, `useEffect`

**Behavior:**

- Desktop: Logo (left), nav links centered, "GET IN TOUCH" (right)
- Mobile: Logo + hamburger icon; clicking hamburger reveals full-screen overlay menu
- Services dropdown: opens on button click, closes on outside click (via `mousedown` listener on document)
- Hamburger toggles mobile menu; opening mobile menu closes the services dropdown

**Navigation Links:**

- Logo → `/` (`<Link>`)
- ABOUT US → `/about` (`<a>` — plain anchor, causes full page reload)
- OUR SERVICES dropdown: Web Development, UI/UX Design, Branding, SEO Optimization (all `<a>` — plain anchors, full page reload)
- WORK WITH US → `/work` (`<Link>` — client-side navigation)
- BLOG → `/blog` (`<Link>` — client-side navigation)
- GET IN TOUCH → `/contact`

**Note:** ABOUT US and all four service dropdown items use native `<a href>` instead of Next.js `<Link>`. This causes full page reloads for those navigations, while WORK WITH US and BLOG use client-side transitions. Inconsistent and undocumented.

**Known Bugs:**

- Mobile menu "WORK WITH US" links to `/contact` instead of `/work`
- Mobile menu "BLOG" links to `#blog` (anchor) instead of `/blog`

**Commented-out feature:** Full theme toggle (dark/light mode) with `useTheme` hook, `localStorage`, and `BsSunFill`/`BsMoonFill` icons. The CSS variables for light mode exist in `globals.css` but the toggle is disabled.

**Animation:** Framer Motion `AnimatePresence` for the services dropdown (`opacity + y`) and mobile menu (`height + opacity`).

**Dependencies:** `framer-motion`, `next/link`, `next/image`, `react-icons/fi`

---

### 4.2 Footer

**File:** `src/components/Footer.tsx`

**Purpose:** Global site footer. Used on all HubZero company pages. **Not used on blog pages** — `BlogIndex.tsx` and `BlogPostLayout.tsx` each embed their own custom `<footer>` (different branding: "HubZero Journal", different links).

**Props:** None

**Type:** Server Component (no hooks)

**Content:**

- Left column: "HUBZERO TEAM" heading. Links: About Us, Work with Us, Terms of Use & Privacy Policy
- Right column: Logo image + "HUBZERO" + "© 2025 HubZero Team. All Rights Reserved."

**Dependencies:** `next/link`, `next/image`

---

### 4.3 Home

**File:** `src/components/Home.tsx`

**Purpose:** Composes the entire home page layout from sub-components.

**Props:** None

**Type:** Client (`'use client'` but has no hooks — orchestration only)

**Children:** `Navbar`, `FadeInSection` (wraps hero), `AboutSection`, `ProjectSection`, `Testimonials`, `CTASection`, `Footer`

**Background:** Absolute gradient div (`--home-grad-1` → `--home-grad-2`, blur-2xl, 600px height) behind the hero.

---

### 4.4 AboutSection

**File:** `src/components/AboutSection.tsx`

**Purpose:** "About Hubzero" section on the home page. Stats + "Hubzero Family Guide".

**Props:** None

**Internal state:** None

**Refs:** `sectionRef`, `statsRef[]`, `familyGuideRef`, `gridItemsRef[]`

**Hooks:** `useRef`, `useEffect`

**Stats data (hardcoded):**

```
6+   — Clients satisfied
100% — Satisfaction Guaranteed (gradient card)
~12  — Hubzero Teammates
2023 — Since
4+   — Ongoing projects
24/7 — Availability
```

**Images used:** `/images/graphics-design.png`, `/images/web-design.png`

**Animations:** Four separate GSAP `fromTo` animations, all scroll-triggered.

**Dependencies:** `gsap`, `gsap/ScrollTrigger`, `next/image`

---

### 4.5 ProjectSection

**File:** `src/components/ProjectSection.tsx`

**Purpose:** "Our Projects & Fields" section on the home page. Shows 4 service tiles.

**Props:** None

**Hardcoded projects:**

```
SOFTWARE & HARDWARE SOLUTIONS → /images/project1.png
WEBSITE DEVELOPMENT           → /images/project2.png
SEO                           → /images/project3.png
BRANDING & ADS                → /images/project4.png
```

**Layout:** Bottom two tiles are offset down by `md:translate-y-10` for a staggered look.

**Hover effect:** `hover:scale-105`

**Animations:** Two GSAP `fromTo` on scroll (section + tiles stagger).

**Dependencies:** `gsap`, `gsap/ScrollTrigger`, `next/image`

---

### 4.6 Testimonials

**File:** `src/components/Testimonials.tsx`

**Purpose:** Client testimonials carousel.

**Props:** None

**Internal state:** `currentTestimonial: number` (index 0-2)

**Hardcoded testimonials (3):**

1. Anonymous "Business Owner" / "Bhatkally Startup Owner" — praises advertisement posters
2. "Sarah Johnson" / "Tech Entrepreneur" — praises UI/UX design (appears to be a placeholder name)
3. "David Smith" / "E-commerce Owner" — praises SEO (appears to be a placeholder name)

**Navigation:** Left/right arrow buttons (`FaArrowLeft`/`FaArrowRight`), circular (wraps around). Pagination dots below.

**Animation:** GSAP `fromTo` on `testimonialRef` every time `currentTestimonial` changes.

**Dependencies:** `gsap`, `gsap/ScrollTrigger`, `react-icons/fa`, `next/image`

---

### 4.7 CTASection

**File:** `src/components/CTASection.tsx`

**Purpose:** "Join Hubzero Team" + "Contact Us" calls-to-action.

**Props:** None

**Type:** Client (but no hooks used — unnecessary `'use client'`)

**Content:**

- Left: Gradient H2 "Join Hubzero Team"
- Right: Two paragraphs about the team + "Learn more about working with us →" link → `/contact`
- Below: "Contact Us" heading + description + gradient "GET IN TOUCH" button → `/contact`

---

### 4.8 FadeInSection

**File:** `src/components/FadeInSection.tsx`

**Purpose:** Wraps any children in a Framer Motion fade-in on mount.

**Props:** `{ children: React.ReactNode }`

**Animation:** `initial={{ opacity: 0 }} animate={{ opacity: 1 }}` over 1.3s

**Dependencies:** `framer-motion`

---

### 4.9 PortfolioClient

**File:** `src/components/PortfolioClient.tsx`

**Purpose:** Full individual portfolio page renderer. Used by all 5 portfolio pages.

**Props:**

```typescript
{ data: PortfolioData & { experience?: ExperienceItem[]; education?: EducationItem[] } }
```

**Internal State:**

- `showTopBtn: boolean` — scroll-to-top button visibility
- `showCmd: boolean` — terminal open/closed
- `history: string[]` — terminal command history
- `menuOpen: boolean` — mobile nav open/closed
- `filter: string` — project category filter ('All' or specific category)

**Hooks:** `useState`, `useEffect`

**Key behaviors:**

- Scroll listener shows/hides "↑ Top" button after 300px
- Global keyboard listener: backtick/tilde toggles terminal
- Dynamic nav sections: computed from data (includes `experience` and `education` only if they exist)
- Project filtering: dynamic categories from `data.projects.flatMap(p => p.categories)`
- Smooth scroll to sections on nav click

**Icon system:**

- `categoryIconMapping`: 20+ categories → React icon elements
- `skillIconMapping`: 60+ skill names → React icon elements (large mapping)
- Skills and categories are matched dynamically by string key

**Where Used:** `rifaque/page.tsx`, `iyad/page.tsx`, `sultan/page.tsx`, `raif/page.tsx`, `salsabeel/page.tsx`

**Dependencies:** Massive icon import from `react-icons` (fa, si, vsc, pi, fi, ai, go, bi, tb, gi, md, bs, lu), `framer-motion`, `react-simple-typewriter`, `next/image`, `CommandTerminal`, `CmdButton`

**Potential improvements:**

- The icon mappings are enormous static objects that ship to every portfolio client bundle
- Skills not in `skillIconMapping` silently get no icon (no fallback icon)
- The footer renders Discord/YouTube/Instagram icons without links (decorative only)

---

### 4.10 CommandTerminal

**File:** `src/components/CommandTerminal.tsx`

**Purpose:** Easter egg terminal overlay on portfolio pages. Keyboard shortcut: backtick/tilde to open, Escape to close.

**Props:**

```typescript
{
  data: PortfolioData;
  show: boolean;
  onToggle: () => void;
  history: string[];
  setHistory: Dispatch<SetStateAction<string[]>>;
}
```

**Internal State:**

- `input: string` — current input
- `commandIndex: number` — for arrow key history navigation
- `commandHistory: string[]` — all submitted commands
- `suggestions: string[]` — tab-completion suggestions

**Supported Commands (30):**
`help`, `skills`, `projects`, `contact`, `clear`, `whoami`, `theme`, `exit`, `ls` (alias: `projects`), `about`, `open [github|linkedin|resume]`, `cd [username]`, `resume`, `version`, `uptime`, `logs`, `env`, `fortune`, `neofetch`, `date`, `ascii`, `coffee`, `sudo`, `hack`, `echo [text]`, `man [command]`, `install [package]`, `matrix`, `vim`, `rm`

**Special behaviors:**

- `cd [username]` → navigates to `/{username}` via `useRouter`
- `open github/linkedin/resume` → opens in new tab
- `resume` → opens resume PDF in new tab
- Tab completion for commands + `cd` usernames
- Arrow up/down for command history
- Click outside terminal area → closes terminal
- Typing anywhere on the page opens terminal (backtick)

**Known Issues:**

- `TEAM_USERNAMES` is hardcoded as `["rifaque", "iyad", "sultan", "junaid", "abdul"]` — "junaid" and "abdul" don't exist as pages, so `cd junaid` would navigate to a 404
- Terminal output uses `dangerouslySetInnerHTML` to render HTML spans for colored username prompt — this is safe since the HTML is constructed internally, not from user input directly (but the output of the command IS from user input via `echo`)

**Dependencies:** `useRouter`, `PortfolioData` type

---

### 4.11 CmdButton

**File:** `src/components/CmdButton.tsx`

**Purpose:** Fixed bottom-left button that toggles the CommandTerminal.

**Props:** `{ onClick: () => void }`

**Visual:** Rounded pill, terminal icon + "CMD" text, blue border, dark background. Hover inverts colors.

---

### 4.12 BlogIndex

**File:** `src/components/blog/BlogIndex.tsx`

**Purpose:** Blog listing page UI.

**Props:** `{ posts: BlogPostMeta[] }`

**Internal State:** `scrolled: boolean` — for sticky header visibility

**Layout:** First post = featured card in hero. All posts (including first) shown in the grid below. Categories extracted dynamically.

**Dependencies:** `next/link`, `clsx`, blog types

---

### 4.13 BlogPostLayout

**File:** `src/components/blog/BlogPostLayout.tsx`

**Purpose:** Full blog post reading page.

**Props:** `{ post: BlogPost; morePosts: BlogPostMeta[] }`

**Internal State:** `scrolled: boolean`

**Note:** Has a `console.log(post.contentHtml)` left in a `useEffect` on **line 21** — a debug statement that should be removed before production.

**Dependencies:** `ReadingProgressBar`, `useReadingProgress`, `next/link`, `clsx`

---

### 4.14 BlogPostPreviewLayout

**File:** `src/components/blog/BlogPostPreviewLayout.tsx`

**Purpose:** Preview version of BlogPostLayout used inside the Blog Editor. Navigation links are non-functional buttons (to prevent navigation in preview context). Contains placeholder "Read more" cards.

**Props:** `{ meta: BlogPostPreviewMeta; contentHtml: string }`

**Placeholder Posts (3 hardcoded):**

1. "Designing for local brands with global standards"
2. "From wireframe to launch in two weeks"
3. "Why performance matters more than ever"

---

### 4.15 MarkdownPreview

**File:** `src/components/blog/MarkdownPreview.tsx`

**Purpose:** Simple markdown → HTML renderer using just `remark` + `remark-html`. Strips frontmatter before rendering.

**Props:** `{ value: string; className?: string }`

**Status:** **Appears unused** — the blog editor uses `markdownBodyToHtml()` from `lib/blog/markdown-utils.ts` and `BlogPostPreviewLayout` instead. This component uses the simpler `remark-html` pipeline and `prose` Tailwind classes.

---

### 4.16 ReadingProgressBar

**File:** `src/components/blog/ReadingProgressBar.tsx`

**Purpose:** Thin gradient bar at the very top of the page indicating reading progress.

**Props:** `{ progress: number }` (0-100)

**Animation:** CSS `scaleX` transform on the fill div.

---

### 4.17 useReadingProgress

**File:** `src/components/blog/useReadingProgress.ts`

**Purpose:** Custom hook that measures scroll progress through a specific DOM element.

**Params:** `targetId: string` — ID of the element to track

**Returns:** `number` (0-100)

**Logic:** `(scrollY - elementTop) / (elementHeight - viewportHeight) * 100`, clamped 0-100. Snaps to 100 when clamped > 99.

---

## 5. UI/UX

### Navigation

- **Main Navbar:** Fixed top, blurred background (`backdrop-blur-md`), transparent. Logo left, nav centered, CTA right. Services has dropdown. Mobile has full-width overlay.
- **Portfolio Navbar:** Dark fixed bar, code-styled logo, section scroll buttons.
- **Blog Navbar:** Fixed compact header that appears after 120px scroll (on desktop hidden initially).

### Menus

- **Services Dropdown:** Framer Motion animated, closes on outside click
- **Mobile Menu:** Animated `height` transition, 80vw width, rounded 2xl

### Header / Footer

- See §4.2 (Footer) and §4.1 (Navbar)

### Animations

- **Entry animations (GSAP):** All major sections on company pages use GSAP ScrollTrigger `fromTo(opacity:0 y:50 → opacity:1 y:0)` with `expo.out` or `power2.out` easing
- **Entry animations (Framer Motion):** Used on portfolio page cards (stagger), hero sections (`opacity: 0, y: ±30` → normal)
- **Typewriter:** `react-simple-typewriter` on portfolio hero
- **Custom CSS animations:**
  - `animate-blink` — blinking cursor (1s step-end infinite)
  - `animate-fade-in` — 0.3s fade (used in 404 page)
  - `animate-slide-in` — 0.4s slide up (used in terminal)

### Cards

- **Team cards:** Glassmorphism (`bg-white/5 border border-white/10 backdrop-blur-lg`), hover scale 1.04
- **Project cards:** Dark background, glow shadow on hover (`box-shadow: 0 0 20px #3ABEFF33`), hover translate-y-1
- **Service cards (about page):** `bg-[var(--bg-light)] border border-[var(--border-muted)]`, hover shadow + scale 1.02
- **Blog cards:** `bg-slate-900/80 border-slate-800`, hover `border-sky-500/60`

### Buttons

- **Primary CTA:** Gradient `from-[#665DCD] via-[#5FA4E6] to-[#D2AB67]`, white text, `hover:opacity-80` or `hover:scale-105`
- **Secondary:** `border border-[var(--border)]`, hover `bg-[var(--bg-light)]`
- **Contact button:** `bg-blue-500 hover:bg-blue-600`
- **Portfolio buttons:** `bg-[#3ABEFF] text-black hover:bg-[#56D4FF]` or `border border-white/40 hover:bg-white/10`

### Forms

- Input styling: `bg-white/10 border border-white/10 text-white focus:ring-2 focus:ring-blue-400`
- Portfolio contact inputs: `bg-white/10 border border-white/10 focus:ring-[#3ABEFF]`

### Typography

- **Global font:** Geist Sans (sans-serif) + Geist Mono (monospace), loaded from Google Fonts
- **Portfolio font:** Monospace (`font-mono` hardcoded)
- **Blog font:** Slate text, system sans

### Spacing

- Sections: `py-20` to `py-32` (80px–128px)
- Content max-width: `max-w-4xl` (blog), `max-w-5xl` / `max-w-6xl` (most pages)
- Padding: `px-6` standard, `md:px-8` / `lg:px-16` on blog

### Color Palette

**Dark mode (default):**

- Background: oklch(0.15 0.005 264) — very dark blue-gray
- Text: oklch(0.96 0.01 264) — near white
- Muted text: oklch(0.76 0.01 264) — light gray
- Primary: oklch(0.76 0.1 264) — purple
- Accent: oklch(0.7595 0.1442 235.31) — electric blue
- Brand gradients: `#3ABEFF` (cyan-blue), `#665DCD` (purple), `#D2AB67` (gold), `#5FA4E6` (steel blue)

**Light mode (exists but not activated):**

- Background: oklch(0.96 0.005 264) — near white
- Text: oklch(0.15 0.01 264) — very dark
- Softer gradient overlays (10% opacity vs 20% in dark)

### Icons

- `react-icons` v5 — packages used: `fa`, `fi`, `si`, `vsc`, `pi`, `ai`, `go`, `bi`, `tb`, `gi`, `md`, `bs`, `lu`

### Loading Indicators

- Blog index and blog post pages: no loading state (data is static/server-rendered)
- Team page: no loading spinner — grid simply renders empty until `useEffect` fetch completes

### Skeletons

- None implemented

### Notifications

- `alert()` in BlogEditor after download — browser native alert

### Dark Mode

- CSS variables defined for both dark (default) and `.light` class
- Toggle code is commented out in `Navbar.tsx`
- Not user-controllable in the current build

---

## 6. Content Inventory

### Home Page (`/`)

- **H1:** "Welcome to HubZero Community"
- **Subtext:** "We deliver top-quality solutions with a user-first experience — specializing in graphic design, software development, branding, UI/UX, and web design. Join us and bring your ideas to life! 🚀"
- **CTA:** "GET IN TOUCH"
- **About H2:** "About Hubzero"
- **About body:** "At Hubzero, we are on a mission to deliver top-tier digital solutions with innovation and precision. Founded by designers, developers, and creative thinkers, we specialize in graphic design, software development, branding, UI/UX, web design, and more."
- **Stats:** 6+ clients, 100% Satisfaction, ~12 Teammates, 2023 Since, 4+ Ongoing projects, 24/7 Availability
- **Family Guide H2:** "Hubzero Family Guide"
- **Family Guide subtext:** "We are a global digital solutions provider, empowering startups and businesses through design, development, and strategy."
- **Card 1 title:** "Graphics In Our Life"
- **Card 1 body:** "The Power Of Better Graphics — Strong visuals enhance branding, user experience, and communication. From UI/UX to marketing, better graphics create impact, boost engagement, and leave a lasting impression."
- **Card 2 title:** "Is Web Design Important?"
- **Card 2 body:** "The Power of Great Web Design — A well-designed website enhances user experience, credibility, and engagement. Clean layouts, intuitive navigation, and stunning visuals make a lasting impression, ensuring users stay and interact."
- **Projects H2:** "Our Projects & Fields"
- **Testimonials H2:** "We are in a good company"
- **Testimonials subtext:** "Our Clients have shown great appreciation to our projects and were happy to share some of their feedback below"
- **Testimonial 1:** "Working with Hubzero has been an absolute game-changer!..." — Business Owner, Bhatkally Startup Owner
- **Testimonial 2:** "The team at HubZero delivered an outstanding UI/UX design..." — Sarah Johnson, Tech Entrepreneur
- **Testimonial 3:** "SEO services by HubZero drastically improved our search rankings..." — David Smith, E-commerce Owner
- **CTA H2:** "Join Hubzero Team"
- **CTA body:** "Join our community of creators, innovators, and visionaries..."
- **CTA link:** "Learn more about working with us →"
- **Contact H2:** "Contact Us"
- **Contact body:** "We are always open to exciting collaborations!..."
- **Contact CTA:** "GET IN TOUCH"

### Footer

- "HUBZERO TEAM" (heading)
- "About Us" link
- "Work with Us" link
- "Terms of Use & Privacy Policy" link
- "HUBZERO" brand name
- "© 2025 HubZero Team. All Rights Reserved."

### About Page (`/about`)

- **H1:** "Redefining Digital Experiences"
- **Subtext:** "HubZero is a collective of visionaries shaping the digital future through tech, design & strategy."
- **Button:** "Explore Our Vision"
- **What We Do H2** + 3 service cards (see §3.2)
- **Our Story H2:** "Our Story"
- **Story body:** "Founded in 2024, HubZero started with a shared passion for building delightful digital solutions..."
- **Core Values H2:** "Our Core Values"
- **Values subtext:** "These values shape our mindset, our process, and the work we create every day."
- **Value 1:** 🤝 Collaboration — "We thrive on co-creation, teamwork, and mutual support."
- **Value 2:** 🎯 Excellence — "We pursue quality — in code, design, experience, and execution."
- **Value 3:** 🚀 Innovation — "We explore. We experiment. We evolve constantly and fearlessly."
- **Team CTA H2:** "Meet Our Team"
- **Team CTA body:** "A growing family of engineers, designers, and creators united by purpose."
- **Button:** "View Team Profiles"

### Team Page (`/team`)

- **H1:** "Meet the HubZero Team"
- **Subtext:** "Passionate creators, coders, designers, and visionaries driving HubZero forward."

### Work Page (`/work`)

- **H1:** "Our Work & Case Studies"
- **Subtext:** "Explore how we've transformed brands through design, development, and strategy."
- **Case Study:** "Bhatkal Time Luxe" — "Premium eCommerce experience for a luxury watch brand"
- **CTA H2:** "Want to work with us?"
- **CTA body:** "Let's create something impactful together."
- **Button:** "Contact Us"

### Contact Page (`/contact`)

- **H1:** "Contact Us"
- **Subtext:** "Have an idea or a question? Reach out! ✨"
- **Form labels:** Name, Email, Message
- **Placeholders:** "Your name", "you@example.com", "Your message..."
- **Submit:** "Send Message"

### Thanks Page (`/thanks`)

- **H1:** "Thank You!"
- **Body:** "Your message has been sent. We'll get back to you shortly 🚀"
- **Button:** "Back to Home"

### Privacy Policy (`/privacy-policy`)

- 7 sections (see §3.12)
- Last updated: July 16, 2025

### Service Pages

- **Web Development:** H1 "Web Development", 5 service bullets, CTA "Start Your Project"
- **UI/UX:** H1 "UI/UX Design", 5 design focus bullets, CTA "Talk to a Designer"
- **Branding:** H1 "Branding", 5 branding process bullets, CTA "Brand With Us"
- **SEO:** H1 "SEO Optimization", 5 SEO service bullets, CTA "Improve Your SEO"

### Rifaque's Portfolio (`/rifaque`)

- **Bio:** 3 paragraphs (full stack, MERN, AI/ML)
- **Location:** Bhatkal, Karnataka, India - 581320
- **Typewriter:** AI Stack Developer | Problem Solver | Software Engineer
- **Skills:** Languages (Python, JS, Java, C), Interface (React, Next.js, Tailwind, CSS, Tkinter, Flask), Databases (MongoDB, SQL, SQLite, Firestore), Tools (Cloudflare, NGINX, Postman, Figma, Git, VS Code, Firebase, Linux, Imgix), Web Development (17 items), App Development (Android Java)
- **Projects:** QueryCraft, Hub Zero Website, ZeroLink, eCommerce Store, Hospital Management, Blood Report App, College Management App
- **Experience:** Frontend Dev Intern at RG SmartDiscovery; Full Stack Developer (Contract)
- **Education:** BE Computer Science, AITM Karnataka 2022-2026

### 404 Page

- **H1:** "404 – Page Not Found"
- **Body:** "Oops! The page you're looking for doesn't exist. It might've been moved or deleted."
- **Buttons:** "GO HOME", "CONTACT SUPPORT"

---

## 7. Features

### 7.1 Main Website Navigation

**Purpose:** Allow visitors to explore HubZero services and find the team.
**How it works:** Fixed navbar with Services dropdown. Mobile hamburger menu.
**Files:** `Navbar.tsx`
**Limitations:** Mobile menu has wrong links for "Work with Us" and "Blog"

### 7.2 Scroll-Triggered Animations

**Purpose:** Premium feel on company pages.
**How it works:** GSAP + ScrollTrigger `fromTo` calls in `useEffect` referencing DOM elements via `useRef`.
**Files:** `AboutSection.tsx`, `ProjectSection.tsx`, `about/page.tsx`, `work/page.tsx`, `work/bhatkaltimeluxe/page.tsx`
**Dependencies:** `gsap`

### 7.3 Team Directory

**Purpose:** Show all team members with links to individual portfolios.
**How it works:** `/team` fetches `public/data/team.json` client-side. Grid of cards, each linking to `/{username}`.
**Files:** `team/page.tsx`
**Flow:** Page loads → useEffect fires → fetch('/data/team.json') → setState → cards render
**Limitations:** No loading state; data in public/data/team.json differs from src/data/team.json

### 7.4 Individual Portfolio Pages

**Purpose:** Each team member has a complete personal portfolio website under their username.
**How it works:** Static JSON data files in `src/data/` are imported at build time. `PortfolioClient` renders the full portfolio experience.
**Files:** `[username]/page.tsx`, `PortfolioClient.tsx`, `src/data/*.json`
**Features:** About, Experience (optional), Education (optional), Skills with icons, Projects with screenshots + filter + links, Contact form + info
**Contact forms:** Via FormSubmit.co

### 7.5 Project Category Filtering

**Purpose:** On portfolio pages, filter projects by technology category.
**How it works:** `filter` state in `PortfolioClient`, `filteredProjects = filter === 'All' ? data.projects : data.projects.filter(p => p.categories.includes(filter))`. Categories extracted dynamically from project data.
**Files:** `PortfolioClient.tsx`

### 7.6 Command Terminal (Easter Egg)

**Purpose:** Interactive terminal for developers viewing portfolio pages.
**How it works:** Global keyboard listener for backtick. Full-featured simulated terminal with 30 commands, tab completion, command history navigation (arrow keys).
**Files:** `CommandTerminal.tsx`, `CmdButton.tsx`
**Notable:** `cd [username]` command navigates between portfolio pages via `useRouter`
**Limitations:** Hardcoded team usernames include non-existent pages (junaid, abdul)

### 7.7 Contact Form (Company)

**Purpose:** Allow visitors to contact HubZero.
**How it works:** HTML form POSTed to Formspree. On success, Formspree redirects to `/thanks`. No JavaScript involved — pure HTTP form submission.
**Files:** `contact/page.tsx`
**Service:** Formspree form ID `xqalkylo`

### 7.8 Contact Form (Portfolio)

**Purpose:** Contact individual team members.
**How it works:** HTML form POSTed to FormSubmit.co using the member's email.
**Files:** `PortfolioClient.tsx` (contact section)
**Service:** FormSubmit.co

### 7.9 Blog

**Purpose:** Publishing articles, case studies, and guides.
**How it works:** Markdown files in `content/blog/` are read at build time (or request time in dev) using Node.js `fs`. Frontmatter parsed with `gray-matter`. Markdown body converted to HTML with `remark().use(html)` (basic `remark-html` — **no GFM, no syntax highlighting**). Pages are statically generated (`generateStaticParams`).
**Files:** `blog/page.tsx`, `blog/[slug]/page.tsx`, `BlogIndex.tsx`, `BlogPostLayout.tsx`, `lib/blog.ts`
**Current content:** 1 post (devpilot-readme.md)
**SEO:** Dynamic title/description per post, estimated reading time
**⚠️ Note:** The blog editor's live preview uses the full remark/rehype pipeline (via `lib/blog/markdown-utils.ts`) and renders syntax-highlighted code. The actual published post page does not — the pipelines are different.

### 7.10 Blog Editor (Internal Tool)

**Purpose:** Allow non-technical team members to write blog posts in a visual editor and download the result for publishing.
**How it works:** Monaco Editor for markdown input. Real-time frontmatter validation. Live preview using `BlogPostPreviewLayout`. Download as `.md` file.
**Workflow:** Write → Preview → Fix issues → Download → Send to Rifaque → Rifaque adds file to `content/blog/` and deploys
**Files:** `blog-editor/page.tsx`, `BlogPostPreviewLayout.tsx`, `lib/blog/markdown-utils.ts`

### 7.11 Reading Progress Bar

**Purpose:** Show reading progress in blog posts.
**How it works:** `useReadingProgress` hook tracks scroll relative to `#blog-reading-root` element. `ReadingProgressBar` renders as a fixed top gradient bar.
**Files:** `ReadingProgressBar.tsx`, `useReadingProgress.ts`

### 7.12 Testimonials Carousel

**Purpose:** Display client testimonials.
**How it works:** `currentTestimonial` state, prev/next buttons cycle through 3 hardcoded testimonials. GSAP animation on change.
**Files:** `Testimonials.tsx`
**Limitations:** Testimonials are hardcoded, two appear to be placeholder names

### 7.13 Case Studies

**Purpose:** Showcase client work in detail.
**How it works:** `/work` lists case studies (hardcoded array). Each links to a dedicated page.
**Files:** `work/page.tsx`, `work/bhatkaltimeluxe/page.tsx`
**Currently active:** 1 case study (Bhatkal Time Luxe)

### 7.14 Typewriter Effect

**Purpose:** Dynamic title in portfolio hero sections.
**How it works:** `react-simple-typewriter` with words from `data.typewriter[]`, looping, with cursor.
**Files:** `PortfolioClient.tsx`

### 7.15 SEO / Sitemap

**Purpose:** Search engine visibility.
**How it works:** Each page exports `metadata` object. `next-sitemap` generates `sitemap.xml` + `robots.txt` on `npm run build`. Rifaque's portfolio has Schema.org JSON-LD Person markup. OpenGraph + Twitter card metadata on key pages.
**Config:** `siteUrl: 'https://hubzero.in'`, weekly changefreq, priority 0.7, `/admin` excluded

### 7.16 PWA Support

**Purpose:** Allow site to be installed as an app.
**How it works:** `site.webmanifest` in public with icons, standalone display, theme color.
**Files:** `public/site.webmanifest`, `public/icon-192x192.png`, `public/icon-512x512.png`

### 7.17 Vercel Analytics + Speed Insights

**Purpose:** Track usage and performance.
**How it works:** `<Analytics />` and `<SpeedInsights />` injected in root layout. Sends data to Vercel's edge network.
**Files:** `layout.tsx`
**Note:** Privacy Policy states "we currently do not use tracking cookies" — this contradicts using Vercel Analytics

---

## 8. Backend Analysis

**There is no backend in this repository.** The project is a pure frontend Next.js application with no API routes, no server actions, no database connections, and no server-side authentication.

### Contact Forms

- Company contact: Delegated to **Formspree** (form ID: `xqalkylo`). HTML form POST.
- Portfolio contact: Delegated to **FormSubmit.co**. HTML form POST to `https://formsubmit.co/{email}`.

### Blog Data

- Blog posts are markdown files read from the filesystem at build time / request time.
- Implemented with `"server-only"` import guard in `lib/blog.ts` — only usable in Server Components.

### Sitemap Generation

- `next-sitemap` runs during `npm run build` (post-build step).

### Unused Dependencies (Listed But Not Used)

The following packages appear in `package.json` but have no corresponding imports anywhere in the source code:

| Package      | Listed Version | Status     |
| ------------ | -------------- | ---------- |
| `bcryptjs`   | ^3.0.2         | **Unused** |
| `dotenv`     | ^17.2.0        | **Unused** |
| `express`    | ^5.1.0         | **Unused** |
| `mongoose`   | ^8.16.3        | **Unused** |
| `nodemailer` | ^7.0.5         | **Unused** |

**Note:** `unified` (^11.0.5) is also listed in `dependencies` and is used transitively by the remark/rehype pipeline in `lib/blog/markdown-utils.ts`, so it is not unused — but it is not documented in the tech stack because it is an indirect peer dependency.

These suggest a previous plan to add a backend or were copied from another project. They add significant bundle weight and should be removed.

### No Middleware

No `middleware.ts` or `middleware.js` exists.

### No API Routes

No `route.ts` or `route.js` files exist anywhere in the `app/` directory.

### No Server Actions

No `"use server"` directives used anywhere.

---

## 9. Data Flow

### 9.1 Company Contact Form

```
User fills form (name, email, message)
         ↓
Browser submits HTML form (POST)
         ↓
Formspree API (https://formspree.io/f/xqalkylo)
         ↓
Formspree validates & emails HubZero team
         ↓
Formspree redirects browser to https://hubzero.in/thanks
         ↓
/thanks page renders "Thank You!" confirmation
```

### 9.2 Portfolio Contact Form

```
User fills form (name, email, subject, message)
         ↓
Browser submits HTML form (POST)
         ↓
FormSubmit.co API (https://formsubmit.co/{member_email})
         ↓
FormSubmit emails the portfolio owner directly
```

### 9.3 Blog Post Rendering

```
next build
         ↓
generateStaticParams() reads content/blog/*.md filenames
         ↓
For each slug:
  getPostBySlug(slug)
    → fs.readFileSync(path)
    → gray-matter.parse(content) → { data: frontmatter, content: body }
    → remark().use(html).process(body) → contentHtml
    → Returns BlogPost object
         ↓
BlogPostLayout receives {post, morePosts} as props
         ↓
dangerouslySetInnerHTML renders contentHtml
```

### 9.4 Team Page Data Loading

```
User visits /team
         ↓
TeamPage renders (empty state)
         ↓
useEffect fires after mount
         ↓
fetch('/data/team.json') → HTTP GET
         ↓
Response parsed as JSON
         ↓
setTeam(data) → re-render with team cards
```

### 9.5 Portfolio Page Loading

```
User visits /rifaque (or other portfolio)
         ↓
Server Component (rifaque/page.tsx):
  - Imports src/data/rifaque.json (static, build-time)
  - Generates metadata
  - Renders <PortfolioClient data={data} />
         ↓
Client hydration:
  - PortfolioClient receives data as props
  - Sets up scroll listener, keyboard listener
  - Renders full portfolio UI from data
```

### 9.6 Blog Editor → Publish Flow

```
Team member visits /blog-editor
         ↓
Writes markdown in Monaco Editor
         ↓
parseFrontmatterStrict(markdown) → issues[] (live)
markdownBodyToHtml(body) → renderedHtml (live async)
         ↓
BlogPostPreviewLayout renders preview in real time
         ↓
When issues.length === 0: Download button enabled
         ↓
User clicks Download → DownloadModal (slug entry)
         ↓
triggerDownload(slug):
  new Blob([markdown]) → URL.createObjectURL
  → creates <a> + click → downloads {slug}.md
  → alert() reminding to send to Rifaque
         ↓
Rifaque adds {slug}.md to content/blog/
Rifaque runs npm run build && ./deploy.sh
         ↓
Post appears at https://hubzero.in/blog/{slug}
```

---

## 10. Database

**No database exists in this application.**

All data is stored as:

1. **Static JSON files** — `src/data/*.json` (portfolio data, team data for portfolio)
2. **Public JSON** — `public/data/team.json` (team listing, fetched client-side)
3. **Markdown files** — `content/blog/*.md` (blog posts)

### Data Models

#### PortfolioData (TypeScript type: `src/types/portfolio.d.ts`)

```typescript
{
  username: string          // URL path: /rifaque
  name: string              // First name: "Rifaque"
  // fullname: string       // NOT in type! Extended locally in PortfolioClient
  title: string             // Job title
  location: string
  email: string
  phone: string
  resume: string            // Path to PDF
  typewriter: string[]      // Rotating title phrases
  socials: {
    github: string          // URL
    linkedin: string        // URL
    email: string           // "mailto:..."
  }
  about: string[]           // 3 paragraphs
  skills: Array<{
    category: string
    items: string[]
  }>
  projects: Array<{
    name: string
    desc: string
    longDesc: string
    repo?: string
    live?: string
    tech: string[]
    categories: string[]
    start: string
    end: string
    screenshot?: string
  }>
  // experience?: ExperienceItem[]  — Extended locally, not in type
  // education?: EducationItem[]    — Extended locally, not in type
}
```

#### TeamMember (inferred, in team/page.tsx)

```typescript
{
  name: string;
  username: string;
  role: string;
  image: string;
  about: string;
}
```

#### BlogPostMeta (src/lib/blog.ts)

```typescript
{
  slug: string
  title: string
  date: string              // "YYYY-MM-DD"
  summary: string
  author: string
  category?: string
  tags?: string[]
  coverImage?: string
  readingTimeMinutes?: number
}
```

#### BlogPost extends BlogPostMeta

```typescript
{
  ...BlogPostMeta,
  contentHtml: string       // Processed markdown as HTML
}
```

### Team Data Inconsistency

There are two copies of team data with different content:

**`src/data/team.json`** (not used by any page — orphaned):

- Rifaque: "Co-Founder, Developer & Strategist"
- Raif: "Full Stack Developer" + different bio
- Sultan: "Data Scientist & AI/ML Researcher"

**`public/data/team.json`** (fetched by `/team` page):

- Rifaque: "Founder, Developer & Strategist"
- Raif: "Software Engineer" + different bio
- Sultan: "Branding & SEO"

The team page uses the `public/` version. `src/data/team.json` is orphaned.

---

## 11. Authentication & Authorization

**No authentication or authorization system exists in this application.**

- No login page
- No sessions
- No JWT
- No cookies (beyond what Vercel Analytics and third-party services may set)
- No protected routes
- No role system
- No admin panel

The `bcryptjs` dependency is listed but never imported, suggesting authentication was planned but not implemented.

The `sitemap.config.js` excludes `/admin` from the sitemap and robots.txt, suggesting an admin section was planned but does not exist in this codebase.

---

## 12. File Structure

### Complete Tree (Relevant Files Only)

```
hubzero/
├── README.md
├── .gitignore                            ← Ignores node_modules, .next, .env
└── client/
    ├── .nexus/                           ← Untracked directory (git status: ??); purpose unknown — possibly a Next.js plugin or IDE cache artifact
    ├── package.json
    ├── next.config.ts                    ← MISSING export default (critical bug)
    ├── next-sitemap.config.js
    ├── tailwind.config.ts
    ├── tsconfig.json                     ← @/* alias → ./src/*
    ├── eslint.config.mjs                 ← next/core-web-vitals + next/typescript
    ├── postcss.config.mjs
    ├── content/
    │   └── blog/
    │       └── devpilot-readme.md        ← Only blog post
    ├── public/
    │   ├── favicon.ico
    │   ├── HubZeroLogoICO.png
    │   ├── og-image.png
    │   ├── site.webmanifest
    │   ├── robots.txt
    │   ├── sitemap.xml
    │   ├── sitemap-0.xml
    │   ├── icon-192x192.png
    │   ├── icon-512x512.png
    │   ├── data/team.json                ← Active team data (fetched client-side)
    │   ├── resume/
    │   │   └── Rifaque-Ahmed-Resume.pdf
    │   ├── images/
    │   │   ├── team/{5 photos}.jpg
    │   │   ├── rifaque/                  ← OG images + favicon for Rifaque
    │   │   ├── project{1-4}.png          ← Service icons
    │   │   ├── graphics-design.png
    │   │   ├── web-design.png
    │   │   ├── discord-icon.png
    │   │   ├── instagram-icon.png
    │   │   └── youtube-icon.png
    │   └── projectscreenshots/           ← 7 project thumbnails
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── globals.css
        │   ├── page.tsx
        │   ├── not-found.tsx
        │   ├── about/page.tsx
        │   ├── contact/page.tsx
        │   ├── team/page.tsx
        │   ├── thanks/page.tsx
        │   ├── privacy-policy/page.tsx
        │   ├── work/page.tsx
        │   ├── work/bhatkaltimeluxe/page.tsx
        │   ├── blog/page.tsx
        │   ├── blog/[slug]/page.tsx
        │   ├── blog-editor/page.tsx
        │   ├── branding/page.tsx
        │   ├── web-development/page.tsx
        │   ├── ui-ux/page.tsx
        │   ├── seo/page.tsx
        │   ├── rifaque/page.tsx
        │   ├── iyad/page.tsx
        │   ├── sultan/page.tsx
        │   ├── raif/page.tsx
        │   └── salsabeel/page.tsx
        ├── components/
        │   ├── Navbar.tsx
        │   ├── Footer.tsx
        │   ├── Home.tsx
        │   ├── AboutSection.tsx
        │   ├── ProjectSection.tsx
        │   ├── Testimonials.tsx
        │   ├── CTASection.tsx
        │   ├── FadeInSection.tsx
        │   ├── PortfolioClient.tsx
        │   ├── CommandTerminal.tsx
        │   ├── CmdButton.tsx
        │   └── blog/
        │       ├── BlogIndex.tsx
        │       ├── BlogPostLayout.tsx
        │       ├── BlogPostPreviewLayout.tsx
        │       ├── MarkdownPreview.tsx    ← DEAD CODE (unused)
        │       ├── ReadingProgressBar.tsx
        │       └── useReadingProgress.ts
        ├── data/
        │   ├── rifaque.json              ← Active (imported by rifaque/page.tsx)
        │   ├── iyad.json                 ← Active
        │   ├── sultan.json               ← Active
        │   ├── raif.json                 ← Active
        │   ├── salsabeel.json            ← Active
        │   └── team.json                 ← DEAD (not imported by anything)
        ├── lib/
        │   ├── blog.ts                   ← Active (Server Components only)
        │   ├── markdownToHtml.ts         ← DEAD CODE (never imported)
        │   └── blog/
        │       └── markdown-utils.ts     ← Active (blog-editor)
        └── types/
            └── portfolio.d.ts            ← Active (PortfolioData type)
```

### Dead Code / Unused Files

| File                                      | Reason                                                              |
| ----------------------------------------- | ------------------------------------------------------------------- |
| `src/components/blog/MarkdownPreview.tsx` | Never imported anywhere                                             |
| `src/lib/markdownToHtml.ts`               | Never imported anywhere; duplicated by `lib/blog/markdown-utils.ts` |
| `src/data/team.json`                      | Not imported by any page or component                               |

### Unused Dependencies

`bcryptjs`, `dotenv`, `express`, `mongoose`, `nodemailer` — never imported anywhere.

### Legacy/Experimental Code

- Theme toggle in `Navbar.tsx` — commented out `useTheme` hook and `BsSunFill`/`BsMoonFill` imports
- Multiple commented-out case studies in `work/page.tsx`
- Commented-out OG image code in `iyad/page.tsx`, `sultan/page.tsx`, `raif/page.tsx`, `salsabeel/page.tsx`
- `Link` import commented out in `work/bhatkaltimeluxe/page.tsx`

---

## 13. Configuration

### next.config.ts

```typescript
const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
};
// ⚠️ MISSING: export default nextConfig;
```

**Critical Bug:** No `export default` — Next.js will not apply these settings. The config comment even says `// REMOVE output: 'export'` suggesting this was recently changed from static export to Node server mode.

### tsconfig.json

- Target: ES2017
- Strict mode: ON
- Path alias: `@/*` → `./src/*`
- Module resolution: `bundler`
- Incremental compilation: ON

### tailwind.config.ts

- Dark mode: `class` strategy
- Content: `./app/**`, `./components/**`, `./src/**`
- Plugins: typography, line-clamp, scrollbar

### eslint.config.mjs

- Extends `next/core-web-vitals` and `next/typescript`
- Flat config format (ESLint 9)

### postcss.config.mjs

- Uses `@tailwindcss/postcss` (Tailwind 4 PostCSS plugin)

### package.json Scripts

```
dev   → next dev
build → next build && next-sitemap
start → next start
lint  → next lint
```

### next-sitemap.config.js

```javascript
{
  siteUrl: 'https://hubzero.in',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/admin'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/admin'] },
    ]
  }
}
```

### Path Aliases

- `@/` → `src/` (configured in tsconfig.json)

### Fonts

- **Geist Sans** — variable font, CSS variable `--font-geist-sans`
- **Geist Mono** — variable font, CSS variable `--font-geist-mono`
- Both loaded via `next/font/google` — this API **self-hosts the fonts** at build time. At runtime, fonts are served from the same domain, not from Google's CDN.

### Images

- `images.unoptimized: true` — Next.js image optimization disabled (because `<Image>` is used but served via NGINX without Vercel's optimization)

### PWA Manifest

```json
{
  "name": "Hub Zero",
  "short_name": "HubZero",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#3ABEFF"
}
```

---

## 14. Performance

### Large Components

- **`PortfolioClient.tsx`** — 852 lines. Imports 50+ icons. Every portfolio page loads the entire icon mapping for all possible skills, even if not used. The `skillIconMapping` and `categoryIconMapping` objects are large static dictionaries.
- **`CommandTerminal.tsx`** — 282 lines. Loaded on all portfolio pages even when the terminal is never opened.
- **`BlogPostPreviewLayout.tsx`** — 281 lines. Similar structure to `BlogPostLayout.tsx` with duplicated CSS-in-JS styles.

### Bundle Size Concerns

- `react-icons` imported with many packages (`fa`, `si`, `fi`, `vsc`, `pi`, `ai`, `go`, `bi`, `tb`, `gi`, `md`, `bs`, `lu`) — without tree-shaking optimization, this could add significant JS to the portfolio bundle.
- `gsap` (GSAP full build) imported on most company pages — `ScrollTrigger` could be lazy-loaded.
- `framer-motion` used on most client components.
- `@monaco-editor/react` is dynamically imported with `ssr: false` (good).
- 5 unused production dependencies (`bcryptjs`, `express`, `mongoose`, `nodemailer`, `dotenv`) bloat `node_modules` but are tree-shaken from the client bundle (they're node-only packages).

### Expensive Renders

- `PortfolioClient` re-renders on every keypress when terminal is open (all terminal state in parent)
- Blog editor re-runs `parseFrontmatterStrict` on every keystroke via `useMemo` (this is fine — it's synchronous and fast)
- `markdownBodyToHtml` is called in a `useEffect` with cleanup, which is good practice

### Hydration Issues

- `not-found.tsx`: Sets `document.title` in `useEffect` — works but `metadata` export would be better
- Portfolio pages use `next/head` in App Router, which doesn't work as expected in the App Router (script tags and metadata via `<Head>` from `next/head` are ignored in App Router — only Next.js `<Script>` and `metadata` export work)
- `CTASection.tsx` has `'use client'` but no client-side features — unnecessary

### Optimization Opportunities

- The team page could be a Server Component fetching `public/data/team.json` at build time instead of client-side fetching
- Blog post pages already use `generateStaticParams` (good)
- Image optimization is disabled — enabling it with Vercel or a custom loader would improve LCP
- GSAP could be dynamically imported per-page instead of bundled on every client component
- The `PortfolioClient` icon mappings could be computed per-user rather than shipping all icons to every visitor

### Loading States

- Team page: No loading indicator while data fetches
- No skeletons anywhere
- Blog: Server-rendered, no loading state needed

---

## 15. Reusability

### Currently Reused

- `Navbar` — used on all company pages (9 pages)
- `Footer` — used on all company pages (9 pages)
- `PortfolioClient` — used by 5 portfolio pages (excellent reuse)
- `BlogPostLayout` — used by blog post pages
- `ReadingProgressBar` + `useReadingProgress` — shared by BlogPostLayout and BlogPostPreviewLayout

### Should Become Shared UI

- **Section hero wrapper** — Every page has a hero with a gradient background, h1, and subtext. This pattern is copy-pasted across 6+ pages.
- **Glow background orbs** — The `absolute rounded-full blur-[180px]` pattern appears in 8+ components with slight variations.
- **Gradient card** — The glassmorphism `bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl` pattern appears in team cards, contact form, and thanks page.
- **CTA button** — The gradient button (`from-[#665DCD] via-[#5FA4E6] to-[#D2AB67]`) appears in 4+ places.

### Should Become Server Components

- `CTASection` — currently `'use client'` with no hooks
- `Footer` — already a Server Component (correct)
- Service pages (branding, web-development, ui-ux, seo) — already Server Components (correct)

### Should Become Hooks

- Scroll-to-section logic in `PortfolioClient` — `scrollTo(id)` could be a reusable hook
- The `useReadingProgress` hook is already well-extracted

### Should Become Utilities

- `normalizeTags` in `lib/blog.ts` is a good utility function
- `parseFrontmatterStrict` in `lib/blog/markdown-utils.ts` is a well-extracted utility
- The category/skill icon mapping objects in `PortfolioClient` could move to a separate `iconMap.ts` utility file

### Should Become Contexts/Providers

- Terminal state (`showCmd`, `history`) in `PortfolioClient` could be lifted to a context if terminal needs to be accessible from more places
- Theme toggle (currently commented out) should use React Context or `useLocalStorage` hook

---

## 16. Current Problems

### Critical

1. **`next.config.ts` missing `export default`** — `trailingSlash: true` and `images: { unoptimized: true }` are NOT applied to the build. This means trailing slash behavior is default Next.js, and image optimization warnings may appear.

2. **`next/head` in App Router doesn't work** — All 5 portfolio pages use `import Head from 'next/head'` to inject JSON-LD structured data. In Next.js 15 App Router, `next/head` is a no-op. The Schema.org markup is silently dropped. Should use `generateMetadata` with `other` fields or a `<Script>` component.

### Bugs

3. **Navbar mobile menu wrong links** — "WORK WITH US" links to `/contact` instead of `/work`; "BLOG" links to `#blog` instead of `/blog`.

4. **CommandTerminal hardcoded non-existent usernames** — `TEAM_USERNAMES = ["rifaque", "iyad", "sultan", "junaid", "abdul"]`. Typing `cd junaid` navigates to a 404.

5. **Debug `console.log` in BlogPostLayout** — `console.log(post.contentHtml)` in a `useEffect` is left in `BlogPostLayout.tsx:21`.

6. **Alert() in BlogEditor** — `alert()` is called after download. This violates the no-browser-alert guideline and looks unprofessional. Should use a toast notification.

7. **Formspree `_captcha: false`** — Disables Formspree's spam protection. This will result in spam messages being received.

8. **`Footer.tsx` "Work with Us" links to `/contact`, not `/work`** — `Footer.tsx` line 20: `<Link href="/contact">Work with Us</Link>`. A visitor clicking "Work with Us" in the footer is taken to the contact form, not the case studies / work page.

### Technical Debt

9. **Blog rendering lacks syntax highlighting and GFM** — Published posts use `remark().use(html)` (plain HTML conversion). The full remark/rehype pipeline with `rehype-highlight` and `remark-gfm` is only applied in the blog editor's live preview (`lib/blog/markdown-utils.ts`). Code blocks in published posts have no color, and GFM features (tables, task lists, strikethrough) are not rendered.

10. **5 unused production dependencies** — `bcryptjs`, `dotenv`, `express`, `mongoose`, `nodemailer` add no value and bloat `node_modules`.

11. **Duplicate/inconsistent team data** — `src/data/team.json` and `public/data/team.json` have the same members but different roles, bios, and Rifaque's title ("Co-Founder" vs "Founder"). `src/data/team.json` is never imported.

12. **Dead code files** — `src/components/blog/MarkdownPreview.tsx` and `src/lib/markdownToHtml.ts` are never imported.

13. **PortfolioData type is incomplete** — `fullname`, `experience`, and `education` fields are not in `portfolio.d.ts` but are used in the JSON files and handled via local type extensions in `PortfolioClient.tsx`.

14. **`CTASection` unnecessary `'use client'`** — Adds to client bundle with no benefit.

### Code Smells

15. **No layout.tsx nesting** — Every page imports Navbar and Footer independently. A nested layout would eliminate this repetition.

16. **Portfolio pages duplicate nearly identical `page.tsx` files** — All 5 portfolio `page.tsx` files are 86 lines each with only the `import data from` line and OG descriptions differing. Should be a single dynamic route `[username]`.

17. **Hardcoded gradient hex values** — The brand gradient colors (`#665DCD`, `#5FA4E6`, `#D2AB67`, `#3ABEFF`) appear as hardcoded strings in many places alongside CSS variables, creating inconsistency.

18. **`not-found.tsx` uses hardcoded `bg-black` instead of CSS variables** — Breaking the theming system.

19. **Large icon import** — `PortfolioClient.tsx` imports from 10+ `react-icons` packages. Only icons matching actual skills in that user's JSON are ever shown, but all icons ship to every visitor.

20. **Testimonials with placeholder names** — "Sarah Johnson" and "David Smith" appear to be placeholder names, not real client testimonials.

21. **`Home.tsx` has `'use client'` but no hooks** — It is `'use client'` only because it renders client components; those components could use their own directives instead, making `Home.tsx` a Server Component.

22. **`Blog` link in hero promo strip hardcoded** — The "Browse posts" CTA in BlogIndex links to `#posts` anchor which only works on the blog index page.

---

## 17. Redesign Opportunities

### Architecture: Use a Dynamic Route for Portfolios

Replace the 5 identical portfolio `page.tsx` files with a single `[username]/page.tsx` dynamic route:

```
src/app/[username]/page.tsx
```

Data files live in `src/data/` and are loaded by username. This eliminates 400+ lines of duplicate code.

### Use Nested Layouts

Create a `(site)/layout.tsx` that wraps all public pages with Navbar + Footer:

```
app/
├── (site)/
│   ├── layout.tsx    ← includes <Navbar /> + <Footer />
│   ├── page.tsx      ← home
│   ├── about/
│   ├── contact/
│   └── ...
├── (portfolio)/
│   └── [username]/
│       └── page.tsx  ← portfolio layout (no shared navbar)
└── blog/
    └── layout.tsx    ← blog-specific layout
```

### Fix JSON-LD with `generateMetadata`

Replace `next/head` with proper App Router structured data injection:

```typescript
export async function generateMetadata(): Promise<Metadata> {
  return {
    other: {
      'script:ld+json': JSON.stringify({ "@context": "...", ... })
    }
  }
}
```

### Centralize Team Data

Eliminate the dual `team.json` files. Create a single source of truth in `src/data/team.ts` (or `content/team.json`) and use it for both the team page (server-rendered) and portfolio pages.

### Server Components for Team Page

The team page currently fetches data client-side. It should be a Server Component that reads the data at build time:

```typescript
// app/team/page.tsx (Server Component)
import teamData from '@/data/team.json';
export default function TeamPage() {
  return <TeamGrid members={teamData} />;
}
```

### Shared Component Library

Extract repeated UI patterns into a `src/components/ui/` directory:

- `GlowBackground.tsx` — the blur orb pattern
- `HeroSection.tsx` — page hero with gradient text
- `GlassCard.tsx` — glassmorphism card
- `GradientButton.tsx` — the standard CTA button

### State Management for Terminal

Move terminal state out of `PortfolioClient` into a Context:

```
src/contexts/TerminalContext.tsx
```

### Icon Map Extraction

Move `skillIconMapping` and `categoryIconMapping` to:

```
src/lib/iconMap.tsx
```

This makes it tree-shakeable and testable independently.

### Type System Improvements

Update `portfolio.d.ts` to match actual JSON shape:

```typescript
export type PortfolioData = {
  username: string;
  name: string;
  fullname: string; // Add this
  // ...
  experience?: ExperienceItem[]; // Add this
  education?: EducationItem[]; // Add this
};
```

### Blog Content Management

Currently blog posts require a developer to:

1. Receive the `.md` file
2. Add it to `content/blog/`
3. Rebuild and deploy

A better approach: use a CMS (Contentlayer, Sanity, or even a simple GitHub-based CMS) that triggers rebuilds automatically.

### Fix next.config.ts

```typescript
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
```

### Performance Improvements

- Enable `next/image` optimization (requires Vercel or a custom image CDN)
- Lazy-load GSAP per-page
- Split `PortfolioClient` into smaller components with lazy boundaries
- Replace `alert()` with a toast library (e.g., Sonner)
- Remove 5 unused backend dependencies

---

## 18. Feature Checklist

### Public Pages

- [x] Home page (hero + about + projects + testimonials + CTA)
- [x] About page (mission, what we do, story, values, team CTA)
- [x] Team page (grid of members with links)
- [x] Work / Case Studies page
- [x] Bhatkal Time Luxe case study page
- [x] Contact page with form (Formspree)
- [x] Thank you page (post-contact redirect)
- [x] Privacy Policy page

### Service Pages

- [x] Web Development service page
- [x] UI/UX Design service page
- [x] Branding service page
- [x] SEO Optimization service page

### Portfolio Pages

- [x] Rifaque Ahmed portfolio (`/rifaque`)
- [x] Mohammed Iyad portfolio (`/iyad`)
- [x] Syed Mohammad Sultan portfolio (`/sultan`)
- [x] Raif Karani portfolio (`/raif`)
- [x] Salsabeel Kobattey portfolio (`/salsabeel`)

### Portfolio Features

- [x] Hero with typewriter effect
- [x] About section
- [x] Skills with category grouping and icons
- [x] Projects with screenshots, category filter, GitHub/demo links
- [x] Contact form (FormSubmit.co)
- [x] Contact info (email, phone, location)
- [x] Social links (GitHub, LinkedIn)
- [x] Resume download
- [x] Scroll-to-top button
- [x] Command terminal easter egg (backtick trigger + 30 commands)
- [x] Smooth section navigation
- [x] Experience timeline (rifaque only, data-driven)
- [x] Education section (rifaque only, data-driven)

### Blog

- [x] Blog index with featured post
- [x] Blog post page with markdown rendering
- [x] Reading progress bar
- [x] "Read more" section after post
- [x] Code syntax highlighting
- [x] Category and tag display
- [x] Author + date + reading time meta
- [x] Static page generation (`generateStaticParams`)
- [x] Dynamic per-post metadata
- [x] Blog Editor (internal markdown editor with Monaco)
- [x] Blog Editor live preview
- [x] Blog Editor frontmatter validation
- [x] Blog Editor `.md` file download

### SEO & Technical

- [x] Custom metadata per page (title, description)
- [x] OpenGraph metadata (home, blog, portfolio pages)
- [x] Twitter card metadata
- [x] Schema.org JSON-LD Person markup (attempted — broken due to next/head)
- [x] Sitemap.xml generation (next-sitemap)
- [x] Robots.txt generation (next-sitemap)
- [x] PWA web manifest
- [x] Favicon
- [x] Custom 404 page
- [x] Vercel Analytics integration
- [x] Vercel Speed Insights integration
- [x] Canonical URL in metadata

### UI / Animation

- [x] GSAP scroll-triggered animations (company pages)
- [x] Framer Motion entry animations (contact, team, portfolio cards)
- [x] Framer Motion dropdown/mobile menu animations
- [x] Dark mode default (CSS variables)
- [x] Light mode CSS variables (inactive — toggle commented out)
- [x] Responsive design (mobile-first)
- [x] Glassmorphism cards
- [x] Gradient backgrounds / blur orbs
- [x] Custom scrollbar styling

### Not Implemented

- [ ] Theme toggle (UI exists but is disabled)
- [ ] Admin panel
- [ ] Authentication
- [ ] Database
- [ ] CMS / automated blog publishing
- [ ] Loading skeletons
- [ ] Toast notifications (uses `alert()` instead)
- [ ] Image optimization (disabled)
- [ ] Additional case studies (2 are commented out)

---

## 19. Rewrite Roadmap

### Phase 1 — Foundation & Cleanup

**Goal:** Clean project structure, shared components, fixed config, no dead code.

**Tasks:**

1. Fix `next.config.ts` — add `export default nextConfig`
2. Remove unused dependencies: `bcryptjs`, `dotenv`, `express`, `mongoose`, `nodemailer`
3. Delete dead code: `MarkdownPreview.tsx`, `markdownToHtml.ts`, `src/data/team.json`
4. Update `portfolio.d.ts` to include `fullname`, `experience`, `education`
5. Organize folder structure with route groups: `(site)/`, `(portfolio)/`, `blog/`
6. Create nested `(site)/layout.tsx` with Navbar + Footer
7. Extract shared components to `src/components/ui/`: `GlowBackground`, `HeroSection`, `GlassCard`, `GradientButton`
8. Move `skillIconMapping` and `categoryIconMapping` to `src/lib/iconMap.tsx`
9. Fix `CTASection` — remove unnecessary `'use client'`

**Dependencies:** None — this phase is pure refactoring.

---

### Phase 2 — Data Layer & Types

**Goal:** Single source of truth for all data; strong typing.

**Tasks:**

1. Merge `src/data/team.json` and `public/data/team.json` into one authoritative source
2. Store team data in `src/data/team.ts` (typed)
3. Consolidate portfolio JSON schemas — ensure all 5 JSONs conform to `PortfolioData` type
4. Create `src/data/services.ts` — move hardcoded service data from components
5. Create `src/data/testimonials.ts` — move hardcoded testimonials
6. Create `src/data/projects.ts` — move hardcoded home page project tiles
7. Consider: add `_comment` field handling to TypeScript (currently only in JSON)

**Dependencies:** Phase 1 cleanup

---

### Phase 3 — Portfolio System Redesign

**Goal:** Eliminate the 5 duplicate portfolio page files. Use a single dynamic route.

**Tasks:**

1. Create `src/app/(portfolio)/[username]/page.tsx`
2. Create `src/data/portfolio/index.ts` — maps username to data file
3. Implement `generateStaticParams()` for all 5 usernames
4. Fix Schema.org JSON-LD — use `generateMetadata` with `other` or `<Script>` tag
5. Remove individual `rifaque/page.tsx`, `iyad/page.tsx`, etc.
6. Split `PortfolioClient.tsx` into smaller components: `PortfolioHero`, `PortfolioSkills`, `PortfolioProjects`, `PortfolioContact`, `PortfolioNav`

**Dependencies:** Phase 1 + Phase 2

---

### Phase 4 — Public Pages

**Goal:** Rebuild all public company pages with shared layouts and clean components.

**Tasks:**

1. Convert team page to Server Component (eliminate client-side `fetch`)
2. Rebuild service pages with shared `ServicePageLayout` component
3. Convert `CTASection` to Server Component
4. Fix Navbar mobile menu links (work → `/work`, blog → `/blog`)
5. Implement theme toggle (uncomment and wire up the existing hook + CSS variables)
6. Replace `document.title` in `not-found.tsx` with `metadata` export
7. Fix `not-found.tsx` hardcoded `bg-black` → use CSS variables
8. Verify About page founding year matches "2024" (home About section says "2023") — pick one
9. Update testimonials — replace placeholder names with real client information or clearly mark them as examples

**Dependencies:** Phase 1 + Phase 3 layout

---

### Phase 5 — Blog System

**Goal:** Mature blog infrastructure, fix debug code, improve blog editor.

**Tasks:**

1. Remove `console.log(post.contentHtml)` from `BlogPostLayout.tsx:22`
2. Replace `alert()` in blog editor with a toast notification (add Sonner or similar)
3. Fix blog editor title — should be `/blog-editor` but it could be protected somehow (no auth exists)
4. Remove `MarkdownPreview.tsx` (dead, replaced by `BlogPostPreviewLayout`)
5. Add more blog posts to `content/blog/`
6. Consider: Contentlayer or similar for typed blog posts with better DX
7. Remove placeholder ad slot text ("Minimal ad space. Reserve for announcements") — either use it or remove it

**Dependencies:** Phase 1

---

### Phase 6 — SEO, Performance, and Accessibility

**Goal:** Ensure search engines can find and index all content correctly.

**Tasks:**

1. Enable Next.js Image Optimization (either deploy on Vercel or configure custom loader)
2. Fix Schema.org JSON-LD on portfolio pages (broken due to `next/head`)
3. Add `<Image>` width/height to all images that use `fill` — ensure `sizes` prop is set correctly
4. Audit Formspree integration — re-enable captcha (`_captcha: true`)
5. Verify `trailingSlash: true` behavior after config fix
6. Add `alt` text audit across all `<Image>` components
7. Verify Vercel Analytics privacy disclosure matches Privacy Policy

**Dependencies:** Phases 1-5

---

### Phase 7 — Optional Enhancements

**Goal:** Nice-to-have improvements beyond the current feature set.

**Tasks:**

1. Add loading skeleton to team page
2. Add page-level loading states (`loading.tsx`)
3. Fix CommandTerminal `TEAM_USERNAMES` — derive from data, remove "junaid" and "abdul"
4. Add Framer Motion page transitions
5. Add actual case studies to `/work` (currently 2 commented out)
6. Consider: add a portfolio for additional team members as they join (the architecture now supports it)
7. Add `error.tsx` per-route for graceful error boundaries

**Dependencies:** Phases 1-6

---

### Phase Dependencies Summary

```
Phase 1 (Cleanup) → required by all phases
Phase 2 (Data)    → required by Phase 3
Phase 3 (Portfolios) → independent of Phase 4-5
Phase 4 (Public)  → independent of Phase 3, 5
Phase 5 (Blog)    → independent of Phase 3, 4
Phase 6 (SEO/Perf) → requires Phases 1-5 to be complete
Phase 7 (Polish)  → requires Phase 6
```

---

_End of PROJECT_ANALYSIS.md — generated by complete read of all source files._
