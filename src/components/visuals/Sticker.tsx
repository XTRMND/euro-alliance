import { Img } from '@/components/ui/Img'
import bulgarian from '@/assets/stickers/bulgarian.png'
import computer from '@/assets/stickers/computer.png'
import contact from '@/assets/stickers/contact.png'
import corporate from '@/assets/stickers/corporate.png'
import english from '@/assets/stickers/english.png'
import examPrep from '@/assets/stickers/exam-prep.png'
import exams from '@/assets/stickers/exams.png'
import farming from '@/assets/stickers/farming.png'
import frenchHero from '@/assets/stickers/french-hero.png'
import french from '@/assets/stickers/french.png'
import german from '@/assets/stickers/german.png'
import italianHero from '@/assets/stickers/italian-hero.png'
import italian from '@/assets/stickers/italian.png'
import professional from '@/assets/stickers/professional.png'
import russian from '@/assets/stickers/russian.png'
import spanish from '@/assets/stickers/spanish.png'
import student from '@/assets/stickers/student.png'
import teaching from '@/assets/stickers/teaching.png'
import translation from '@/assets/stickers/translation.png'
import accounting from '@/assets/stickers/accounting.png'
import customs from '@/assets/stickers/customs.png'
import banking from '@/assets/stickers/banking.png'
import management from '@/assets/stickers/management.png'
import smallBusiness from '@/assets/stickers/small-business.png'
import office from '@/assets/stickers/office.png'
import sales from '@/assets/stickers/sales.png'
import marketing from '@/assets/stickers/marketing.png'
import businessIt from '@/assets/stickers/business-it.png'
import security from '@/assets/stickers/security.png'
import hotel from '@/assets/stickers/hotel.png'
import cooking from '@/assets/stickers/cooking.png'
import catering from '@/assets/stickers/catering.png'
import tourGuide from '@/assets/stickers/tour-guide.png'
import travel from '@/assets/stickers/travel.png'
import animation from '@/assets/stickers/animation.png'
import plantProtection from '@/assets/stickers/plant-protection.png'
import floristry from '@/assets/stickers/floristry.png'
import realEstate from '@/assets/stickers/real-estate.png'
import hardwareAndNetworks from '@/assets/stickers/hardware-and-networks.png'
import wordProcessing from '@/assets/stickers/word-processing.png'
import spreadsheets from '@/assets/stickers/spreadsheets.png'
import presentations from '@/assets/stickers/presentations.png'
import internetAndEmail from '@/assets/stickers/internet-and-email.png'
import databases from '@/assets/stickers/databases.png'
import webAndGraphicDesign from '@/assets/stickers/web-and-graphic-design.png'
import specialisedSoftware from '@/assets/stickers/specialised-software.png'
import styles from './Sticker.module.css'

// Course sticker (50:274): a die-cut duotone photo with its white edge and shadow, exported once
// from Figma's image fills and served through next/image. Stickers carry no text in Figma, so
// they're decoration (alt=""); the label beside them says what they mean. One sticker, one
// meaning per page (CLAUDE.md § 6). The flag variants are the Flag component.

export const stickers = {
  english,
  german,
  french,
  italian,
  spanish,
  russian,
  bulgarian,
  'exam-prep': examPrep,
  student,
  computer,
  farming,
  translation,
  corporate,
  professional,
  exams,
  teaching,
  contact,
  'french-hero': frenchHero,
  // ЦПО professions and computer courses (308:141–308:193, the user, 02.11.2026)
  accounting: accounting,
  customs: customs,
  banking: banking,
  management: management,
  'small-business': smallBusiness,
  office: office,
  sales: sales,
  marketing: marketing,
  'business-it': businessIt,
  security: security,
  hotel: hotel,
  cooking: cooking,
  catering: catering,
  'tour-guide': tourGuide,
  travel: travel,
  animation: animation,
  'plant-protection': plantProtection,
  floristry: floristry,
  'real-estate': realEstate,
  'hardware-and-networks': hardwareAndNetworks,
  'word-processing': wordProcessing,
  spreadsheets: spreadsheets,
  presentations: presentations,
  'internet-and-email': internetAndEmail,
  databases: databases,
  'web-and-graphic-design': webAndGraphicDesign,
  'specialised-software': specialisedSoftware,
  'italian-hero': italianHero,
}

export type StickerTopic = keyof typeof stickers

type StickerProps = {
  topic: StickerTopic
  /** next/image `sizes` for the box the sticker fills. */
  sizes: string
  /** Load at once: the sticker is above the fold or the LCP element. */
  eager?: boolean
  /** Preload it from the <head> as well, so it's ready for the first paint (the LCP element). */
  preload?: boolean
  className?: string
}

/** Fills a square box (200 × 200 in Figma), the photo fitted inside it. */
export function Sticker({ topic, sizes, eager = false, preload = false, className }: StickerProps) {
  return (
    <span className={[styles.sticker, className].filter(Boolean).join(' ')}>
      <Img
        src={stickers[topic]}
        alt=""
        fill
        sizes={sizes}
        loading={eager ? 'eager' : 'lazy'}
        preload={preload}
        className={styles.image}
      />
    </span>
  )
}
