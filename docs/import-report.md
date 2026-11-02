<!-- A copy of scripts/import/out/report.md from the local run of 02.11.2026 (pnpm import:run against the local database). The run on staging writes its own. -->

# Content import report

Run 2026-11-02 09:38. Everything imported is published (the client approved all content, 02.11.2026).

## Counts

| | Old site | Imported |
|---|---|---|
| News articles | 203 | 0 new, 203 updated |
| Courses | 10 | 0 new, 10 updated |
| Language pages | 11 without a page on the new site | 0 new, 11 updated |
| Documents linked from the texts | 0 downloaded | 17 already in media |

News listing pages (`/News?page=N`) aren't imported: they redirect to /novini. The English copies (`/en/…`) redirect to the Bulgarian page with a 302 (docs/english/old-site.md keeps the few real translations).

## To check on staging

- 109 news titles are written in capitals on the old site and kept as written.
- 4 tables in article texts became a paragraph per row.
- Prices, as written:
  - Английски език В2 Възрастни ОНЛАЙН: «ПРОМОЦИЯ - 495 евро»
  - Английски език ниво А1 А2 В1 С ВАУЧЕРИ ОТ АЗ: «стойност на ваучер 460,16 €»
  - ПОДГОТОВКА по БЕЛ за ДЗИ: «660 евро»
  - ПОДГОТОВКА по БЕЛ за НВО: «660 евро»
  - СЕДМИЧНИ ВЕЧЕРНИ ГРУПИ УЧЕНИЦИ от нива Р2, Р3, Р4, S1, S2 (от 2-ри до 7-ми клас): «Базова цена 545 евро»
  - СЕДМИЧНИ ДНЕВНИ ГРУПИ УЧЕНИЦИ от нива S1 и S2 (от 5-ти до 7-ми клас): «Базова цена 545 евро»
  - СЪБОТНИ ГРУПИ УЧЕНИЦИ: «Базова цена 545 евро»
  - Английски език ниво А1 А2 В1 С ВАУЧЕРИ ОТ АЗ: «стойност на ваучер 900 лв.» (лв)
  - Английски език Летен интензивен курс В1: «580 лв.» (лв)
- Courses that have already started (published, but no longer listed): Английски език ниво А1 А2 В1 С ВАУЧЕРИ ОТ АЗ (2026-10-22); ПОДГОТОВКА по БЕЛ за ДЗИ (2026-10-10); ПОДГОТОВКА по БЕЛ за НВО (2026-10-10); СЕДМИЧНИ ВЕЧЕРНИ ГРУПИ УЧЕНИЦИ от нива Р2, Р3, Р4, S1, S2 (от 2-ри до 7-ми клас) (2026-10-04); СЕДМИЧНИ ДНЕВНИ ГРУПИ УЧЕНИЦИ от нива S1 и S2 (от 5-ти до 7-ми клас) (2026-10-04); СЪБОТНИ ГРУПИ УЧЕНИЦИ (2026-10-02); Английски език ниво А1 А2 В1 С ВАУЧЕРИ ОТ АЗ (2026-01-29); Педагогически специалисти (2026-01-01); Английски език Летен интензивен курс В1 (2022-06-27).
- Language pages made from the old site (the hero and the text; no textbook cards, certificates or FAQ):
  - /Language-Education/Language-Education-For-Students/German-Language → /ezitsi/nemski/uchenitsi
  - /Language-Education/Language-Education-For-Students/French-Language → /ezitsi/frenski/uchenitsi
  - /Language-Education/Language-Education-For-Students/Spanish-Language → /ezitsi/ispanski/uchenitsi
  - /Language-Education/Language-Education-For-Students/Italian-Language → /ezitsi/italianski/uchenitsi
  - /Language-Education/Language-Education-For-Students/Bulgarian-Language → /ezitsi/balgarski/uchenitsi
  - /Language-Education/Language-Education-For-Students/Russian-language → /ezitsi/ruski/uchenitsi
  - /Language-Education/Language-Educations-for-Adults/German-Language → /ezitsi/nemski/vazrastni
  - /Language-Education/Language-Educations-for-Adults/French-Language-Adults → /ezitsi/frenski/vazrastni
  - /Language-Education/Language-Educations-for-Adults/Spanish-Language → /ezitsi/ispanski/vazrastni
  - /Language-Education/Language-Educations-for-Adults/Italian-Language → /ezitsi/italianski/vazrastni
  - /Language-Education/Language-Educations-for-Adults/Bulgarian-Language → /ezitsi/balgarski/vazrastni
