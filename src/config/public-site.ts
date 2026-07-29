import { publicRoute } from '@/lib/public/routes';

export const PUBLIC_SITE = {
  name: 'HubZero',
  description:
    'HubZero builds software, hardware, AI systems, and the infrastructure that connects them.',
  locale: 'en_IN',
  language: 'en',
  organizationUrl: 'https://hubzero.in',
  socialImage: '/og-default.png',
  // Actual pixel dimensions of the default social image above — the standard 1.91:1 OG ratio, kept as a named
  // constant so layout.tsx and createPublicMetadata() don't each hardcode it.
  socialImageWidth: 1200,
  socialImageHeight: 630,
  release: {
    live: true,
    search: true,
    feed: false,
    contact: true,
  },
} as const;

export const PUBLIC_SERVICES = {
  eyebrow: 'Services / evidence by need',
  title: {
    lead: 'Build the system the',
    emphasis: 'problem',
    close: 'requires.',
  },
  introduction:
    'HubZero designs and builds software, hardware, developer tools, AI systems, websites, and digital infrastructure. The useful starting point is the constraint—not a predetermined package.',
  buildAreas: [
    {
      label: 'Products and platforms',
      description:
        'New software systems shaped around a clear operating problem, the people using them, and the conditions they must survive.',
    },
    {
      label: 'Hardware and embedded systems',
      description:
        'Electronics, embedded firmware, and physical systems engineered with the same rigor as software—where the constraint is a circuit, a signal, or a device, not just code.',
    },
    {
      label: 'Developer tools and infrastructure',
      description:
        'Internal and public tooling that makes technical work easier to understand, operate, and maintain.',
    },
    {
      label: 'AI systems and workflows',
      description:
        'Model-backed capabilities designed with explicit boundaries, validation, failure behaviour, and human review.',
    },
    {
      label: 'Websites and digital publications',
      description:
        'Content-rich public systems where information architecture, editorial structure, accessibility, and performance are part of the engineering.',
    },
  ],
  engagementModels: [
    {
      title: 'Focused investigation',
      body: 'Make an uncertain technical problem precise, test the important assumptions, and leave a useful decision record.',
    },
    {
      title: 'Product or system delivery',
      body: 'Define, implement, and verify a bounded product or engineering system against its real constraints.',
    },
    {
      title: 'Ongoing engineering collaboration',
      body: 'Continue an existing system through deliberate improvements, current documentation, and explicit ownership.',
    },
  ],
  process: [
    {
      label: 'Orient',
      body: 'Understand the problem, the people affected, and what already exists.',
    },
    {
      label: 'Constrain',
      body: 'Name the boundaries, risks, dependencies, and definition of a useful result.',
    },
    {
      label: 'Decide',
      body: 'Compare viable approaches and record the trade-offs behind the chosen direction.',
    },
    {
      label: 'Build',
      body: 'Implement the smallest complete system that satisfies the agreed constraints.',
    },
    {
      label: 'Verify',
      body: 'Test correctness, accessibility, performance, failure behaviour, and operational fit.',
    },
    {
      label: 'Continue',
      body: 'Leave the system understandable, maintainable, and ready for its next decision.',
    },
  ],
  collaboration: {
    title: 'Work begins with shared context.',
    body: 'A useful first conversation covers the problem, who it affects, the current system, known constraints, and what has already been tried. Decisions remain visible as the work changes.',
    boundaries: [
      'Evidence determines fit; the service definition does not extend beyond the work that supports it.',
      'Scope and technical boundaries are made explicit before implementation begins.',
      'Changes in direction are treated as engineering decisions, not hidden inside delivery.',
    ],
  },
} as const;

export const PUBLIC_CONTACT = {
  eyebrow: 'Contact / initial context',
  title: {
    lead: 'Start with the',
    emphasis: 'problem',
    close: 'as it exists today.',
  },
  introduction:
    'Share the constraint, the people affected, and what has already been tried. A prepared specification is not required for an initial conversation.',
  reviewStatement:
    "Every enquiry is reviewed carefully. If additional discussion would be valuable, we'll get in touch.",
  privacy:
    'Your name, email, message, and the public page that led here are stored so HubZero can review the enquiry. They are not published.',
} as const;

