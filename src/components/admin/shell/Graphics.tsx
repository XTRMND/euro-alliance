import logoDark from '@/assets/logo-dark.svg'
import logoMark from '@/assets/logo-mark-light.svg'

// Payload's two graphics: the icon (the logo mark, 127:312, «used as the favicon / app icon») and
// the logo of the login screen (the dark variant, on the navy panel).

export function Icon() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={logoMark.src} alt="" width={24} height={24} />
}

export function Logo() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={logoDark.src} alt="Евро Алианс" width={210} height={59} />
}
