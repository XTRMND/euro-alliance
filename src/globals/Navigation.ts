import type { Field, GlobalConfig } from 'payload'
import { anyone, isStaff } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'

// Header, mobile menu and footer links (docs/cms-schema.md § 7). Labels are content, so they live
// here, not in messages/*.json.

function validateHref(value: unknown): true | string {
  return typeof value === 'string' && /^(\/|#|https:\/\/|tel:|mailto:)/.test(value)
    ? true
    : 'Започва с /, #, https://, tel: или mailto:'
}

const links = (name: string, label: string, extra: Field[] = []): Field => ({
  name,
  type: 'array',
  label,
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', label: 'Текст', required: true, localized: true },
        { name: 'href', type: 'text', label: 'Адрес', required: true, validate: validateHref },
        ...extra,
      ],
    },
  ],
})

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Навигация',
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'header',
      type: 'group',
      label: 'Горна лента (компютър)',
      fields: [links('left', 'Вляво от логото'), links('right', 'Вдясно от логото')],
    },
    links('menu', 'Мобилно меню'),
    {
      name: 'footer',
      type: 'array',
      label: 'Колони в долния колонтитул',
      fields: [
        { name: 'heading', type: 'text', label: 'Заглавие', required: true, localized: true },
        links('links', 'Връзки', [
          {
            name: 'icon',
            type: 'select',
            label: 'Икона',
            options: [{ label: 'Facebook', value: 'facebook' }],
            admin: { description: 'На компютър връзката се показва като икона.' },
          },
        ]),
      ],
    },
  ],
}
