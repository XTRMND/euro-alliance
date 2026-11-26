import { sofiaDay } from './inquiries'

// The «Резултати» cell of the ЦПО's exams (docs/cms-schema.md § Exams). The client (25.11.2026):
// a deadline and a place where the results are announced, the link to the results kept as an
// option. Once the link is there the results are out, so it replaces the deadline and the place.

type ExamResultsFields = {
  results?: string | null
  resultsBy?: string | null
  resultsPlace?: string | null
}

export type ExamResults =
  { kind: 'link'; href: string } | { kind: 'announced'; by: string | null; place: string | null }

export function examResults(exam: ExamResultsFields): ExamResults | null {
  if (exam.results) return { kind: 'link', href: exam.results }
  const place = exam.resultsPlace?.trim() || null
  if (!exam.resultsBy && !place) return null
  return { kind: 'announced', by: exam.resultsBy ?? null, place }
}

/** The results can't be due before the exam: the deadline is the exam's day or later, in Sofia. */
export function resultsByValid(resultsBy: string | Date, examDate: string | Date): boolean {
  return sofiaDay(resultsBy) >= sofiaDay(examDate)
}
