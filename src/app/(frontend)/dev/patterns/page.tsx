import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CalloutBand } from '@/components/patterns/CalloutBand'
import { CardGrid } from '@/components/patterns/CardGrid'
import { CountBubble } from '@/components/patterns/CountBubble'
import { DataTable } from '@/components/patterns/DataTable'
import { FigureCard } from '@/components/patterns/FigureCard'
import { IndexCard } from '@/components/patterns/IndexCard'
import { List } from '@/components/patterns/List'
import { Polaroid } from '@/components/patterns/Polaroid'
import { ProjectCard } from '@/components/patterns/ProjectCard'
import { SectionHeading } from '@/components/patterns/SectionHeading'
import { TornWindow } from '@/components/patterns/TornWindow'
import type { Media } from '@/payload-types'
import fixtureTint from './_fixtures/fixture-about.jpg'
import fixtureColour from './_fixtures/fixture-colour.jpg'
import styles from './page.module.css'

// The pattern components (PR 6) in their Figma variants. Development only: served with
// DEV_PAGES=true and never indexed. Copy is the Figma components' own; the photo is a generated
// test fixture, tinted by the real pipeline.

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Шаблони',
  robots: { index: false, follow: false },
}

const fixturePhoto = {
  url: fixtureColour.src,
  width: fixtureColour.width,
  height: fixtureColour.height,
  alt: 'Тестова снимка',
  tints: { docs: [{ tint: 'about', url: fixtureTint.src }] },
} as unknown as Media

const rows = ['Текст на реда', 'Текст на реда', 'Текст на реда', 'Текст на реда'].map((text) => ({
  text,
}))

type Exam = { kind: string; profession: string; part: string; date: string; place: string }

export default function PatternsPage() {
  if (process.env.DEV_PAGES !== 'true') notFound()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Шаблони</h1>

      <section aria-label="Section heading" className={styles.section}>
        <SectionHeading
          kicker="Надзаглавие"
          title="Заглавие на секцията"
          highlight="секцията"
          lead="Въвеждащ текст в един-два реда."
        />
      </section>

      <section aria-label="List row" className={styles.section}>
        <CardGrid columns={3}>
          <List marker="number" items={rows} />
          <List marker="check" items={rows} />
          <List marker="box" items={rows} />
        </CardGrid>
      </section>

      <section aria-label="Index card" className={styles.section}>
        <CardGrid columns={2}>
          <IndexCard title="Заглавие" marker="number" items={rows} count="4" />
          <IndexCard title="Заглавие" marker="check" items={rows} count="B2" countLabel="Ниво" />
        </CardGrid>
      </section>

      <section aria-label="Figure card and Count bubble" className={styles.section}>
        <CardGrid columns={4}>
          <FigureCard figure="29" label="одобрени програми" />
          <FigureCard figure="20" label="професии" />
          <div className={styles.bubble}>
            <CountBubble number="B2" label="Ниво" />
          </div>
        </CardGrid>
      </section>

      <section aria-label="Callout band" className={styles.section}>
        <CalloutBand
          title="Безплатно с ваучер"
          text="Курсове по дигитални умения (DigComp), базово и средно ниво, с ваучер от Агенцията по заетостта."
          cta={{ label: 'Обучение с ваучери', href: '/dev/patterns' }}
        />
        <CalloutBand
          layout="stack"
          title="Безплатно с ваучер"
          text="Курсове по дигитални умения (DigComp), базово и средно ниво, с ваучер от Агенцията по заетостта."
          cta={{ label: 'Обучение с ваучери', href: '/dev/patterns' }}
        />
      </section>

      <section aria-label="Project card" className={styles.section}>
        <CardGrid columns={2}>
          <ProjectCard
            title="Подобряване на производствения капацитет"
            facts={[
              { label: 'Проект', value: '№ BG16RFPR001-1.004-1004' },
              { label: 'Договор', value: '23.05.2025 г.' },
              {
                label: 'Програма',
                value: '«Конкурентоспособност и иновации в предприятията» 2021–2027',
              },
              {
                label: 'Стойност',
                value: '175 958 лв, от които 131 968,51 лв безвъзмездно европейско финансиране',
              },
            ]}
            goals={[
              'Ново оборудване',
              'Производствен капацитет',
              'Ефективност на процесите',
              'По-нисък въглероден отпечатък',
            ]}
          />
        </CardGrid>
      </section>

      <section aria-label="Polaroid and Torn window" className={styles.section}>
        <div className={styles.photos}>
          <Polaroid photo={fixturePhoto} caption="Тестов надпис" clearOnHover />
          <TornWindow photo={fixturePhoto} />
        </div>
      </section>

      <section aria-label="Data table" className={styles.section}>
        <DataTable<Exam>
          caption="Изпити"
          columns={[
            { key: 'kind', label: 'Вид изпит', width: '150px', cell: (r) => r.kind },
            { key: 'profession', label: 'Професия / специалност', cell: (r) => r.profession },
            { key: 'part', label: 'Теория / практика', width: '150px', cell: (r) => r.part },
            { key: 'date', label: 'Дата и час', width: '150px', cell: (r) => r.date },
            { key: 'place', label: 'Място', width: '140px', cell: (r) => r.place },
          ]}
          rows={[
            {
              kind: 'Тест А',
              profession: 'Тестова професия',
              part: 'Теория',
              date: '—',
              place: '—',
            },
          ]}
          rowKey={(r) => r.kind}
          empty={{
            title: 'В момента няма обявени изпити.',
            text: 'Новите дати се публикуват тук.',
          }}
        />
        <DataTable<Exam>
          caption="Изпити, празна таблица"
          columns={[
            { key: 'kind', label: 'Вид изпит', width: '150px', cell: (r) => r.kind },
            { key: 'profession', label: 'Професия / специалност', cell: (r) => r.profession },
          ]}
          rows={[]}
          rowKey={(r) => r.kind}
          empty={{
            title: 'В момента няма обявени изпити.',
            text: 'Новите дати се публикуват тук.',
          }}
        />
      </section>
    </div>
  )
}