/**
 * Describes only what the current implementation actually does — verified
 * directly against the code, not a generic template. Update this alongside
 * any change to what the Contact or Career Interest forms collect, store,
 * or do with submitted data.
 */
export const PUBLIC_PRIVACY = {
  eyebrow: 'Privacy',
  title: 'How HubZero handles the information you share.',
  lastUpdated: '28 July 2026',
  introduction:
    'This page describes what HubZero collects through this website, why, and what happens to it. It covers the current implementation only — nothing more is done with your information than what is written here.',
  sections: [
    {
      heading: 'What is collected',
      body: [
        'The Contact form collects your name, email address, message, and the public page you came from.',
        'The Career Interest form collects your name, email address, and any of the following you choose to provide: a résumé link, a portfolio link, a GitHub link, a LinkedIn link, your areas of interest, and a short introduction. If you submit interest from a specific role, that role is recorded alongside your submission.',
        'Both forms include a hidden field used only to detect automated spam submissions; it is never shown to you and holds no information about you.',
      ],
    },
    {
      heading: 'Why it is collected',
      body: [
        'Solely to review your enquiry or expression of interest and, where relevant, to follow up with you by email.',
      ],
    },
    {
      heading: 'How it is stored',
      body: [
        "Submissions are stored in HubZero's own database and are not published on the website. They are kept for as long as needed to review and respond, and are not sold, rented, or shared with any third party for marketing purposes.",
      ],
    },
    {
      heading: 'What this site does not do',
      body: [
        'This site does not use analytics, advertising, or tracking cookies, and does not share visitor data with any third-party analytics or marketing service.',
        'A cookie is set only when a HubZero team member signs in to the internal content-management system used to run this site. It is not set for visitors browsing the public site, and it does not identify or track you.',
      ],
    },
    {
      heading: 'Your options',
      body: [
        'To ask what information HubZero holds about you, or to request that it be corrected or removed, use the Contact form — this is the only contact channel this site currently provides.',
      ],
    },
  ],
} as const;

export const PUBLIC_HOME = {
  eyebrow: 'Independent technology studio',
  title: {
    lead: 'We build',
    emphasis: 'systems',
    close: 'that hold up.',
  },
  introduction:
    'HubZero designs and builds software products, developer tools, AI-backed systems, and the infrastructure that runs them. Each one below is documented through its constraints, decisions, and outcomes.',
  pillars: [
    {
      label: 'Labs',
      description:
        'Investigations in progress, with their stage and current evidence made explicit.',
      href: publicRoute.collection('lab'),
      type: 'lab',
    },
    {
      label: 'Builds',
      description: 'Products shipped and maintained by HubZero.',
      href: publicRoute.collection('build'),
      type: 'build',
    },
    {
      label: 'Work',
      description: 'Client problems resolved through engineering judgement.',
      href: publicRoute.collection('work'),
      type: 'work',
    },
    {
      label: 'Blueprints',
      description: 'Proven information architectures and design languages made reusable.',
      href: publicRoute.collection('blueprint'),
      type: 'blueprint',
    },
  ],
  closing: {
    eyebrow: 'A useful beginning',
    title: 'Bring the problem, not a prepared solution.',
    body: 'Start with the constraint, the people affected, and what has already been tried. We will begin by making the problem precise.',
  },
} as const;

/**
 * Careers is a permanent Company destination, not a "we're hiring" banner —
 * the hiring-philosophy copy here stays visible whether or not any listing
 * is currently published (Experience v3 Careers milestone). `approach`
 * answers the three questions the page owes a visitor regardless of current
 * openings: how hiring works, who fits, and how a role comes to exist at all.
 */
