import { PUBLIC_SITE } from '@/config/public-site';
import { publicEnv } from '@/lib/env';
import type {
  ImmutablePublic,
  PublicBlueprintSummary,
  PublicBuildSummary,
  PublicLabSummary,
  PublicNoteSummary,
  PublicServiceSummary,
  PublicEngineeringProfileSummary,
  PublicTeamMemberSummary,
  PublicWorkSummary,
} from '../domain';

export type JsonLd = Record<string, unknown>;

const absolute = (path: string) => new URL(path, publicEnv().NEXT_PUBLIC_SITE_URL).toString();

export function organizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${absolute('/')}#organization`,
    name: PUBLIC_SITE.name,
    url: absolute('/'),
    logo: absolute('/brand/hubzero-logo-black.png'),
  };
}

export function publicNoteJsonLd(entity: ImmutablePublic<PublicNoteSummary>): JsonLd {
  const author =
    entity.author.kind === 'person'
      ? {
          '@type': 'Person',
          name: entity.author.name,
          url: absolute(entity.author.url),
        }
      : { '@id': `${absolute('/')}#organization` };
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${absolute(entity.url)}#article`,
    headline: entity.title,
    description: entity.summary,
    url: absolute(entity.url),
    mainEntityOfPage: absolute(entity.url),
    datePublished: entity.publicationDate,
    author,
    publisher: { '@id': `${absolute('/')}#organization` },
    keywords: entity.technologies.map((technology) => technology.label),
    ...(entity.hero ? { image: entity.hero.url } : {}),
  };
}

export function publicEngineeringProfileJsonLd(
  entity: ImmutablePublic<PublicEngineeringProfileSummary> & {
    areasOfExpertise?: readonly string[];
  },
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${absolute(entity.url)}#person`,
    name: entity.title,
    jobTitle: entity.role,
    description: entity.summary,
    url: absolute(entity.url),
    worksFor: { '@id': `${absolute('/')}#organization` },
    knowsAbout: [
      ...(entity.areasOfExpertise ?? []),
      ...entity.technologies.map((technology) => technology.label),
    ],
    ...(entity.portrait ? { image: entity.portrait.url } : {}),
  };
}

export function aboutPageJsonLd(team: readonly ImmutablePublic<PublicTeamMemberSummary>[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${absolute('/about')}#about`,
    name: 'About HubZero',
    url: absolute('/about'),
    isPartOf: { '@id': `${absolute('/')}#website` },
    mainEntity: { '@id': `${absolute('/')}#organization` },
    ...(team.length
      ? {
          mentions: team.map((member) => ({
            '@type': 'Person',
            name: member.title,
            jobTitle: member.role,
            ...(member.profile ? { url: absolute(member.profile.url) } : {}),
          })),
        }
      : {}),
  };
}

export function servicesPageJsonLd(
  services: readonly ImmutablePublic<PublicServiceSummary>[],
  description: string,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${absolute('/services')}#services`,
    name: 'HubZero Services',
    description,
    url: absolute('/services'),
    isPartOf: { '@id': `${absolute('/')}#website` },
    provider: { '@id': `${absolute('/')}#organization` },
    ...(services.length
      ? {
          hasPart: services.map((service) => ({
            '@type': 'Service',
            name: service.title,
            description: service.summary,
            provider: { '@id': `${absolute('/')}#organization` },
          })),
        }
      : {}),
  };
}

export function contactPageJsonLd(description: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${absolute('/contact')}#contact`,
    name: 'Contact HubZero',
    description,
    url: absolute('/contact'),
    isPartOf: { '@id': `${absolute('/')}#website` },
    about: { '@id': `${absolute('/')}#organization` },
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${absolute('/')}#website`,
    name: PUBLIC_SITE.name,
    url: absolute('/'),
    publisher: { '@id': `${absolute('/')}#organization` },
  };
}

export function breadcrumbJsonLd(items: readonly { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}

export function collectionPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
  entries: readonly { title: string; url: string }[];
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: absolute(input.path),
    isPartOf: { '@id': `${absolute('/')}#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: input.entries.length,
      itemListElement: input.entries.map((entry, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: entry.title,
        url: absolute(entry.url),
      })),
    },
  };
}

export function publicArtifactJsonLd(
  entity: ImmutablePublic<
    PublicWorkSummary | PublicBuildSummary | PublicBlueprintSummary | PublicLabSummary
  >,
): JsonLd {
  const common = {
    '@context': 'https://schema.org',
    '@id': `${absolute(entity.url)}#artifact`,
    name: entity.title,
    description: entity.summary,
    url: absolute(entity.url),
    keywords: entity.technologies.map((technology) => technology.label),
    ...(entity.hero ? { image: entity.hero.url } : {}),
  };
  if (entity.type === 'build') {
    return {
      ...common,
      '@type': 'Product',
      brand: { '@id': `${absolute('/')}#organization` },
      manufacturer: { '@id': `${absolute('/')}#organization` },
    };
  }
  if (entity.type === 'work') {
    return {
      ...common,
      '@type': 'CreativeWork',
      genre: 'Engineering case study',
      creator: { '@id': `${absolute('/')}#organization` },
      about: entity.categories.map((category) => category.label),
    };
  }
  if (entity.type === 'blueprint') {
    return {
      ...common,
      '@type': 'CreativeWork',
      genre: 'Reusable engineering blueprint',
      creator: { '@id': `${absolute('/')}#organization` },
      version: entity.version,
      about: [entity.architecture, entity.designLanguage],
    };
  }
  return {
    ...common,
    '@type': 'CreativeWork',
    creator: { '@id': `${absolute('/')}#organization` },
    dateCreated: entity.startDate,
    ...(entity.lastMajorUpdate ? { dateModified: entity.lastMajorUpdate } : {}),
  };
}
