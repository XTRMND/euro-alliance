// Media's «Текстът е проверен» in a list (docs/admin-redesign.md, decision 12): said in words,
// not «вярно» / «невярно».

export function ReviewedCell({ cellData }: { cellData?: unknown }) {
  return <span>{cellData ? 'Текстът е проверен' : 'Текстът не е проверен'}</span>
}
