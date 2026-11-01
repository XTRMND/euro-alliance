// Files dropped on «Изпратете документ» (homepage, Translations page) travel to the contact
// wizard's upload step (PR 11) in memory, through a client-side navigation: never stored, never
// sent anywhere until the visitor submits the wizard. A reload or a new tab drops them, and the
// wizard simply asks for the files again.

let pending: File[] = []

export function handOverFiles(files: Iterable<File>): void {
  pending = [...files]
}

/** The files handed over, once: taking them clears the hand-off. */
export function takeFiles(): File[] {
  const files = pending
  pending = []
  return files
}
