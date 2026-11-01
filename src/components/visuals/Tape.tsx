import styles from './Tape.module.css'

/** A strip of sand tape holding a card or photo (Index card, Project card, Location card). */
export function Tape({ className }: { className?: string }) {
  return <span aria-hidden="true" className={[styles.tape, className].filter(Boolean).join(' ')} />
}