export const PUBLIC_CAREERS = {
  eyebrow: 'Careers / how we work',
  title: {
    lead: 'People who make',
    emphasis: 'evidence',
    close: 'their default.',
  },
  introduction:
    'HubZero is small by design. Everyone here does work that becomes part of the public record — case studies, products, research, and reusable systems that carry their name. Openings are listed here only when they reflect real, current need.',
  approach: [
    {
      label: 'How hiring works',
      title: 'One real conversation, then real work.',
      body: 'A first conversation covers what you have built and how you think through a constraint. Where it continues, the next step is usually a small, paid, real piece of work — not a take-home exercise designed to be thrown away.',
    },
    {
      label: 'Who fits',
      title: 'Ownership over specialization.',
      body: 'HubZero looks for people who can take a problem from first principles to a shipped, documented outcome, and who want their own work to be inspectable rather than just delivered.',
    },
    {
      label: 'How roles open',
      title: 'A role exists when the work does.',
      body: 'Openings are tied to real, current need rather than a pipeline kept warm by default. A published listing here is real; nothing is posted to look active.',
    },
  ],
  noOpeningsTitle: 'There is no open role that matches today.',
  noOpeningsBody:
    'That will change. If HubZero sounds like a fit, introduce yourself below — submissions are reviewed as new work opens up, not filed away.',
} as const;

/**
 * Handcrafted company framing is intentionally configuration-owned until a
 * typed Studio settings model is approved. The language below is derived from
 * PUBLIC_NARRATIVE.md and ENGINEERING_IDENTITY.md; people and biographies still
 * come exclusively from visible Team records.
 */
export const PUBLIC_ABOUT = {
  eyebrow: 'About / operating model',
  title: {
    lead: 'Engineering is a',
    emphasis: 'practice',
    close: 'made visible.',
  },
  introduction:
    'HubZero builds products and engineering systems, applies that practice to client problems, publishes what it learns, and turns repeated patterns into reusable foundations.',
  operatingModel: [
    {
      label: 'Labs',
      verb: 'Investigate',
      description:
        'Open questions become bounded explorations with a stage, current milestone, evidence, and an honest graduation criterion.',
      href: publicRoute.collection('lab'),
    },
    {
      label: 'Builds',
      verb: 'Ship',
      description:
        'Useful internal products are documented through their current state, architecture, decisions, and continuing maintenance.',
      href: publicRoute.collection('build'),
    },
    {
      label: 'Work',
      verb: 'Apply',
      description:
        'Client work begins with the constraint and records the decisions, implementation, outcome, and lessons that followed.',
      href: publicRoute.collection('work'),
    },
    {
      label: 'Blueprints',
      verb: 'Generalise',
      description:
        'Patterns that hold up become reusable foundations with an explicit information architecture and design language.',
      href: publicRoute.collection('blueprint'),
    },
  ],
  principles: [
    {
      label: 'State',
      title: 'Describe what is true now.',
      body: 'Stages, deployments, versions, milestones, and dates make maturity legible without turning workflow status into marketing.',
    },
    {
      label: 'Decisions',
      title: 'Record judgement, not just output.',
      body: 'Constraints, alternatives, trade-offs, and lessons explain why an implementation took its final shape.',
    },
    {
      label: 'Evidence',
      title: 'Let artifacts carry the claim.',
      body: 'Products, repositories, deployments, screenshots, architecture, code, and documents establish capability directly.',
    },
    {
      label: 'Continuity',
      title: 'Treat delivery as a long-term system.',
      body: 'Lineage, versions, journals, and reciprocal links preserve what changed and what the work informed next.',
    },
  ],
} as const;

