import { getTranslations } from 'next-intl/server'
import { DataTable } from '@/components/patterns/DataTable'
import { getExams } from '@/lib/cms'
import { formatDateTime } from '@/lib/format'
import type { Exam } from '@/payload-types'

// The ЦПО's qualification exams (Data table 267:4236): by date, from 60 days ago on, with a link
// to the results when there are any; the table's empty state without exams.
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
          width: '120px',
          cell: (exam) =>
            exam.results ? (
              <a href={exam.results}>
                {t('results')}
                <span className="sr-only">: {exam.subject}</span>
              </a>
            ) : null,
        },
      ]}
    />
  )
}
