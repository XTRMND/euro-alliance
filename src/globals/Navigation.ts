import type { Field, GlobalConfig } from 'payload'
import { anyone, isStaff } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'

// Header, mobile menu and footer links (docs/cms-schema.md § 7). Labels are content, so they live
// here, not in messages/*.json. A header or menu link with sub-links is a disclosure button that
// opens them (e.g. «Професионално обучение»); it has no address of its own.

const hrefPattern = /^(\/|#|https:\/\/|tel:|mailto:)/
const hrefHint = 'Започва с /, #, https://, tel: или mailto:'

function validateHref(value: unknown): true | string {
  return typeof value === 'string' && hrefPattern.test(value) ? true : hrefHint
}

const label: Field = {
  name: 'label',
  type: 'text',
  label: 'Текст',
  required: true,
  localized: true,
}

const links = (name: string, title: string, extra: Field[] = []): Field => ({
  name,
  type: 'array',
  label: title,
  fields: [
    {
      type: 'row',
      fields: [
        label,
        { name: 'href', type: 'text', label: 'Адрес', required: true, validate: validateHref },
        ...extra,
      ],
    },
  ],
})

// A link that may instead open a group of sub-links.
const linksWithGroups = (name: string, title: string): Field => ({
  name,
  type: 'array',
  label: title,
  fields: [
    {
      type: 'row',
      fields: [
        label,
        {
          name: 'href',
          type: 'text',
          label: 'Адрес',
          admin: { description: 'Празно, ако връзката отваря подвръзки.' },
          validate: (value: unknown, { siblingData }: { siblingData: { children?: unknown[] } }) =>
            siblingData.children?.length && !value ? true : validateHref(value),
        },
      ],
    },
    links('children', 'Подвръзки'),
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
      fields: [
        linksWithGroups('left', 'Вляво от логото'),
        linksWithGroups('right', 'Вдясно от логото'),
      ],
    },
    linksWithGroups('menu', 'Мобилно меню'),
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
