import type { ArrayField, Block, CollectionConfig, Field, GlobalConfig } from 'payload'

// Every list in the admin is named in Bulgarian (docs/admin-redesign.md, decision 12): «Добави
// стъпка», never «Добави Item», and a row is named by what it holds, never «Item 01». A list says
// its own words where it needs to; every other list gets them here, from its title, with a row
// label that reads the row's first text. tests/unit/row-labels.test.ts holds every list to this.

/** One of a list, by the list's title: «Стъпки» → «стъпка». */
export const singulars: Record<string, string> = {
  Бутони: 'бутон',
  Въпроси: 'въпрос',
  Връзки: 'връзка',
  Години: 'година',
  Групи: 'група',
  Данни: 'ред',
  Документи: 'документ',
  Езици: 'език',
  Имейли: 'имейл',
  Карти: 'карта',
  Качества: 'качество',
  Клетки: 'клетка',
  Кого: 'ред',
  Колони: 'колона',
  Логота: 'лого',
  Нива: 'ниво',
  Образци: 'образец',
  Отговори: 'отговор',
  Платформи: 'платформа',
  Правила: 'правило',
  Предимства: 'предимство',
  Редове: 'ред',
  Сертификати: 'сертификат',
  Снимки: 'снимка',
  Стъпки: 'стъпка',
  Такси: 'такса',
  Телефони: 'телефон',
  Фрази: 'фраза',
  Цели: 'цел',
  Числа: 'число',
  'От какво зависи цената': 'фактор',
  'Как да ни намерите': 'място',
}

const autoLabel = '@/components/admin/RowLabel#AutoRowLabel'

/** The word for one row: the list's own, or from its title; «ред» when neither says. */
export function singularOf(field: Pick<ArrayField, 'label' | 'labels'>): string {
  const own = field.labels?.singular
  if (typeof own === 'string' && own) return own.toLowerCase()
  const title = typeof field.label === 'string' ? field.label : ''
  return singulars[title] ?? singulars[title.split(' (')[0]] ?? 'ред'
}

function labelled(field: ArrayField): ArrayField {
  const singular = singularOf(field)
  const plural =
    (typeof field.labels?.plural === 'string' && field.labels.plural) ||
    (typeof field.label === 'string' && field.label) ||
    'Редове'
  return {
    ...field,
    labels: { singular, plural },
    admin: {
      ...field.admin,
      components: {
        ...field.admin?.components,
        RowLabel: field.admin?.components?.RowLabel ?? {
          path: autoLabel,
          clientProps: { singular },
        },
      },
    },
    fields: withRowLabels(field.fields),
  }
}

const inBlock = (block: Block): Block => ({ ...block, fields: withRowLabels(block.fields) })

/** The fields with every list named, however deep (groups, rows, tabs, sections, lists in lists). */
export function withRowLabels(fields: Field[]): Field[] {
  return fields.map((field): Field => {
    switch (field.type) {
      case 'array':
        return labelled(field)
      case 'blocks':
        return { ...field, blocks: field.blocks.map(inBlock) }
      case 'group':
      case 'row':
      case 'collapsible':
        return { ...field, fields: withRowLabels(field.fields) } as Field
      case 'tabs':
        return {
          ...field,
          tabs: field.tabs.map((tab) => ({ ...tab, fields: withRowLabels(tab.fields) })),
        } as Field
      default:
        return field
    }
  })
}

export const namedLists = <C extends CollectionConfig | GlobalConfig>(config: C): C => ({
  ...config,
  fields: withRowLabels(config.fields),
})

/** A block of the text editor (a table, a row of figures): its lists named too. */
export const namedBlock = inBlock
