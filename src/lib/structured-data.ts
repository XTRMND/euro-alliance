import type { Course, Media, News, Office, Site } from '@/payload-types'
import { currentGroups } from './course-state'
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

/**
 * A course (Course), with one instance per upcoming or running group and the shown group's offer,
 * only where the CMS has them.
 */
export function courseLd(course: Course, today: string): Ld {
  const groups = currentGroups(course, today).map(({ group }) => group)
  const offer = groups.find((group) => typeof group.price === 'number')
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    url: course.slug ? absolute(routes.course(course.slug)) : undefined,
    provider: { '@id': absolute('/#organization') },
    isAccessibleForFree: course.free || undefined,
    hasCourseInstance: groups.length
      ? groups.map((group) => {
          const format = group.format ?? course.format
          const office = typeof group.office === 'object' ? group.office : null
          return compact({
            '@type': 'CourseInstance',
            courseMode: format === 'online' ? 'online' : format ? 'onsite' : undefined,
            startDate: group.startDate.slice(0, 10),
            endDate: group.endDate?.slice(0, 10),
            location: office
              ? { '@type': 'Place', name: office.name, address: office.address }
              : undefined,
          })
        })
      : undefined,
    offers: course.free
      ? { '@type': 'Offer', category: 'Free', price: 0, priceCurrency: 'EUR' }
      : offer
        ? {
            '@type': 'Offer',
            category: 'Paid',
            price: offer.price,
            priceCurrency: offer.currency ?? 'EUR',
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
