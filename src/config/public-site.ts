export const PUBLIC_SITE = {
  name: 'HubZero',
  description: 'HubZero builds products, software, AI systems, and digital infrastructure.',
  locale: 'en_IN',
  language: 'en',
  organizationUrl: 'https://hubzero.in',
  socialImage: '/web-app-manifest-512x512.png',
  release: {
    /** Keep crawler and feed release gates closed until LAUNCH_READINESS.md is approved. */
    live: false,
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
    'HubZero designs and builds software, products, developer tools, AI systems, websites, and digital infrastructure. The useful starting point is the constraint—not a predetermined package.',
  buildAreas: [
    {
      label: 'Products and platforms',
      description:
        'New software systems shaped around a clear operating problem, the people using them, and the conditions they must survive.',
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
  service: true,
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
] as const;
