import styles from './Halftone.module.css'

// Navy halftone dots (CLAUDE.md § 6), only ever over art, never over a photo. The dots are
// Figma's own, compacted by scripts/compact-dots.mjs into a CSS mask, so the colour and opacity
// come from tokens. Fills its positioned parent; the parent sets --halftone-opacity.
//   panel           Course visual (86:416), 400 × 540, 36%
//   course-card     Course card image (62:229), 274 × 172, 42%
//   notebook-shadow Program hero art (131:311), 380 × 400, 32%

const patterns = {
  panel: styles.panel,
  'course-card': styles.courseCard,
  'notebook-shadow': styles.notebookShadow,
}

export type HalftonePattern = keyof typeof patterns

export function Halftone({ pattern, className }: { pattern: HalftonePattern; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={[styles.halftone, patterns[pattern], className].filter(Boolean).join(' ')}
    />
  )
}
