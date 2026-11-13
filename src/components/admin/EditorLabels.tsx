'use client'

import { type ReactNode, useEffect } from 'react'

// The text editor's last English words (docs/admin-redesign.md, decision 12: Bulgarian tooltips in
// the text editor). Payload translates its toolbar, but a few controls carry a fixed English
// label in the editor's own code, with no setting to change it. They're put into Bulgarian here,
// as the controls appear, and shown as tooltips too.

const labels: Record<string, string> = {
  'Drag to move': 'Хванете, за да преместите',
  'Add block': 'Добави под този ред',
  'Edit link': 'Промени връзката',
  'Remove link': 'Махни връзката',
  'Insert Paragraph': 'Нов абзац',
  'Add Row': 'Добави ред',
  'Add Column': 'Добави колона',
  // The region the admin's messages appear in.
  'Notifications alt+T': 'Известия',
}

function translate(root: ParentNode) {
  for (const element of root.querySelectorAll<HTMLElement>('[aria-label]')) {
    const bulgarian = labels[element.getAttribute('aria-label') ?? '']
    if (!bulgarian) continue
    element.setAttribute('aria-label', bulgarian)
    element.title = bulgarian
  }
}

export function EditorLabels({ children }: { children?: ReactNode }) {
  useEffect(() => {
    translate(document)
    const observer = new MutationObserver((changes) => {
      for (const change of changes)
        for (const node of change.addedNodes)
          if (node instanceof HTMLElement) {
            const own = labels[node.getAttribute('aria-label') ?? '']
            if (own) {
              node.setAttribute('aria-label', own)
              node.title = own
            }
            translate(node)
            // «Добави секция»: the search field is ready to type in as the panel opens.
            node
              .querySelector<HTMLInputElement>(
                '.blocks-drawer .block-search__input, .block-search__input',
              )
              ?.focus()
          }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])
  return children
}
