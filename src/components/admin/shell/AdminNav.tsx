import type { ServerProps } from 'payload'
import {
  type NavLocation,
  type ProgramType,
  activeNavKey,
  adminFooterNav,
  adminNav,
  navTrail,
} from '@/lib/admin-nav'
import logoMark from '@/assets/logo-mark-light.svg'
import { NavTree } from './NavTree'
import { TopBar } from './TopBar'
import styles from './shell.module.css'

// The admin's shell (docs/admin-redesign.md, PR 6; Figma «Admin / Sidebar v2» 366:1133, «Admin /
// Top bar» 354:83, «Admin / Sub-nav tab» 354:58). Payload renders this in place of its own Nav;
// the top bar and the hairline sub-nav ride along, laid out beside the sidebar by CSS
// (src/app/(payload)/custom.css), and Payload's own header is hidden.

type Props = ServerProps & {
  collectionSlug?: string
  docID?: number | string
  globalSlug?: string
}

type Where = Record<string, { equals?: unknown } | undefined>

/** The list's filter when it's a single «field equals value», as the menu's links write it. */
function filterOf(searchParams: Props['searchParams']): NavLocation['filter'] {
  const where = (searchParams as { where?: Where } | undefined)?.where
  if (where && typeof where === 'object') {
    const [field, condition] = Object.entries(where)[0] ?? []
    if (field && condition?.equals !== undefined) return { field, value: String(condition.equals) }
  }
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    const match = /^where\[(\w+)\]\[equals\]$/.exec(key)
    if (match) return { field: match[1], value: String(value) }
  }
  return undefined
}

export async function AdminNav(props: Props) {
  const { payload, params, searchParams, user, collectionSlug, docID } = props
  if (!payload?.config || !user) return null
  const admin = payload.config.routes.admin

  const [programs, inquiries, doc] = await Promise.all([
    payload.find({
      collection: 'programs',
      where: { type: { not_equals: 'language' } },
      select: { type: true },
      depth: 0,
      draft: true,
      pagination: false,
    }),
    payload.count({ collection: 'inquiries', where: { status: { equals: 'new' } } }),
    openDoc(props),
  ])
  const segments = (params as { segments?: string[] } | undefined)?.segments ?? []
  const location: NavLocation = {
    path: segments.length ? `/${segments.join('/')}` : '',
    filter: filterOf(searchParams),
    doc,
  }
  const tree = adminNav({
    adminRoute: admin,
    programIds: Object.fromEntries(
      programs.docs.map((program) => [program.type, program.id]),
    ) as Partial<Record<ProgramType, number>>,
    newInquiries: inquiries.totalDocs,
  })
  const footer = adminFooterNav(admin)
  const activeKey = activeNavKey(location)
  const trail = navTrail([...tree, ...footer], activeKey)
  // The hairline sub-nav: the siblings of a third-level item (its programme branch).
  const siblings = trail.length === 3 ? (trail[1].children ?? []) : []
  const name = (user as { name?: string | null }).name || user.email || ''

  return (
    <>
      <aside className={`nav ${styles.nav}`} aria-label="Меню">
        <a href={admin} className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoMark.src} alt="" width={40} height={40} />
          <span className={styles.names}>
            <span className={styles.name}>Евро Алианс</span>
            <span className={styles.tagline}>Съдържание на сайта</span>
          </span>
        </a>
        <NavTree tree={tree} footer={footer} activeKey={activeKey} />
      </aside>
      <TopBar
        trail={trail.map(({ label, href }) => ({ label, href }))}
        // A document's own title ends the breadcrumb on a collection's edit screen.
        onDocument={Boolean(collectionSlug && docID)}
        siblings={siblings.map(({ key, label, href }) => ({ key, label, href }))}
        activeKey={activeKey}
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL || '/'}
        accountUrl={`${admin}/account`}
        logoutUrl={`${admin}/logout`}
        userName={name}
        locales={(payload.config.localization ? payload.config.localization.locales : []).map(
          (locale) => locale.code,
        )}
      />
    </>
  )
}

/** What the open document says about its place in the menu. */
async function openDoc({ payload, collectionSlug, docID }: Props): Promise<NavLocation['doc']> {
  if (!docID) return undefined
  const find = { id: docID, depth: 0, draft: true, disableErrors: true } as const
  try {
    if (collectionSlug === 'courses') {
      const course = await payload.findByID({
        collection: 'courses',
        select: { category: true },
        ...find,
      })
      return { category: course?.category }
    }
    if (collectionSlug === 'groups') {
      const group = await payload.findByID({ collection: 'groups', ...find, depth: 1 })
      const course = group?.course
      return { category: typeof course === 'object' ? course.category : undefined }
    }
    if (collectionSlug === 'programs') {
      const program = await payload.findByID({
        collection: 'programs',
        select: { type: true },
        ...find,
      })
      return { type: program?.type }
    }
  } catch {
    // A new document («create») has no record yet.
  }
  return undefined
}

export default AdminNav
