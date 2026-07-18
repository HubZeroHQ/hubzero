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

export const PUBLIC_NAVIGATION = [
  { label: 'Work', href: '/work', type: 'work', enabled: true },
  { label: 'Builds', href: '/builds', type: 'build', enabled: true },
  { label: 'Blueprints', href: '/blueprints', type: 'blueprint', enabled: true },
  { label: 'Labs', href: '/labs', type: 'lab', enabled: true },
  { label: 'Services', href: '/services', type: 'service', enabled: false },
  { label: 'About', href: '/about', type: 'teamMember', enabled: false },
] as const;

export const PUBLIC_ENTITY_ROUTES = {
  work: true,
  build: true,
  blueprint: true,
  lab: true,
  note: false,
  engineeringProfile: false,
  teamMember: false,
  service: false,
} as const;