- Old pages not imported (the new site has its own, from the approved Figma copy, or they're sections): 31.
- Documents linked from the texts, now in Media: 17. Missing on the old site too, so their links were removed (the text stays): https://euro-alliance.net/application/site/_assets/3cfa05d81a949d7dff784f0635043db8.pdf, https://euro-alliance.net/application/site/_assets/1f731a292acfea6c274b21f6bc00cbac.pdf, https://euro-alliance.net/application/site/_assets/eaea56d47409642a15b782c45571e85c.pdf, https://euro-alliance.net/application/site/_assets/9483b04e1fde060ee95c3a924b59dce2.pdf, https://euro-alliance.net/application/site/_assets/2fb1aa6854e5e95d4cf4ebb2932c27b0.pdf, https://euro-alliance.net/application/site/_assets/78398c5191bd6d857c5418ea154426b1.pdf, https://euro-alliance.net/application/site/_assets/90dc25b64faaab91908828b525879741.pdf, https://euro-alliance.net/application/site/_assets/fb4874476966bb4d5326b77529e10e48.pdf, https://euro-alliance.net/application/site/_assets/4a877c837c44ee218c8a4a02d3fb9680.pdf, https://euro-alliance.net/application/site/_assets/11aa0d600130a1acac1f9d0f678ab491.pdf, https://euro-alliance.net/application/site/_assets/8b3991ec5b62b473f61bc9ee215662b8.pdf, https://euro-alliance.net/application/site/_assets/8b2dba768ec49d1b932017ceb9908955.pdf.
- Links to the old site without a new address: none; 4 links rewritten to the new addresses, 96 to other sites kept.

## Images

No photo from the old site is imported (the user's decision of 02.11.2026). News covers and the homepage's small photo are picked from the old covers or Unsplash (scripts/import/out/photo-decisions.json) and imported last; until then those slots show their no-image state. The About page's photos are the client's own only. Courses take the design's Course visual and sticker.

- Images inside article texts, left out (the article text has no design for images): 11, in:
  - СУПЕР ПРОМОЦИЯ ЗА НОВИ УЧЕНИЦИ: 1 (/News/205/СУПЕР-ПРОМОЦИЯ-ЗА-НОВИ-УЧЕНИЦИ)
  - ЗАПИСВАНЕ ЗА УЧЕБНАТА 2026/2027 ГОДИНА: 1 (/News/197/ЗАПИСВАНЕ-ЗА-УЧЕБНАТА-20262027-ГОДИНА)
  - Видео клип проект Green Host CoVE: 1 (/News/165/Видео-клип-проект-Green-Host-CoVE)
  - РЕЗУЛТАТИ ОТ КОНКУРС BE ECO EVERY DAY: 4 (/News/68/РЕЗУЛТАТИ-ОТ-КОНКУРС-BE-ECO-EVERY-DAY)
  - НАГРАЖДАВАНЕ НА ПОБЕДИТЕЛИТЕ ОТ АЛИАНС КОНТЕСТ 2019: 4 (/News/44/НАГРАЖДАВАНЕ-НА-ПОБЕДИТЕЛИТЕ-ОТ-АЛИАНС-КОНТЕСТ-2019)
- Old pages with photos, none imported (the new page, and how many photos the old one had): ask the client for real photos where a new section needs one.
  - / → /: 13
  - /Courses → /kursove: 8
  - /About-us/Standarts → /za-nas#standarti: 8
  - /About-us/Documents → /za-nas#dokumenti: 7
  - /About-us/Projects → /za-nas#proekti: 5
  - /Professional-Education/Professions-and-specialty → /profesionalno-obuchenie/profesii: 5
  - /About-us/Learning → /za-nas: 3
  - /Language-Education/Language-Education-For-Students/English-Language → /ezitsi/angliyski/uchenitsi: 3
  - /Translations → /prevodi: 2
  - /Professional-Education/Pedagogical-specialists → /profesionalno-obuchenie/pedagogicheski-spetsialisti: 2
  - /Language-Education/Language-Education-For-Students/German-Language → /ezitsi/nemski/uchenitsi: 2
  - /Language-Education/Language-Educations-for-Adults/German-Language → /ezitsi/nemski/vazrastni: 2
  - /Language-Education/Language-Education-For-Students/Language-Certificates → /ezitsi/angliyski/vazrastni#sertifikati: 2
  - /Language-Education/Language-Educations-for-Adults/Language-Certificates → /ezitsi/angliyski/vazrastni#sertifikati: 2
  - /Language-Education/Language-Education-For-Students/Russian-language → /ezitsi/ruski/uchenitsi: 2
  - /Language-Education/Language-Educations-for-Adults/English-Language → /ezitsi/angliyski/vazrastni: 2
  - /Vouchers → /vaucheri: 2
  - /Professional-Education → /profesionalno-obuchenie/profesii: 2
  - /Translations/Document-Translations → /prevodi: 1
  - /Translations/Interpreting → /prevodi#ustni-prevodi: 1
  - /About-us/Our-History → /za-nas#istoria: 1
  - /About-us/Our-Team → /za-nas#ekip: 1
  - /Language-Education/Language-Education-For-Students/French-Language → /ezitsi/frenski/uchenitsi: 1
  - /Language-Education/Language-Education-For-Students/Spanish-Language → /ezitsi/ispanski/uchenitsi: 1
  - /Language-Education/Language-Educations-for-Adults/Spanish-Language → /ezitsi/ispanski/vazrastni: 1
  - /Language-Education/Language-Education-For-Students/Italian-Language → /ezitsi/italianski/uchenitsi: 1
  - /Language-Education/Language-Educations-for-Adults/Italian-Language → /ezitsi/italianski/vazrastni: 1
  - /Language-Education/Language-Education-For-Students/Bulgarian-Language → /ezitsi/balgarski/uchenitsi: 1
  - /Language-Education/Language-Educations-for-Adults/Bulgarian-Language → /ezitsi/balgarski/vazrastni: 1
  - /Language-Education/Language-Educations-for-Adults/French-Language-Adults → /ezitsi/frenski/vazrastni: 1
  - /Computer-Education → /kompyutarni-kursove: 1

