// Analytics events (docs/measurement.md § 1). Components call track() from PR 8 on; until PR 20
// connects GA4 behind statistics consent it does nothing. Event names and their params are typed,
// so a typo fails the build. Never put personal data in an event: no names, emails, phone numbers,
// file names or message text.

type Placement = 'header' | 'footer' | 'page' | 'contact'

export type AnalyticsEvents = {
  wizard_start: { topic: string; source_page: string }
  wizard_step: { step: 1 | 2 | 3; topic: string }
  wizard_submit: { topic: string; office: 'plovdiv' | 'sofia' | 'none'; has_upload: boolean }
  document_upload: { file_count: number }
  enrol_click: { course: string; language?: string; audience?: string; level?: string }
  tel_click: { office: string; placement: Placement }
  mailto_click: { inbox: 'office' | 'prevod' | 'trans'; placement: Placement }
  course_view: { course: string; language?: string; audience?: string; level?: string }
  search: { search_term: string; results_count: number; tab: string }
  voucher_apply_click: { destination: string }
  cookie_consent: {
    choice: 'essential_only' | 'all' | 'custom'
    functional: boolean
    statistics: boolean
    marketing: boolean
  }
}

export type AnalyticsEvent = keyof AnalyticsEvents

const inboxes = ['office', 'prevod', 'trans'] as const

/** The `inbox` param of a mailto link: the address's local part, if it's one of the three. */
export function inboxOf(email: string): AnalyticsEvents['mailto_click']['inbox'] | undefined {
  const local = email.split('@')[0]?.toLowerCase()
  return inboxes.find((inbox) => inbox === local)
}

export function track<E extends AnalyticsEvent>(event: E, params: AnalyticsEvents[E]): void {
  // PR 20: send to GA4 once statistics consent is granted and gtag has loaded.
  void event
  void params
}
