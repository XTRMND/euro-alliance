import { getTranslations } from 'next-intl/server'
import mapPin from '@/assets/map-pin.svg'
import { Button } from '@/components/ui/Button'
import { Img } from '@/components/ui/Img'
import { Tape } from '@/components/visuals/Tape'
import type { Media } from '@/payload-types'
import { CopyAddress } from './CopyAddress'
import styles from './LocationCard.module.css'

// Location card (125:302): the streets around the office as a duotone OpenStreetMap snapshot with
// the pin on the spot, taped on. The map opens the live map; «Маршрут» opens directions in the
// visitor's maps app; «Копирай адреса» copies the address. A static image, so no third-party
// map loads and no consent is needed (docs/cms-schema.md, Offices).

type LocationCardProps = {
  id: string
  kicker?: string | null
  street: string
  address?: string | null
  latitude: number
  longitude: number
  map?: Media | null
}

export async function LocationCard({
  id,
  kicker,
  street,
  address,
  latitude,
  longitude,
  map,
}: LocationCardProps) {
  const t = await getTranslations()
  const point = `${latitude},${longitude}`
  const live = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${point.replace(',', '/')}`
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${point}`

  return (
    <article id={id} className={styles.card}>
      <a href={live} target="_blank" rel="noopener" className={styles.map}>
        <span className="sr-only">{t('contact.openMap', { street })} </span>
        {map?.url && (
          <Img
            src={map.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 592px, 92vw"
            className={styles.image}
          />
        )}
        <Img src={mapPin} alt="" unoptimized className={styles.pin} />
        <span className={styles.attribution}>{t('contact.mapAttribution')}</span>
      </a>
      <Tape className={styles.tape} />
      <div className={styles.info}>
        <div className={styles.text}>
          {kicker && <p className={styles.kicker}>{kicker}</p>}
          <h3 className={styles.street}>{street}</h3>
          {address && <p className={styles.address}>{address}</p>}
        </div>
        <div className={styles.actions}>
          <Button href={directions} target="_blank" rel="noopener">
            {t('contact.route')}
          </Button>
          <CopyAddress
            address={[street, address].filter(Boolean).join(', ')}
            labels={{ copy: t('common.copyAddress'), copied: t('common.addressCopied') }}
          />
        </div>
      </div>
    </article>
  )
}
