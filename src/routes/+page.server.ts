import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = () => {
  // No server-side data needed for the calendar view
  // All data is managed client-side
  return {}
}
