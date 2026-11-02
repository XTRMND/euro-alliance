import type { Media } from '@/payload-types'

// The size (CSS px) each news slot needs from its cover, from the components. A cover smaller than
// its slot isn't enlarged to fill it (no upscaling: the user's decision of 02.11.2026); the slot
// shows its no-image state instead, the card or the hero without a picture, as for a news item
// without a cover. Crops come from object-fit and the focal point set in the admin.
export const newsSlots = {
  /** NewsCard: 420 wide on the homepage, 405 on the news pages, 220 tall. */
  card: { width: 420, height: 220 },
  /** NewsFeature, the lead story on the news listing: 680 × 420 from 1024 px. */
  lead: { width: 680, height: 420 },
  /**
   * NewsArticle's banner as a 1024 px screen shows it (the user's choice, 02.11.2026). It grows to
   * 1280 × 520 at 1440 px, so a cover between the two is enlarged up to 1.4× on wide screens.
   */
  banner: { width: 908, height: 407 },
} as const

export type Slot = { readonly width: number; readonly height: number }

/** Whether a picture fills a slot without being enlarged; one without known dimensions does. */
export function fillsSlot(media: Pick<Media, 'width' | 'height'>, slot: Slot): boolean {
  if (!media.width || !media.height) return true
  return media.width >= slot.width && media.height >= slot.height
}

/** A cover for the article banner: big enough, and no text in it that the wide crop would cut. */
export function bannerShows(media: Pick<Media, 'width' | 'height' | 'textInImage'>): boolean {
  return !media.textInImage && fillsSlot(media, newsSlots.banner)
}
