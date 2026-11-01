'use client'

// «Настройки на бисквитките» reopens the consent settings. PR 17 adds the dialog that listens for
// this event (docs/motion.md § 7).

export const openCookieSettingsEvent = 'ea:open-cookie-settings'

export function CookieSettingsButton({ label, className }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(openCookieSettingsEvent))}
    >
      {label}
    </button>
  )
}
