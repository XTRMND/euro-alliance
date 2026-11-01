import { devRoutes, routes } from '@/lib/routes'

// Every page built so far. Each page PR adds its routes here so pages.spec.ts covers them.
export const pages = [
  { name: 'Home', path: routes.home() },
  { name: 'Courses', path: routes.courses() },
  { name: 'Contact', path: routes.contact() },
  { name: 'English for adults', path: routes.languageProgram('english', 'adults') },
  { name: 'English for students', path: routes.languageProgram('english', 'students') },
  { name: 'Vouchers', path: routes.vouchers() },
  { name: 'Professions', path: routes.professions() },
  { name: 'Teachers', path: routes.teachers() },
  { name: 'Farmers', path: routes.farmers() },
  { name: 'Computer courses', path: routes.computerCourses() },
  { name: 'Tokens (dev)', path: devRoutes.tokens },
  { name: 'Components (dev)', path: devRoutes.components },
  { name: 'Patterns (dev)', path: devRoutes.patterns },
  { name: 'Visuals (dev)', path: devRoutes.visuals },
  { name: 'Cards (dev)', path: devRoutes.cards },
  { name: 'Course states (dev)', path: devRoutes.course },
]
