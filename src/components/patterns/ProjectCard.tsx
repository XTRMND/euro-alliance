import { Img } from '@/components/ui/Img'
import { getTranslations } from 'next-intl/server'
import { Chip } from '@/components/ui/Chip'
import { Tape } from '@/components/visuals/Tape'
import type { Media } from '@/payload-types'
import styles from './ProjectCard.module.css'

// Project card (259:574): a funded project with its facts (label and value rows), goals as chips
// under a visible label, and the EU logo strip, shown exactly as uploaded (publicity rules).

type ProjectCardProps = {
  title: string
  facts: { label: string; value: string }[]
  goals?: string[]
  logoStrip?: Media | null
  headingLevel?: 'h2' | 'h3'
}

export async function ProjectCard({
  title,
  facts,
  goals = [],
  logoStrip,
  headingLevel: Heading = 'h3',
}: ProjectCardProps) {
  const t = await getTranslations('projectCard')
  return (
    <article className={styles.card}>
      <Tape />
      <Heading className={styles.title}>{title}</Heading>
      {facts.length > 0 && (
        <dl className={styles.facts}>
          {facts.map(({ label, value }) => (
            <div key={label} className={styles.fact}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {goals.length > 0 && (
        <div className={styles.goals}>
          <p className={styles.goalsLabel}>{t('goals')}</p>
          <ul className={styles.chips}>
            {goals.map((goal) => (
              <li key={goal}>
                <Chip>{goal}</Chip>
              </li>
            ))}
          </ul>
        </div>
      )}
      {logoStrip?.url && (
        <div className={styles.logos}>
          <Img
            src={logoStrip.url}
            alt={logoStrip.alt}
            width={logoStrip.width ?? 560}
            height={logoStrip.height ?? 110}
            unoptimized
          />
        </div>
      )}
    </article>
  )
}
