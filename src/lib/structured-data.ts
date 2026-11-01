import type { Course, Media, News, Office, Site } from '@/payload-types'
import { routes } from './routes'
import { siteUrl } from './seo'

// schema.org data for search engines (PR 22), only from what the CMS holds: a field that's empty
// is left out, never guessed.

const absolute = (path: string) => `${siteUrl()}${path}`

type Ld = Record<string, unknown>

/** Drops empty values, so a missing field leaves no trace. */
function compact<T extends Ld>(data: T): T {
  return Object.fromEntries(
    Object.entries(data).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0),
    ),
  ) as T
}

/** The school (EducationalOrganization), with each office's address, phones and emails. */
export function organizationLd(site: Site, offices: Office[]): Ld {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': absolute('/#organization'),
    name: site.name,
    legalName: site.legalName,
    url: absolute(routes.home()),
    logo: absolute('/icon.svg'),
    foundingDate: site.foundedOn?.slice(0, 10),
    identifier: site.companyId
      ? { '@type': 'PropertyValue', propertyID: 'ЕИК', value: site.companyId }
      : undefined,
    sameAs: site.facebook ? [site.facebook] : undefined,
    location: offices.map((office) =>
      compact({
        '@type': 'Place',
        name: office.name,
        address: { '@type': 'PostalAddress', streetAddress: office.address, addressCountry: 'BG' },
        telephone: office.phones?.[0]?.number,
        email: office.emails?.[0]?.email,
      }),
    ),
  })
}

/** A course (Course), with its instance and offer only where the CMS has them. */
export function courseLd(course: Course): Ld {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    url: course.slug ? absolute(routes.course(course.slug)) : undefined,
    provider: { '@id': absolute('/#organization') },
    hasCourseInstance:
      course.startDate || course.city
        ? compact({
            '@type': 'CourseInstance',
            courseMode:
              course.format === 'online' ? 'online' : course.format ? 'onsite' : undefined,
            startDate: course.startDate?.slice(0, 10),
            location: course.city
              ? { '@type': 'Place', name: course.venue || course.city, address: course.city }
              : undefined,
          })
        : undefined,
    offers:
      typeof course.price === 'number'
        ? {
            '@type': 'Offer',
            category: 'Paid',
            price: course.price,
            priceCurrency: course.currency ?? 'EUR',
          }
        : undefined,
  })
}

/** A news article (NewsArticle). */
export function newsArticleLd(article: News): Ld {
  const cover = typeof article.cover === 'object' ? (article.cover as Media | null) : null
  return compact({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.updatedAt,
    image: cover?.url ? [absolute(cover.url)] : undefined,
    url: article.slug ? absolute(routes.newsArticle(article.slug)) : undefined,
    author: { '@id': absolute('/#organization') },
    publisher: { '@id': absolute('/#organization') },
  })
}

/** A breadcrumb trail (BreadcrumbList); the current page has no link. */
export function breadcrumbLd(items: { label: string; href?: string }[]): Ld {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) =>
      compact({
        '@type': 'ListItem',
        position: i + 1,
        name: item.label,
        item: item.href ? absolute(item.href) : undefined,
      }),
    ),
  }
}
