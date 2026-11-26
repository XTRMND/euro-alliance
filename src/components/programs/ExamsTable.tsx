import { getTranslations } from 'next-intl/server'
import { DataTable } from '@/components/patterns/DataTable'
import { getExams } from '@/lib/cms'
import { examResults } from '@/lib/exams'
import { formatDateLong, formatDateTime } from '@/lib/format'
import type { Exam } from '@/payload-types'
import styles from './ExamsTable.module.css'

// The ЦПО's qualification exams (Data table 267:4236): by date, from 60 days ago on. «Резултати»
// links the results when there are any; before that it gives the deadline and the place they're
// announced at (the client, 25.11.2026; not in Figma). The table's empty state without exams.
export async function ExamsTable({ caption }: { caption: string }) {
  const [exams, t] = await Promise.all([getExams(), getTranslations('program.exams')])
  return (
    <DataTable<Exam>
      caption={caption}
      rows={exams}
      rowKey={(exam) => String(exam.id)}
      empty={{ title: t('empty.title'), text: t('empty.text') }}
      columns={[
        { key: 'kind', label: t('columns.kind'), width: '150px', cell: (exam) => exam.kind },
        { key: 'subject', label: t('columns.subject'), cell: (exam) => exam.subject },
        {
          key: 'part',
          label: t('columns.part'),
          width: '150px',
          cell: (exam) => t(`part.${exam.part}`),
        },
        {
          key: 'date',
          label: t('columns.date'),
          width: '150px',
          cell: (exam) => <time dateTime={exam.date}>{formatDateTime(exam.date)}</time>,
        },
        { key: 'place', label: t('columns.place'), width: '140px', cell: (exam) => exam.place },
        {
          key: 'results',
          label: t('columns.results'),
          width: '150px',
          cell: (exam) => {
            const results = examResults(exam)
            if (!results) return null
            if (results.kind === 'link')
              return (
                <a href={results.href}>
                  {t('results')}
                  <span className="sr-only">: {exam.subject}</span>
                </a>
              )
            return (
              <span className={styles.announced}>
                {results.by && (
                  <span>
                    {t.rich('resultsBy', {
                      date: formatDateLong(results.by),
                      time: (chunks) => <time dateTime={results.by!}>{chunks}</time>,
                    })}
                  </span>
                )}
                {results.place && <span className={styles.place}>{results.place}</span>}
              </span>
            )
          },
        },
      ]}
    />
  )
}
