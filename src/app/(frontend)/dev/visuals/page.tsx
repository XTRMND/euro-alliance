import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import agentsia from '@/seed/partners/agentsia-po-zaetostta.png'
import agraren from '@/seed/partners/agraren-universitet-plovdiv.png'
import gateway from '@/seed/partners/gateway-school-of-english.png'
import napoo from '@/seed/partners/napoo.png'
import oxford from '@/seed/partners/oxford-university-press.png'
import pearson from '@/seed/partners/pearson-longman.png'
import paisiy from '@/seed/partners/pu-paisiy-hilendarski.png'
import tpk from '@/seed/partners/tpk-plovdiv.png'
import { CourseVisual } from '@/components/visuals/CourseVisual'
import { Flag, flags, type FlagLanguage } from '@/components/visuals/Flag'
import { Globe } from '@/components/visuals/Globe'
import { Halftone } from '@/components/visuals/Halftone'
import { LanguageStrip } from '@/components/visuals/LanguageStrip'
import { type PartnerLogo, LogoStrip } from '@/components/visuals/LogoStrip'
import { ProgramHeroArt } from '@/components/visuals/ProgramHeroArt'
import { Sticker, stickers, type StickerTopic } from '@/components/visuals/Sticker'
import styles from './page.module.css'

// The visuals (PR 7): stickers, flags, Course visual, Program hero art, halftone, both strips and
// the globe. Development only: served with DEV_PAGES=true and never indexed. Copy and partner
// logos are the Figma components' own (Program hero art 131:311, Marquee / Logos 63:711); PR 8
// seeds the partners from src/seed/partners.

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Визуални елементи',
  robots: { index: false, follow: false },
}

const partners: PartnerLogo[] = [
  { name: 'Агенция по заетостта', src: agentsia },
  { name: 'НАПОО', src: napoo },
  { name: 'Аграрен университет – Пловдив', src: agraren },
  { name: 'Pearson Longman', src: pearson },
  { name: 'Oxford University Press', src: oxford },
  { name: 'Търговско-промишлена камара – Пловдив', src: tpk },
  { name: 'Пловдивски университет „Паисий Хилендарски“', src: paisiy },
  { name: 'Gateway School of English', src: gateway },
]

const phrases = [
  { phrase: 'Hello!', translation: 'Здравей!' },
  { phrase: 'How are you?', translation: 'Как си?' },
  { phrase: 'Nice to meet you.', translation: 'Приятно ми е.' },
]

export default function VisualsPage() {
  if (process.env.DEV_PAGES !== 'true') notFound()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Визуални елементи</h1>

      <section aria-label="Globe" className={styles.section}>
        <div className={styles.globe}>
          <Globe />
        </div>
      </section>

      <section aria-label="Language strip" className={styles.section}>
        <LanguageStrip />
      </section>

      <section aria-label="Partner logos" className={styles.section}>
        <LogoStrip logos={partners} />
      </section>

      <section aria-label="Course visual" className={`${styles.section} ${styles.clip}`}>
        <div className={styles.row}>
          <CourseVisual topic="english" className={styles.courseVisual} />
          <CourseVisual topic="exam-prep" landing className={styles.courseVisual} />
        </div>
      </section>

      <section aria-label="Program hero art" className={`${styles.section} ${styles.clip}`}>
        <div className={styles.row}>
          <ProgramHeroArt
            title="Първи думи"
            phrases={phrases}
            lang="en"
            flag="english"
            className={styles.heroArt}
          />
          <ProgramHeroArt
            title="Първи думи"
            phrases={phrases}
            lang="en"
            flag="english"
            note={{
              title: 'Първи стъпки',
              steps: ['входен тест', 'избери ниво', 'първи час'],
              done: 1,
            }}
            className={styles.heroArt}
          />
        </div>
      </section>

      <section aria-label="Course card halftone" className={styles.section}>
        <div className={styles.cardImage}>
          <Halftone pattern="course-card" />
        </div>
      </section>

      <section aria-label="Stickers" className={styles.section}>
        <ul className={styles.grid}>
          {(Object.keys(stickers) as StickerTopic[]).map((topic) => (
            <li key={topic}>
              <Sticker topic={topic} sizes="(min-width: 768px) 200px, 40vw" />
              <span className={styles.caption}>{topic}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Flags" className={styles.section}>
        <ul className={styles.grid}>
          {(Object.keys(flags) as FlagLanguage[]).map((language) => (
            <li key={language}>
              <Flag language={language} />
              <span className={styles.caption}>{language}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
