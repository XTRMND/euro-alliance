import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { PageCounter } from './PageCounter'

/** The Page counter with its strings: only `pageCounter` goes to the client. */
export async function PageCounterBox() {
  const messages = await getMessages()
  return (
    <NextIntlClientProvider messages={{ pageCounter: messages.pageCounter }}>
      <PageCounter />
    </NextIntlClientProvider>
  )
}
