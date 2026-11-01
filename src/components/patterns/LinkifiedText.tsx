import { TrackedLink } from '@/components/contact/TrackedLink'
import { inboxOf } from '@/lib/analytics'
import { getOffices } from '@/lib/cms'
import { telHref } from '@/lib/format'
import { linkify } from '@/lib/linkify'

// A line of CMS text with its phone numbers and email addresses as links (src/lib/linkify.ts).
// A phone click reports the office whose number it is (docs/measurement.md), never the number.

export async function LinkifiedText({ text }: { text: string }) {
  const parts = linkify(text)
  if (parts.every((part) => part.kind === 'text')) return text
  const offices = parts.some((part) => part.kind === 'phone') ? await getOffices() : []
  const officeOf = (href: string) =>
    offices.find((office) => office.phones?.some(({ number }) => telHref(number) === href))?.role

  return parts.map((part, i) => {
    if (part.kind === 'text') return part.text
    if (part.kind === 'phone') {
      return (
        <TrackedLink
          key={i}
          href={part.href}
          event="tel_click"
          params={{ office: officeOf(part.href) ?? 'other', placement: 'page' }}
        >
          {part.text}
        </TrackedLink>
      )
    }
    const inbox = inboxOf(part.text)
    return inbox ? (
      <TrackedLink
        key={i}
        href={part.href}
        event="mailto_click"
        params={{ inbox, placement: 'page' }}
      >
        {part.text}
      </TrackedLink>
    ) : (
      <a key={i} href={part.href}>
        {part.text}
      </a>
    )
  })
}
