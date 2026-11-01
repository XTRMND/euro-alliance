import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  aboutSections,
  anchors,
  audienceSegments,
  contactLocations,
  courseAudienceSegments,
  courseCategories,
  courseFilterValues,
  courseFormatSegments,
  devRoutes,
  languageSegments,
  queryParams,
  routes,
  segments,
} from '@/lib/routes'
import { slugify } from '@/lib/slug'

describe('URL scheme', () => {
  it.each([
    [segments.courses, 'Курсове'],
    [segments.languages, 'Езици'],
    [segments.vouchers, 'Ваучери'],
    [segments.vocational, 'Професионално обучение'],
    [segments.professions, 'Професии'],
    [segments.teachers, 'Педагогически специалисти'],
    [segments.farmers, 'Земеделци'],
    [segments.computerCourses, 'Компютърни курсове'],
    [segments.translations, 'Преводи'],
    [segments.news, 'Новини'],
    [segments.about, 'За нас'],
    [segments.contact, 'Контакти'],
    [segments.privacy, 'Поверителност'],
    [segments.cookies, 'Бисквитки'],
    [segments.search, 'Търсене'],
    [languageSegments.english, 'Английски'],
    [languageSegments.german, 'Немски'],
    [languageSegments.french, 'Френски'],
    [languageSegments.spanish, 'Испански'],
    [languageSegments.italian, 'Италиански'],
    [languageSegments.bulgarian, 'Български'],
    [languageSegments.russian, 'Руски'],
    [audienceSegments.adults, 'Възрастни'],
    [audienceSegments.students, 'Ученици'],
    [queryParams.page, 'Страница'],
    [queryParams.topic, 'Тема'],
    [queryParams.category, 'Категория'],
    [queryParams.from, 'От'],
    [queryParams.to, 'На'],
    [courseCategories.languages, 'Езици'],
    [courseCategories.exams, 'Изпити и сертификати'],
    [courseCategories.vocational, 'Професионално обучение'],
    [courseCategories.vouchers, 'Обучение с ваучери'],
    [courseCategories.teachers, 'Педагогически специалисти'],
    [courseCategories.farmers, 'Обучение за земеделци'],
    [courseCategories.computer, 'Компютърни курсове'],
    [courseAudienceSegments.companies, 'Фирми'],
    [courseFormatSegments['in-person'], 'Присъствено'],
    [courseFormatSegments.online, 'Онлайн'],
    [courseFilterValues.voucher, 'Ваучер'],
    [courseFilterValues.sortSoonest, 'Най-скоро'],
    [courseFilterValues.sortPrice, 'Цена'],
    [queryParams.audience, 'Аудитория'],
    [queryParams.language, 'Език'],
    [queryParams.format, 'Формат'],
    [queryParams.funding, 'Финансиране'],
    [queryParams.start, 'Начало'],
    [queryParams.sort, 'Сортиране'],
    [queryParams.shown, 'Показани'],
    [anchors.certificates, 'Сертификати'],
    [aboutSections.history, 'История'],
    [aboutSections.team, 'Екип'],
    [aboutSections.standards, 'Стандарти'],
    [aboutSections.documents, 'Документи'],
    [aboutSections.projects, 'Проекти'],
    [contactLocations.plovdiv, 'Пловдив'],
    [contactLocations.sofia, 'София'],
  ])('%s is the slug of «%s»', (segment, word) => {
    expect(segment).toBe(slugify(word))
  })
})

describe('routes', () => {
  it('builds the agreed paths', () => {
    expect(routes.home()).toBe('/')
    expect(routes.courses()).toBe('/kursove')
    expect(routes.courses('languages')).toBe('/kursove?kategoria=ezitsi')
    expect(routes.course('angliyski-b1')).toBe('/kursove/angliyski-b1')
    expect(routes.languageProgram('english', 'adults')).toBe('/ezitsi/angliyski/vazrastni')
    expect(routes.languageProgram('russian', 'students')).toBe('/ezitsi/ruski/uchenitsi')
    expect(routes.professions()).toBe('/profesionalno-obuchenie/profesii')
    expect(routes.teachers()).toBe('/profesionalno-obuchenie/pedagogicheski-spetsialisti')
    expect(routes.farmers()).toBe('/profesionalno-obuchenie/zemedeltsi')
    expect(routes.newsArticle('test-article')).toBe('/novini/test-article')
    expect(routes.privacy()).toBe('/poveritelnost')
    expect(routes.cookies()).toBe('/biskvitki')
  })

  it('adds the page number to the news listing only after page 1', () => {
    expect(routes.news()).toBe('/novini')
    expect(routes.news(1)).toBe('/novini')
    expect(routes.news(3)).toBe('/novini?stranitsa=3')
  })

  it('links About sections as anchors', () => {
    expect(routes.about()).toBe('/za-nas')
    expect(routes.about('history')).toBe('/za-nas#istoria')
  })

  it('preselects the contact topic only when one is given', () => {
    expect(routes.contact()).toBe('/kontakti')
    expect(routes.contact('prevodi')).toBe('/kontakti?tema=prevodi')
    expect(routes.contact('prevodi', { from: 'balgarski', to: 'nemski' })).toBe(
      '/kontakti?tema=prevodi&ot=balgarski&na=nemski',
    )
    expect(routes.contactLocation('sofia')).toBe('/kontakti#sofia')
  })

  it('encodes the search query', () => {
    expect(routes.search()).toBe('/tarsene')
    expect(routes.search('немски & B2')).toBe(
      '/tarsene?q=%D0%BD%D0%B5%D0%BC%D1%81%D0%BA%D0%B8+%26+B2',
    )
  })

  it('only allows Russian for students', () => {
    // @ts-expect-error Russian has no adults page.
    routes.languageProgram('russian', 'adults')
  })
})

describe('route folders', () => {
  const appDir = join(process.cwd(), 'src/app/(frontend)')
  const known = new Set<string>([
    ...Object.values(segments),
    ...Object.values(languageSegments),
    ...Object.values(audienceSegments),
    ...Object.values(devRoutes).flatMap((path) => path.split('/').filter(Boolean)),
  ])

  // Route groups (x), dynamic [x], private _x and parallel @x folders aren't URL segments.
  function routeFolders(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) => {
        const nested = routeFolders(join(dir, entry.name))
        return /^[([_@]/.test(entry.name) ? nested : [entry.name, ...nested]
      })
  }

  it('uses only segments from routes.ts', () => {
    expect(routeFolders(appDir).filter((name) => !known.has(name))).toEqual([])
  })
})
