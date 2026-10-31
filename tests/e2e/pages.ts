import { devRoutes, routes } from '@/lib/routes'

// Every page built so far. Each page PR adds its routes here so pages.spec.ts covers them.
export const pages = [
  { name: 'Home', path: routes.home() },
  { name: 'Tokens (dev)', path: devRoutes.tokens },
]
