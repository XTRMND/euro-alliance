'use client'

import { setPair, usePair } from './send-document-pair'
import styles from './SendDocument.module.css'

// The language pair (51:299 / 115:828): two native selects. On wide screens «от» is read but not
// shown and «на» sits between them; on small screens each label sits inside its box («От
// Български ▾»).

type LanguagePairProps = {
  languages: string[]
  labels: { from: string; to: string }
}

export function LanguagePair({ languages, labels }: LanguagePairProps) {
  const pair = usePair({ from: languages[0], to: languages[1] })!

  return (
    <div className={styles.pair}>
      <label className={[styles.field, styles.fieldFrom].join(' ')}>
        <span className={styles.fieldLabel}>{labels.from}</span>
        <span className={styles.box}>
          <select
            className={styles.select}
            value={pair.from}
            onChange={(event) => setPair({ ...pair, from: event.target.value })}
          >
            {languages.map((language) => (
              <option key={language}>{language}</option>
            ))}
          </select>
        </span>
      </label>
      <label className={[styles.field, styles.fieldTo].join(' ')}>
        <span className={styles.fieldLabel}>{labels.to}</span>
        <span className={styles.box}>
          <select
            className={styles.select}
            value={pair.to}
            onChange={(event) => setPair({ ...pair, to: event.target.value })}
          >
            {languages.map((language) => (
              <option key={language}>{language}</option>
            ))}
          </select>
        </span>
      </label>
    </div>
  )
}
