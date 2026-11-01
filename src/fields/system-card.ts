import type { Field } from 'payload'

// The fields of a System card (135:389): a textbook system (Textbook systems) or an inline card of
// the same shape on a program page (the voucher programmes, the farmers' courses). Brand names
// such as «New Total English» aren't translated, so a textbook system's name isn't localized.
export function systemCardFields({ localizedName }: { localizedName: boolean }): Field[] {
  return [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Име', required: true, localized: localizedName },
        {
          name: 'kicker',
          type: 'text',
          label: 'Надпис над името',
          localized: true,
          admin: { description: 'Издател или възраст, например «Longman» или «III–VII клас».' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'count',
          type: 'text',
          label: 'Число в балончето',
          admin: { description: 'Например 6 или C1.' },
        },
        {
          name: 'countLabel',
          type: 'text',
          label: 'Надпис в балончето',
          localized: true,
          admin: { description: 'Например «нива» или «до ниво».' },
        },
      ],
    },
    { name: 'description', type: 'textarea', label: 'Описание', localized: true },
    {
      name: 'levels',
      type: 'array',
      label: 'Нива',
      fields: [{ name: 'level', type: 'text', label: 'Ниво', required: true, localized: true }],
    },
    {
      name: 'strip',
      type: 'group',
      label: 'Бележка на тъмната ивица',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Надпис',
              localized: true,
              admin: { description: 'Например «Включено», «Фокус», «Цел».' },
            },
            { name: 'note', type: 'text', label: 'Бележка', localized: true },
          ],
        },
      ],
    },
  ]
}
