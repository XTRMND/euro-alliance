import styles from './LanguagePair.module.css'

// The translation's language pair (Trello #6): «От» and «На» as two rows of chips, each a radio
// group, with a swap button between them, instead of two long native dropdowns. Not in Figma.
// The two sides are never the same language: picking the other side's language swaps them.

type Side = 'from' | 'to'
export type Pair = Record<Side, string>

type LanguagePairProps = {
  id: string
  languages: string[]
  value: Pair
  onChange: (pair: Pair) => void
  labels: { from: string; to: string; swap: string }
  errors: Partial<Pair>
}

/**
 * The pair the step opens with. Nearly every order is to or from the centre's own language (the
 * first in the list), so it fills the side a link left open, and «От» when nothing is given;
 * the visitor then picks one language.
 */
export function initialPair(languages: string[], given: Partial<Pair> = {}): Pair {
  const known = (value?: string) => languages.find((language) => language === value) ?? ''
  const home = languages[0] ?? ''
  const from = known(given.from)
  const to = known(given.to)
  if (from && to) return from === to ? { from, to: '' } : { from, to }
  if (from) return { from, to: from === home ? '' : home }
  if (to) return { from: to === home ? '' : home, to }
  return { from: home, to: '' }
}

/** The pair after picking `language` on one side. */
export function pickLanguage(pair: Pair, side: Side, language: string, home: string): Pair {
  const other: Side = side === 'from' ? 'to' : 'from'
  if (pair[other] === language) return { [side]: language, [other]: pair[side] } as Pair
  if (!pair[other] && language !== home) return { [side]: language, [other]: home } as Pair
  return { ...pair, [side]: language }
}

export function LanguagePair({
  id,
  languages,
  value,
  onChange,
  labels,
  errors,
}: LanguagePairProps) {
  const home = languages[0] ?? ''

  const group = (side: Side) => (
    <fieldset
      className={styles.group}
      data-field={side}
      aria-describedby={errors[side] ? `${id}-${side}-error` : undefined}
    >
      <legend className={styles.legend}>{labels[side]}</legend>
      <div className={styles.chips}>
        {languages.map((language) => (
          <label key={language} className={styles.chip}>
            <input
              type="radio"
              className={styles.input}
              name={`${id}-${side}`}
              value={language}
              checked={value[side] === language}
              onChange={() => onChange(pickLanguage(value, side, language, home))}
            />
            <span className={styles.name}>{language}</span>
          </label>
        ))}
      </div>
      {errors[side] && (
        <p id={`${id}-${side}-error`} className={styles.error}>
          {errors[side]}
        </p>
      )}
    </fieldset>
  )

  return (
    <div className={styles.pair}>
      {group('from')}
      <button
        type="button"
        className={styles.swap}
        aria-label={labels.swap}
        title={labels.swap}
        disabled={!value.from && !value.to}
        onClick={() => onChange({ from: value.to, to: value.from })}
      >
        <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
          <path
            d="M6 3v13m0 0-3-3m3 3 3-3M14 17V4m0 0-3 3m3-3 3 3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {group('to')}
    </div>
  )
}
