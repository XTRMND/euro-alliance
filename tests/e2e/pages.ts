import { devRoutes, routes } from '@/lib/routes'

// Every page built so far. Each page PR adds its routes here so pages.spec.ts covers them.
export const pages = [
  { name: 'Home', path: routes.home() },
  { name: 'Tokens (dev)', path: devRoutes.tokens },
  { name: 'Components (dev)', path: devRoutes.components },
  { name: 'Patterns (dev)', path: devRoutes.patterns },
  { name: 'Visuals (dev)', path: devRoutes.visuals },
]
