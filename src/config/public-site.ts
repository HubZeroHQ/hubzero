export const PUBLIC_SITE = {
  name: 'HubZero',
  description: 'HubZero builds products, software, AI systems, and digital infrastructure.',
  locale: 'en_IN',
  language: 'en',
  organizationUrl: 'https://hubzero.in',
  socialImage: '/web-app-manifest-512x512.png',
  release: {
    /** Phase 15 owns the first public release surface. Phase 14 stays closed to crawlers. */
    live: false,
    search: false,
    feed: false,
    contact: false,
  },
} as const;

export const PUBLIC_HOME = {
  eyebrow: 'Independent technology studio',
  title: {
    lead: 'We build',
    emphasis: 'software',
    close: 'that holds up.',
  },
  introduction:
    'HubZero designs products, developer tools, AI systems, websites, and digital infrastructure. The work is documented through its constraints, decisions, and outcomes.',
  pillars: [
    {
      label: 'Labs',
      description:
        'Investigations in progress, with their stage and current evidence made explicit.',
      href: '/labs',
      type: 'lab',
    },
    {
      label: 'Builds',
      description: 'Products shipped and maintained by HubZero.',
      href: '/builds',
      type: 'build',
    },
    {
      label: 'Work',
      description: 'Client problems resolved through engineering judgment.',
      href: '/work',
      type: 'work',
    },
    {
      label: 'Blueprints',
      description: 'Proven information architectures and design languages made reusable.',
      href: '/blueprints',
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
      href: '/labs',
    },
    {
      label: 'Builds',
      verb: 'Ship',
      description:
        'Useful internal products are documented through their current state, architecture, decisions, and continuing maintenance.',
      href: '/builds',
    },
    {
      label: 'Work',
      verb: 'Apply',
      description:
        'Client work begins with the constraint and records the decisions, implementation, outcome, and lessons that followed.',
      href: '/work',
    },
    {
      label: 'Blueprints',
      verb: 'Generalize',
      description:
        'Patterns that hold up become reusable foundations with an explicit information architecture and design language.',
      href: '/blueprints',
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
      title: 'Record judgment, not just output.',
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

export const PUBLIC_NAVIGATION = [
  { label: 'Work', href: '/work', type: 'work', enabled: true },
  { label: 'Builds', href: '/builds', type: 'build', enabled: true },
  { label: 'Blueprints', href: '/blueprints', type: 'blueprint', enabled: true },
  { label: 'Labs', href: '/labs', type: 'lab', enabled: true },
  { label: 'Notes', href: '/notes', type: 'note', enabled: true },
  { label: 'Services', href: '/services', type: 'service', enabled: false },
  { label: 'About', href: '/about', type: 'teamMember', enabled: true },
] as const;

export const PUBLIC_ENTITY_ROUTES = {
  work: true,
  build: true,
  blueprint: true,
  lab: true,
  note: true,
  engineeringProfile: true,
  teamMember: true,
  service: false,
} as const;
