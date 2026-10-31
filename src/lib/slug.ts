// Bulgarian to Latin per the official system (Закон за транслитерацията), used for every slug.
const cyrillicToLatin: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  ѝ: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sht',
  ъ: 'a',
  ь: 'y',
  ю: 'yu',
  я: 'ya',
}

export function transliterate(text: string): string {
  return (
    text
      // NFC first: NFD would split й into и + breve.
      .normalize('NFC')
      .toLowerCase()
      // The law's one named exception.
      .replace(/(?<!\p{L})българия(?!\p{L})/gu, 'bulgaria')
      // «ия» at the end of a word is «ia» (история → istoria).
      .replace(/ия(?!\p{L})/gu, 'ia')
      .replace(/[Ѐ-ӿ]/g, (char) => cyrillicToLatin[char] ?? char)
  )
}

export function slugify(text: string): string {
  return (
    transliterate(text)
      // Strip accents from Latin letters (é → e).
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  )
}
