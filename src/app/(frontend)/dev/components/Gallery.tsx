'use client'

import { useState } from 'react'
import { Button, type ButtonVariant } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Chip, ChipButton } from '@/components/ui/Chip'
import { RadioCard } from '@/components/ui/RadioCard'
import { Toggle } from '@/components/ui/Toggle'
import styles from './Gallery.module.css'

// Labels are the Figma components' own defaults, so each row compares 1:1 with its node.

const variants: ButtonVariant[] = ['primary', 'secondary', 'accent', 'link']

export function Gallery() {
  const [clicks, setClicks] = useState(0)
  const [checked, setChecked] = useState(false)
  const [option, setOption] = useState('a')
  const [toggle, setToggle] = useState(false)
  const [pressed, setPressed] = useState(false)
  // Specimens count clicks too: no button on any page is without an action.
  const count = () => setClicks((n) => n + 1)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Компоненти</h1>

      <section aria-labelledby="button" className={styles.section}>
        <h2 id="button" className={styles.heading}>
          Button <code>18:30</code>
        </h2>
        {(['Default', 'Hover'] as const).map((state) => (
          <div key={state} className={styles.row} data-testid={`button-${state.toLowerCase()}`}>
            <span className={styles.caption}>{state}</span>
            {variants.map((variant) =>
              variant === 'accent' ? (
                <span key={variant} className={styles.navy}>
                  <Button
                    variant={variant}
                    data-hover={state === 'Hover' || undefined}
                    onClick={count}
                  >
                    Label
                  </Button>
                </span>
              ) : (
                <Button
                  key={variant}
                  variant={variant}
                  data-hover={state === 'Hover' || undefined}
                  onClick={count}
                >
                  Label
                </Button>
              ),
            )}
          </div>
        ))}
        <div className={styles.row}>
          <span className={styles.caption}>Disabled</span>
          <Button disabled>Label</Button>
          <Button href="#button" variant="link">
            Към бутоните
          </Button>
        </div>
        <div className={styles.row}>
          <Button onClick={count}>Натисни</Button>
          <output aria-live="polite" data-testid="clicks">
            {clicks}
          </output>
        </div>
      </section>

      <section aria-labelledby="chip" className={styles.section}>
        <h2 id="chip" className={styles.heading}>
          Chip <code>135:328</code>
        </h2>
        <div className={styles.row}>
          <Chip>Intermediate</Chip>
          <Chip filled>Intermediate</Chip>
          <ChipButton pressed={false} data-hover onClick={count}>
            Intermediate
          </ChipButton>
        </div>
        <div className={styles.row}>
          <ChipButton pressed={pressed} onClick={() => setPressed((p) => !p)}>
            Онлайн
          </ChipButton>
        </div>
      </section>

      <section aria-labelledby="checkbox" className={styles.section}>
        <h2 id="checkbox" className={styles.heading}>
          Checkbox <code>79:968</code>
        </h2>
        <div className={styles.column}>
          <Checkbox
            label="Ученици"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <Checkbox label="Възрастни" defaultChecked />
          <Checkbox label="Онлайн" disabled />
        </div>
      </section>

      <section aria-labelledby="radio" className={styles.section}>
        <h2 id="radio" className={styles.heading}>
          Radio card <code>98:270</code>
        </h2>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Опции</legend>
          {['a', 'b', 'c'].map((value, i) => (
            <RadioCard
              key={value}
              name="demo"
              value={value}
              label={`Опция ${i + 1}`}
              checked={option === value}
              onChange={() => setOption(value)}
            />
          ))}
        </fieldset>
      </section>

      <section aria-labelledby="toggle" className={styles.section}>
        <h2 id="toggle" className={styles.heading}>
          Toggle <code>223:349</code>
        </h2>
        <div className={styles.row}>
          <Toggle label="Включено" defaultChecked hideLabel />
          <Toggle label="Изключено" hideLabel />
          <Toggle label="Заключено" locked hideLabel />
        </div>
        <div className={styles.row}>
          <Toggle
            label="Статистика"
            checked={toggle}
            onChange={(e) => setToggle(e.target.checked)}
          />
        </div>
      </section>
    </div>
  )
}