/**
 * `description` is the short answer to "what's the difference between
 * these?" — surfaced as a native tooltip on the desktop pill nav (which has
 * no room for subtitles) and as a visible line under each label in the
 * disclosed mobile menu (which does). Kept to a few words, not a repeat of
 * the fuller `PUBLIC_HOME.pillars` copy.
 *
 * `enabled` and `primary` answer two different questions and must not be
 * conflated: `enabled` here governs nav/footer visibility only (`PublicFooter`'s
 * `byType()` is its one reader) — it does NOT mean "this route is real."
 * Whether a route actually exists and should be indexed (sitemap, search,
 * discovery) is a separate fact, `PUBLIC_ENTITY_ROUTES` — a route can be
 * `PUBLIC_ENTITY_ROUTES`-enabled but `PUBLIC_NAVIGATION`-disabled (a route
 * can be real, working, and indexed while still being reached only through
 * Search, the sitemap, or a single contextual link elsewhere, never a nav
 * or footer entry, if that's the right amount of prominence for it).
 * `primary` means "this belongs in the persistent top-level pill." Primary navigation
 * orients a first-time visitor to what HubZero *is* (Work, Builds,
 * Blueprints, Labs, About); Notes, Engineering, Ledger, and Services are fully
 * real, fully enabled, fully indexed destinations that are deliberately reached
 * contextually instead — a relationship rail, a byline, the Homepage's
 * current-momentum section, Search, or the footer — never by clicking a nav
 * item with no context yet for what it leads to. See the Design
 * Specification §5 ("Primary, secondary, and contextual navigation are
 * different jobs") for the full reasoning.
 */
export const PUBLIC_NAVIGATION = [
  {
    label: 'Work',
    href: publicRoute.collection('work'),
    type: 'work',
    enabled: true,
    primary: true,
    description: 'Client case studies',
  },
  {
    label: 'Builds',
    href: publicRoute.collection('build'),
    type: 'build',
    enabled: true,
    primary: true,
    description: 'Products HubZero ships',
  },
  {
    label: 'Blueprints',
    href: publicRoute.collection('blueprint'),
    type: 'blueprint',
    enabled: true,
    primary: true,
    description: 'Reusable engineering foundations',
  },
  {
    label: 'Labs',
    href: publicRoute.collection('lab'),
    type: 'lab',
    enabled: true,
    primary: true,
    description: 'Investigations in progress',
  },
  {
    label: 'Notes',
    href: publicRoute.collection('note'),
    type: 'note',
    enabled: true,
    primary: false,
    description: 'Short-form engineering journal',
  },
  {
    label: 'Engineering',
    href: publicRoute.collection('engineeringProfile'),
    type: 'engineeringProfile',
    enabled: true,
    primary: false,
    description: 'Documented expertise and evidence',
  },
  {
    label: 'Ledger',
    href: publicRoute.ledger(),
    type: 'ledger',
    enabled: true,
    primary: false,
    description: 'Chronological activity record',
  },
  {
    label: 'Services',
    href: publicRoute.collection('service'),
    type: 'service',
    // Footer-visible (Design Specification §5's "contextual" tier, same as
    // Notes/Engineering/Ledger below) — not primary. Services has no
    // relationship-graph presence of its own to be reached through
    // (unlike Notes' bylines or a Work item's evidence trail), so unlike
    // those routes its only paths in were previously a single Homepage
    // sentence plus Search/sitemap — the weakest hub on the site. Adding it
    // to the footer's Company group closes that without promoting it into
    // the primary pill, which would misrepresent it as one of the handful
    // of things that orient a first-time visitor to what HubZero *is*.
    enabled: true,
    primary: false,
    description: 'Capability by evidence',
  },
  {
    label: 'About',
    href: publicRoute.about(),
    type: 'teamMember',
    enabled: true,
    primary: true,
    description: 'Team & operating model',
  },
  {
    label: 'Careers',
    href: publicRoute.collection('career'),
    type: 'career',
    enabled: true,
    primary: false,
    description: 'Open roles and how to reach us',
  },
] as const;

export const PUBLIC_ENTITY_ROUTES = {
  work: true,
  build: true,
  blueprint: true,
  lab: true,
  note: true,
  engineeringProfile: true,
  teamMember: true,
  service: true,
  career: true,
} as const;

export const PUBLIC_SEARCH_GROUPS = [
  { type: 'work', label: 'Work' },
  { type: 'build', label: 'Builds' },
  { type: 'blueprint', label: 'Blueprints' },
  { type: 'lab', label: 'Labs' },
  { type: 'note', label: 'Notes' },
  { type: 'engineeringProfile', label: 'Engineering profiles' },
  { type: 'teamMember', label: 'Team' },
  { type: 'service', label: 'Services' },
  { type: 'career', label: 'Careers' },
] as const;
