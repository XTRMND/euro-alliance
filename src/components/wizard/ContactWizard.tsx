'use client'

import { useTranslations } from 'next-intl'
import { type ReactNode, useEffect, useId, useRef, useState, useTransition } from 'react'
import { sendInquiry } from '@/app/(frontend)/kontakti/actions'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { RadioCard } from '@/components/ui/RadioCard'
import { track } from '@/lib/analytics'
import {
  emailPattern,
  type InquiryTopic,
  inquiryTopics,
  uploadLimits,
  validPhone,
} from '@/lib/inquiries'
import { takeFiles } from '@/lib/pending-upload'
import styles from './ContactWizard.module.css'

// Contact wizard (100:518): Step 1 picks a topic, Step 2 asks what that topic needs (six
// variants), Step 3 asks who you are, then Done (docs/motion.md § 9). Links preselect the topic
// (and the course or the languages) and start at Step 2. Each step is checked before moving on;
// an error sits under its field and focus goes to the first one. Moving to a step moves focus to
// its heading. Back keeps everything entered. The server checks it all again.

export type WizardCourse = {
  slug: string
  label: string
  schedules: string[]
  entryLevel?: string | null
  /** Ask «Знаете ли нивото си?» (language and exam courses). */
  askLevel: boolean
  voucher: boolean
}

type WizardProps = {
  initialTopic?: InquiryTopic
  initialCourse?: string
  initialPair?: { from?: string; to?: string }
  courses: WizardCourse[]
  translationLanguages: string[]
  testLanguages: string[]
  stickers: Record<InquiryTopic | 'done', ReactNode>
  privacyHref: string
  doneHref: { courses: string; home: string }
  sourcePage: string
  headingLevel?: 'h2' | 'h3'
  className?: string
}

type Step = 1 | 2 | 3 | 'done'
type Values = Record<string, string>
type Errors = Partial<Record<string, string>>

const step2Fields: Record<InquiryTopic, string[]> = {
  course: ['course', 'schedule', 'levelKnown'],
  voucher: ['hasVoucher', 'voucherCourse'],
  translation: ['document', 'kind', 'from', 'to', 'office', 'files'],
  levelTest: ['testLanguage', 'testFor'],
  corporate: ['company', 'employees', 'corporateSubject'],
  other: ['subject'],
}

