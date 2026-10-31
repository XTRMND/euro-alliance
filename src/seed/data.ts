// Verified client facts (CLAUDE.md § 3) and the office copy from the approved Figma Contact page
// (119:1875). Nothing here may be invented: leave a value out rather than guess it.

export const company = {
  name: 'Евро Алианс',
  legalName: 'ЕВРО-АЛИАНС ООД',
  companyId: '115302753',
  foundedOn: '1999-02-08T12:00:00.000Z',
  foundedIn: 'Пловдив',
  licence: { issuer: 'НАПОО', number: '200312088', issuedOn: '2003-11-15T12:00:00.000Z' },
  certifications: [{ standard: 'ISO 9001:2015' }, { standard: 'ISO 17100:2015' }],
  bank: { name: 'Инвестбанк', iban: 'BG58 IORT 8129 1003 0255 00', bic: 'IORTBGSF' },
}

export const offices = [
  {
    role: 'courses',
    name: 'Централен офис, Пловдив',
    department: 'Курсове и обучения',
    address: 'Образователен бизнес център ЕВРО-АЛИАНС, Пловдив 4003, ул. Самара №13',
    phones: [{ number: '+359 886 601 108' }],
    emails: [{ email: 'office@euro-alliance.net' }],
  },
  {
    role: 'translations-plovdiv',
    name: 'Преводи, Пловдив',
    department: 'Преводи и легализация',
    address: 'Пловдив 4003, ул. Самара №13',
    phones: [{ number: '+359 885 504 509' }],
    emails: [{ email: 'prevod@euro-alliance.net' }],
  },
  {
    role: 'translations-sofia',
    name: 'Преводи, София',
    department: 'Преводи и легализация',
    address: '1000 София, ул. Георги С. Раковски 125',
    phones: [{ number: '+359 884 252 909' }],
    emails: [{ email: 'trans@euro-alliance.net' }],
  },
] as const
