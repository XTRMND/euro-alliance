import type { ReactNode } from 'react'
import { Breadcrumb } from '@/components/patterns/Breadcrumb'
import { withHighlight } from '@/components/patterns/Highlight'
import { ProgramHeroArt } from '@/components/visuals/ProgramHeroArt'
import type { Language } from '@/lib/routes'
import type { Program } from '@/payload-types'
import landing from '@/styles/landing.module.css'
import styles from './LanguageHero.module.css'

// The language pages' hero (130:1993 / 147:1317): breadcrumb, the H1 with its highlight, the
// audience tabs, the lead and the buttons; beside it the notebook with the language's first
// phrases and its flag (Program hero art 131:311). On mobile the notebook comes before the
// buttons. Landing from «Prototype · Програма landing» (156:2154): the copy rises 36px, the
// notebook turns in from −4°; the H1 rises without fading in (it's the LCP candidate).

const bcp47: Record<Language, string> = {
  english: 'en',
  german: 'de',
  french: 'fr',
  spanish: 'es',
  italian: 'it',
  bulgarian: 'bg',
  russian: 'ru',
}

type LanguageHeroProps = {
  program: Program
  language: Language
  breadcrumb: { label: string; href?: string }[]
  tabs: ReactNode
  actions: ReactNode
}

export function LanguageHero({ program, language, breadcrumb, tabs, actions }: LanguageHeroProps) {
  const notebook = program.notebook
  const phrases = (notebook?.phrases ?? []).map((item) => ({
    phrase: item.phrase,
    translation: item.translation ?? '',
  }))
  const note =
    notebook?.note?.title && notebook.note.steps?.length
      ? {
          title: notebook.note.title,
          steps: notebook.note.steps.map((step) => step.text),
          done: notebook.note.done ?? 0,
        }
      : undefined

  return (
    <div className={styles.hero}>
      <div className={styles.inner}>
        <div className={[styles.copy, landing.copy].join(' ')}>
          <Breadcrumb items={breadcrumb} />
        </div>
        <h1 className={[styles.title, landing.rise].join(' ')}>
          {withHighlight(program.hero.heading, program.hero.highlight)}
        </h1>
        <div className={[styles.tabs, landing.copy].join(' ')}>{tabs}</div>
        {program.hero.lead && (
          <p className={[styles.lead, landing.copy].join(' ')}>{program.hero.lead}</p>
        )}
        {/* Always the notebook with the flag; its phrases only where the CMS has them (no source
            has first phrases beyond English, and they're never invented). */}
        <ProgramHeroArt
          title={notebook?.title ?? ''}
          phrases={phrases}
          lang={bcp47[language]}
          flag={language}
          highlight={notebook?.highlight ? notebook.highlight - 1 : -1}
          note={note}
          className={styles.art}
        />
        <div className={[styles.actions, landing.copy].join(' ')}>{actions}</div>
      </div>
    </div>
  )
}
