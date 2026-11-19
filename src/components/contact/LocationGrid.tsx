import { getOffices } from '@/lib/cms'
import type { Contact, Media } from '@/payload-types'
import { LocationCard } from './LocationCard'
import styles from './LocationGrid.module.css'
import { OfficeHours } from './OfficeHours'

// The offices' Location cards (125:302) from the Contact global: under «Как да ни намерите» on
// the contact page and «Къде да донесете документите» on the Translations page (172:2422). Two
// columns from 1024px, 48px apart. Each card has its office's working hours for today's season
// (Trello #10): the Sofia card the Sofia translators', any other the central office's.
export async function LocationGrid({
  locations,
}: {
  locations: NonNullable<Contact['locations']>
}) {
  const offices = await getOffices()
  const officeAt = (anchor: string) =>
    offices.find(
      (office) => office.role === (anchor === 'sofia' ? 'translations-sofia' : 'courses'),
    )
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
          hours={<OfficeHours hours={officeAt(location.anchor)?.hours} />}
        />
      ))}
    </div>
  )
}
