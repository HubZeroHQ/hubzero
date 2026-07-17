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

export const PUBLIC_NAVIGATION = [
  { label: 'Work', href: '/work', type: 'work', enabled: false },
  { label: 'Builds', href: '/builds', type: 'build', enabled: false },
  { label: 'Blueprints', href: '/blueprints', type: 'blueprint', enabled: false },
  { label: 'Labs', href: '/labs', type: 'lab', enabled: false },
  { label: 'Services', href: '/services', type: 'service', enabled: false },
  { label: 'About', href: '/about', type: 'teamMember', enabled: false },
] as const;

export const PUBLIC_ENTITY_ROUTES = {
  work: false,
  build: false,
  blueprint: false,
  lab: false,
  note: false,
  engineeringProfile: false,
  teamMember: false,
  service: false,
} as const;