export function ContactWizard({
  initialTopic,
  initialCourse,
  initialPair,
  courses,
  translationLanguages,
  testLanguages,
  stickers,
  privacyHref,
  doneHref,
  sourcePage,
  headingLevel: Heading = 'h2',
  className,
}: WizardProps) {
  const t = useTranslations('wizard')
  const tDrop = useTranslations('sendDocument')
  const id = useId()
  const heading = useRef<HTMLHeadingElement>(null)
  const form = useRef<HTMLFormElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const started = useRef(false)
  const startedAt = useRef(0)
  const moved = useRef(false)
  const [step, setStep] = useState<Step>(initialTopic ? 2 : 1)
  const [topic, setTopic] = useState<InquiryTopic | undefined>(initialTopic)
  const [values, setValues] = useState<Values>(() => ({
    course: courses.some((course) => course.slug === initialCourse) ? initialCourse! : '',
    kind: 'written',
    from:
      translationLanguages.find((l) => l === initialPair?.from) ?? translationLanguages[0] ?? '',
    to: translationLanguages.find((l) => l === initialPair?.to) ?? translationLanguages[1] ?? '',
    testLanguage: testLanguages[0] ?? '',
    corporateSubject: 'language',
  }))
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string>()
  const [sending, startSending] = useTransition()

  useEffect(() => {
    startedAt.current = Date.now()
    // Files dropped on «Изпратете документ» before the wizard opened (src/lib/pending-upload.ts).
    const handed = takeFiles()
    if (handed.length > 0) {
      setFiles(handed)
      track('document_upload', { file_count: handed.length })
    }
  }, [])

  useEffect(() => {
    if (!moved.current) return
    heading.current?.focus()
    if (typeof step === 'number') track('wizard_step', { step, topic: topic ?? 'none' })
  }, [step, topic])

  const go = (next: Step) => {
    moved.current = true
    setErrors({})
    setFormError(undefined)
    setStep(next)
  }

  const start = () => {
    if (started.current) return
    started.current = true
    track('wizard_start', { topic: initialTopic ?? 'none', source_page: sourcePage })
  }

  const set = (name: string, value: string) => {
    start()
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const course = courses.find((item) => item.slug === values.course)

  /** The step's errors; focus moves to the first field with one. */
  const check = (fields: Record<string, string | undefined>) => {
    const found = Object.fromEntries(Object.entries(fields).filter(([, error]) => error))
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      form.current
        ?.querySelector<HTMLElement>(`[data-field="${first}"] :is(input, select, textarea)`)
        ?.focus()
    }
    return !first
  }

  const required = (name: string) => (values[name]?.trim() ? undefined : t('error.required'))
  const chosen = (name: string) => (values[name] ? undefined : t('error.choose'))

  const checkStep2 = () => {
    switch (topic) {
      case 'course':
        return check({
          course: required('course'),
          schedule: course && course.schedules.length > 1 ? chosen('schedule') : undefined,
          levelKnown: course?.askLevel ? chosen('levelKnown') : undefined,
        })
      case 'voucher':
        return check({ hasVoucher: chosen('hasVoucher') })
      case 'translation':
        return check({ office: chosen('office'), files: fileError(files) })
      case 'levelTest':
        return check({ testLanguage: required('testLanguage'), testFor: chosen('testFor') })
      case 'corporate':
        return check({ company: required('company') })
      case 'other':
        return check({ subject: required('subject') })
      default:
        return false
    }
  }

  const fileError = (list: File[]) => {
    if (list.length > uploadLimits.maxFiles)
      return t('error.fileCount', { count: uploadLimits.maxFiles })
    if (list.some((file) => file.size > uploadLimits.maxBytes))
      return t('error.fileSize', { size: uploadLimits.maxBytes / 1024 / 1024 })
    if (list.some((file) => !(file.type in uploadLimits.types))) return t('error.fileType')
    return undefined
  }

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return
    start()
    const next = [...files, ...list]
    setFiles(next)
    setErrors((current) => ({ ...current, files: fileError(next) }))
    track('document_upload', { file_count: list.length })
  }

  /** What the visitor answered in Step 2, as they saw it, for the inquiry and its email. */
  const answers = (): { question: string; answer: string }[] => {
    const yes = course?.entryLevel
      ? t('course.levelYes', { level: course.entryLevel })
      : t('course.levelYesPlain')
    const rows: [string, string | undefined][] =
      topic === 'course'
        ? [
            [t('course.schedule'), values.schedule],
            [
              t('course.levelKnown'),
              values.levelKnown === 'yes' ? yes : values.levelKnown && t('course.levelTest'),
            ],
          ]
        : topic === 'voucher'
          ? [
              [
                t('voucher.has'),
                values.hasVoucher &&
                  t(values.hasVoucher === 'yes' ? 'voucher.hasYes' : 'voucher.hasNo'),
              ],
              [
                t('voucher.what'),
                courses.find((c) => c.slug === values.voucherCourse)?.label ?? t('voucher.whatAny'),
              ],
            ]
          : topic === 'translation'
            ? [
                [t('translation.document'), values.document],
                [t('translation.kind'), t(`translation.kinds.${values.kind as 'written'}`)],
                [t('translation.from'), values.from],
                [t('translation.to'), values.to],
              ]
            : topic === 'levelTest'
              ? [
                  [t('levelTest.language'), values.testLanguage],
                  [
                    t('levelTest.who'),
                    values.testFor &&
                      t(values.testFor === 'student' ? 'levelTest.student' : 'levelTest.adult'),
                  ],
                ]
              : topic === 'corporate'
                ? [
                    [t('corporate.company'), values.company],
                    [t('corporate.employees'), values.employees],
                    [
                      t('corporate.subject'),
                      t(`corporate.subjects.${values.corporateSubject as 'language'}`),
                    ],
                  ]
                : [[t('other.subject'), values.subject]]
    return rows
      .filter((row): row is [string, string] => Boolean(row[1]))
      .map(([question, answer]) => ({ question, answer }))
  }

  const submit = () => {
    const email = values.email?.trim() ?? ''
    const phone = values.phone?.trim() ?? ''
    const ok = check({
      name: required('name'),
      email: !email ? t('error.required') : emailPattern.test(email) ? undefined : t('error.email'),
      phone: phone && !validPhone(phone) ? t('error.phone') : undefined,
      privacy: values.privacy === 'yes' ? undefined : t('error.privacy'),
    })
    if (!ok || !topic) return

    const data = new FormData()
    data.set(
      'inquiry',
      JSON.stringify({
        topic,
        office: topic === 'translation' ? values.office : undefined,
        course:
          topic === 'course'
            ? values.course
            : topic === 'voucher'
              ? values.voucherCourse
              : undefined,
        name: values.name,
        email,
        phone,
        message: values.message,
        answers: answers(),
        privacyAck: true,
        sourcePage,
        website: values.website ?? '',
        startedAt: startedAt.current,
      }),
    )
    if (topic === 'translation') files.forEach((file) => data.append('files', file))

    startSending(async () => {
      try {
        const result = await sendInquiry(data)
        if (result.ok) {
          track('wizard_submit', {
            topic,
            office: topic === 'translation' ? (values.office as 'plovdiv' | 'sofia') : 'none',
            has_upload: topic === 'translation' && files.length > 0,
          })
          go('done')
          return
        }
        const fieldErrors = result.errors as Record<string, string>
        if (fieldErrors.form === 'tooMany') return setFormError(t('error.tooMany'))
        const messages = Object.fromEntries(
          Object.entries(fieldErrors).map(([name, code]) => [
            name === 'privacyAck' ? 'privacy' : name,
            code === 'fileCount'
              ? t('error.fileCount', { count: uploadLimits.maxFiles })
              : code === 'fileSize'
                ? t('error.fileSize', { size: uploadLimits.maxBytes / 1024 / 1024 })
                : t(`error.${code as 'required'}`),
          ]),
        )
        if (step2Fields[topic].some((name) => name in messages)) {
          go(2)
          setErrors(messages)
        } else {
          setErrors(messages)
        }
      } catch {
        setFormError(t('error.send'))
      }
    })
  }

  const field = (
    name: string,
    label: string,
    control: (props: {
      id: string
      'aria-invalid'?: true
      'aria-describedby'?: string
    }) => ReactNode,
    className?: string,
  ) => (
    <div className={[styles.field, className].filter(Boolean).join(' ')} data-field={name}>
      <label className={styles.label} htmlFor={`${id}-${name}`}>
        {label}
      </label>
      {control({
        id: `${id}-${name}`,
        ...(errors[name] && { 'aria-invalid': true, 'aria-describedby': `${id}-${name}-error` }),
      })}
      {errors[name] && (
        <p id={`${id}-${name}-error`} className={styles.error}>
          {errors[name]}
        </p>
      )}
    </div>
  )

  const text = (
    name: string,
    label: string,
    options: {
      placeholder?: string
      type?: string
      autoComplete?: string
      inputMode?: 'numeric' | 'tel' | 'email'
    } = {},
  ) =>
    field(name, label, (props) => (
      <input
        {...props}
        className={styles.input}
        type={options.type ?? 'text'}
        placeholder={options.placeholder}
        autoComplete={options.autoComplete}
        inputMode={options.inputMode}
        value={values[name] ?? ''}
        onChange={(event) => set(name, event.target.value)}
      />
    ))

  const select = (
    name: string,
    label: string,
    options: { value: string; label: string }[],
    placeholder?: string,
  ) =>
    field(name, label, (props) => (
      <span className={styles.selectBox}>
        <select
          {...props}
          className={styles.select}
          value={values[name] ?? ''}
          onChange={(event) => set(name, event.target.value)}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
    ))

  const radios = (name: string, legend: string, options: { value: string; label: string }[]) => (
    <fieldset
      className={styles.radios}
      data-field={name}
      aria-describedby={errors[name] ? `${id}-${name}-error` : undefined}
    >
      <legend className={styles.label}>{legend}</legend>
      <div className={styles.radioRow}>
        {options.map((option) => (
          <RadioCard
            key={option.value}
            name={`${id}-${name}`}
            value={option.value}
            label={option.label}
            checked={values[name] === option.value}
            onChange={() => set(name, option.value)}
            className={styles.radio}
          />
        ))}
      </div>
      {errors[name] && (
        <p id={`${id}-${name}-error`} className={styles.error}>
          {errors[name]}
        </p>
      )}
    </fieldset>
  )

  const progress = typeof step === 'number' && (
    <div className={styles.progress}>
      <span className={styles.segments} aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={styles.segment} data-on={n <= step || undefined} />
        ))}
      </span>
      <span className={styles.stepOf}>{t('stepOf', { current: step, total: 3 })}</span>
    </div>
  )

  const actions = (next: () => void, last = false) => (
    <div className={styles.actions}>
      <Button variant="link" onClick={() => go(step === 3 ? 2 : 1)}>
        {t('back')}
      </Button>
      <Button onClick={next} disabled={sending} aria-busy={sending || undefined}>
        {last ? (sending ? t('sending') : t('submit')) : t('next')}
      </Button>
    </div>
  )

  const voucherCourses = courses.filter((item) => item.voucher)

  return (
    <form
      ref={form}
      className={[styles.wizard, className].filter(Boolean).join(' ')}
      noValidate
      onSubmit={(event) => event.preventDefault()}
    >
      {progress}

      {step === 1 && (
        <>
          <Heading ref={heading} tabIndex={-1} className={styles.title}>
            {t('step1.title')}
          </Heading>
          <ul className={styles.topics}>
            {inquiryTopics.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  className={styles.topic}
                  aria-pressed={topic === option}
                  onClick={() => {
                    start()
                    setTopic(option)
                    go(2)
                  }}
                >
                  <span className={styles.topicSticker}>{stickers[option]}</span>
                  <span className={styles.topicText}>
                    <span className={styles.topicTitle}>{t(`topic.${option}.title`)}</span>
                    <span className={styles.topicHint}>{t(`topic.${option}.text`)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className={styles.hint}>{t('step1.hint')}</p>
        </>
      )}

      {step === 2 && topic && (
        <>
          <Heading ref={heading} tabIndex={-1} className={styles.title}>
            {t(`${topic}.title`)}
          </Heading>
          {topic === 'course' && (
            <>
              {select(
                'course',
                t('course.course'),
                courses.map((item) => ({ value: item.slug, label: item.label })),
                t('course.choose'),
              )}
              {course &&
                course.schedules.length > 1 &&
                radios(
                  'schedule',
                  t('course.schedule'),
                  course.schedules.map((label) => ({ value: label, label })),
                )}
              {course?.askLevel &&
                radios('levelKnown', t('course.levelKnown'), [
                  {
                    value: 'yes',
                    label: course.entryLevel
                      ? t('course.levelYes', { level: course.entryLevel })
                      : t('course.levelYesPlain'),
                  },
                  { value: 'test', label: t('course.levelTest') },
                ])}
            </>
          )}
          {topic === 'voucher' && (
            <>
              {radios('hasVoucher', t('voucher.has'), [
                { value: 'yes', label: t('voucher.hasYes') },
                { value: 'no', label: t('voucher.hasNo') },
              ])}
              {voucherCourses.length > 0 &&
                select(
                  'voucherCourse',
                  t('voucher.what'),
                  voucherCourses.map((item) => ({ value: item.slug, label: item.label })),
                  t('voucher.whatAny'),
                )}
            </>
          )}
          {topic === 'translation' && (
            <>
              {text('document', t('translation.document'), {
                placeholder: t('translation.documentPlaceholder'),
              })}
              {radios(
                'kind',
                t('translation.kind'),
                (['written', 'oral', 'legalisation'] as const).map((value) => ({
                  value,
                  label: t(`translation.kinds.${value}`),
                })),
              )}
              <div className={styles.pair}>
                {translationLanguages.length >= 2
                  ? select(
                      'from',
                      t('translation.from'),
                      translationLanguages.map((value) => ({ value, label: value })),
                    )
                  : text('from', t('translation.from'))}
                {translationLanguages.length >= 2
                  ? select(
                      'to',
                      t('translation.to'),
                      translationLanguages.map((value) => ({ value, label: value })),
                    )
                  : text('to', t('translation.to'))}
              </div>
              {radios('office', t('translation.office'), [
                { value: 'plovdiv', label: t('translation.offices.plovdiv') },
                { value: 'sofia', label: t('translation.offices.sofia') },
              ])}
              <div
                className={styles.dropzone}
                data-field="files"
                onDragOver={(event) =>
                  event.dataTransfer.types.includes('Files') && event.preventDefault()
                }
                onDrop={(event) => {
                  event.preventDefault()
                  addFiles(event.dataTransfer.files)
                }}
              >
                <p className={styles.dropTitle}>{tDrop('dropTitle')}</p>
                <p className={styles.dropHint}>{tDrop('dropHint')}</p>
                <Button
                  variant="secondary"
                  onClick={() => fileInput.current?.click()}
                  aria-describedby={errors.files ? `${id}-files-error` : undefined}
                >
                  {tDrop('chooseFile')}
                </Button>
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  hidden
                  accept={Object.values(uploadLimits.types)
                    .map((ext) => `.${ext}`)
                    .join(',')}
                  onChange={(event) => {
                    addFiles(event.target.files)
                    event.target.value = ''
                  }}
                />
                {files.length > 0 && (
                  <ul
                    className={styles.files}
                    aria-label={t('translation.files', { count: files.length })}
                  >
                    {files.map((file, i) => (
                      <li key={`${file.name}-${i}`} className={styles.file}>
                        <span>{file.name}</span>
                        <button
                          type="button"
                          className={styles.remove}
                          aria-label={t('translation.remove', { name: file.name })}
                          onClick={() => {
                            const next = files.filter((_, n) => n !== i)
                            setFiles(next)
                            setErrors((current) => ({ ...current, files: fileError(next) }))
                          }}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {errors.files && (
                  <p id={`${id}-files-error`} className={styles.error}>
                    {errors.files}
                  </p>
                )}
              </div>
            </>
          )}
          {topic === 'levelTest' && (
            <>
              {select(
                'testLanguage',
                t('levelTest.language'),
                testLanguages.map((value) => ({ value, label: value })),
              )}
              {radios('testFor', t('levelTest.who'), [
                { value: 'student', label: t('levelTest.student') },
                { value: 'adult', label: t('levelTest.adult') },
              ])}
              <p className={styles.note}>{t('levelTest.note')}</p>
            </>
          )}
          {topic === 'corporate' && (
            <>
              <div className={styles.pair}>
                {text('company', t('corporate.company'), {
                  placeholder: t('corporate.companyPlaceholder'),
                  autoComplete: 'organization',
                })}
                {text('employees', t('corporate.employees'), {
                  placeholder: t('corporate.employeesPlaceholder'),
                  inputMode: 'numeric',
                })}
              </div>
              {select(
                'corporateSubject',
                t('corporate.subject'),
                (['language', 'computer', 'vocational', 'other'] as const).map((value) => ({
                  value,
                  label: t(`corporate.subjects.${value}`),
                })),
              )}
            </>
          )}
          {topic === 'other' &&
            text('subject', t('other.subject'), { placeholder: t('other.subjectPlaceholder') })}
          {actions(() => checkStep2() && go(3))}
        </>
      )}

      {step === 3 && (
        <>
          <Heading ref={heading} tabIndex={-1} className={styles.title}>
            {t('step3.title')}
          </Heading>
          <div className={styles.pair}>
            {text('name', t('step3.name'), {
              placeholder: t('step3.namePlaceholder'),
              autoComplete: 'name',
            })}
            {text('phone', t('step3.phone'), {
              placeholder: t('step3.phonePlaceholder'),
              type: 'tel',
              autoComplete: 'tel',
              inputMode: 'tel',
            })}
          </div>
          {text('email', t('step3.email'), {
            placeholder: t('step3.emailPlaceholder'),
            type: 'email',
            autoComplete: 'email',
            inputMode: 'email',
          })}
          {field('message', t('step3.message'), (props) => (
            <textarea
              {...props}
              className={[styles.input, styles.textarea].join(' ')}
              placeholder={t('step3.messagePlaceholder')}
              value={values.message ?? ''}
              onChange={(event) => set('message', event.target.value)}
            />
          ))}
          {/* For bots only: hidden from people and from assistive technology. */}
          <div className={styles.honeypot} aria-hidden="true">
            <label>
              {t('step3.honeypot')}
              <input
                tabIndex={-1}
                autoComplete="off"
                value={values.website ?? ''}
                onChange={(event) => set('website', event.target.value)}
              />
            </label>
          </div>
          <div data-field="privacy">
            <Checkbox
              label={t.rich('step3.privacy', {
                link: (chunks) => (
                  <a href={privacyHref} target="_blank" rel="noopener" className={styles.link}>
                    {chunks}
                  </a>
                ),
              })}
              checked={values.privacy === 'yes'}
              onChange={(event) => set('privacy', event.target.checked ? 'yes' : '')}
              aria-invalid={errors.privacy ? true : undefined}
              aria-describedby={errors.privacy ? `${id}-privacy-error` : undefined}
            />
            {errors.privacy && (
              <p id={`${id}-privacy-error`} className={styles.error}>
                {errors.privacy}
              </p>
            )}
          </div>
          {formError && (
            <p className={styles.error} role="alert">
              {formError}
            </p>
          )}
          {actions(submit, true)}
        </>
      )}

      {step === 'done' && (
        <div className={styles.done}>
          <span className={styles.doneSticker}>{stickers.done}</span>
          <Heading ref={heading} tabIndex={-1} className={styles.title}>
            {t('done.title')}
          </Heading>
          <p className={styles.doneText} role="status">
            {t('done.text')}
          </p>
          {topic === 'course' || topic === 'voucher' || topic === 'levelTest' ? (
            <Button href={doneHref.courses} variant="link">
              {t('done.toCourses')}
            </Button>
          ) : (
            <Button href={doneHref.home} variant="link">
              {t('done.toHome')}
            </Button>
          )}
        </div>
      )}
    </form>
  )
}
