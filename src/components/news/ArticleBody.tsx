import { type JSXConvertersFunction, RichText } from '@payloadcms/richtext-lexical/react'
import { getTranslations } from 'next-intl/server'
import { FigureCard } from '@/components/patterns/FigureCard'
import type { News } from '@/payload-types'
import styles from './ArticleBody.module.css'

// The article text (186:2664): the lead, then the body. H2s get the ids the contents rail links
// to (src/lib/news.ts), quotes are pull quotes, and the two blocks are a row of Figure cards with
// its caption and the navy link card (one link, to another site, in a new window).

type ArticleBodyProps = {
  id: string
  lead?: string | null
  body: News['body']
  headingIds: string[]
}

type FiguresBlock = {
  items?: { figure: string; label: string; id?: string }[]
  caption?: string | null
}

type LinkCardBlock = { label?: string | null; url: string; buttonLabel?: string | null }

export async function ArticleBody({ id, lead, body, headingIds }: ArticleBodyProps) {
  const t = await getTranslations('news')
  let h2 = 0
  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    heading: ({ node, nodesToJSX }) => {
      const Tag = node.tag
      const headingId = Tag === 'h2' ? headingIds[h2++] : undefined
      return (
        <Tag id={headingId} className={Tag === 'h2' ? styles.h2 : styles.h3}>
          {nodesToJSX({ nodes: node.children })}
        </Tag>
      )
    },
    quote: ({ node, nodesToJSX }) => (
      <blockquote className={styles.quote}>{nodesToJSX({ nodes: node.children })}</blockquote>
    ),
    blocks: {
      newsFigures: ({ node }: { node: { fields: FiguresBlock } }) => {
        const { items = [], caption } = node.fields
        return (
          <figure className={styles.figures}>
            <div className={styles.figureRow}>
              {items.map((item, i) => (
                <FigureCard key={item.id ?? i} figure={item.figure} label={item.label} />
              ))}
            </div>
            {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
          </figure>
        )
      },
      newsLinkCard: ({ node }: { node: { fields: LinkCardBlock } }) => {
        const { label, url, buttonLabel } = node.fields
        return (
          <a href={url} target="_blank" rel="noopener" className={styles.linkCard}>
            <span className={styles.linkText}>
              {label && <span className={styles.linkLabel}>{label}</span>}
              <span className={styles.linkUrl}>{url.replace(/^https?:\/\//, '')}</span>
            </span>
            {buttonLabel && <span className={styles.linkButton}>{buttonLabel}</span>}
            <span className="sr-only"> ({t('newWindow')})</span>
          </a>
        )
      },
    },
  })

  return (
    <div id={id} className={styles.body}>
      {lead && <p className={styles.lead}>{lead}</p>}
      {body && <RichText data={body} converters={converters} disableContainer />}
    </div>
  )
}
