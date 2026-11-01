import type { Extracted } from './page-count'

// The text of a PDF for the Page counter, with pdf.js (about 1.7 MB), imported only when a
// visitor picks a PDF. Its worker module runs on the main thread (pdf.js uses
// globalThis.pdfjsWorker when it's there), so there's no worker file to serve. A PDF without a
// text layer is a scan: we can't count it here.
export async function pdfText(file: File): Promise<Extracted> {
  try {
    const [pdfjs] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs'),
    ])
    const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
    const pdf = await task.promise
    const pages: string[] = []
    for (let number = 1; number <= pdf.numPages; number++) {
      const content = await (await pdf.getPage(number)).getTextContent()
      pages.push(
        content.items
          .map((item) => ('str' in item ? item.str + (item.hasEOL ? '\n' : '') : ''))
          .join(''),
      )
    }
    await task.destroy()
    const text = pages.join('\n')
    return text.trim() ? { kind: 'text', text } : { kind: 'uncountable', reason: 'image' }
  } catch {
    return { kind: 'uncountable', reason: 'unreadable' }
  }
}
