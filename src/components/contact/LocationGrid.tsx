import type { Contact, Media } from '@/payload-types'
import { LocationCard } from './LocationCard'
import styles from './LocationGrid.module.css'

// The offices' Location cards (125:302) from the Contact global: under «Как да ни намерите» on
// the contact page and «Къде да донесете документите» on the Translations page (172:2422). Two
// columns from 1024px, 48px apart.
export function LocationGrid({ locations }: { locations: NonNullable<Contact['locations']> }) {
  return (
    <div className={styles.grid}>
      {locations.map((location) => (
        <LocationCard
          key={location.id ?? location.anchor}
          id={location.anchor}
          kicker={location.kicker}
          street={location.street}
          address={location.address}
          latitude={location.latitude}
          longitude={location.longitude}
          map={typeof location.map === 'object' ? (location.map as Media | null) : null}
        />
      ))}
    </div>
  )
}
