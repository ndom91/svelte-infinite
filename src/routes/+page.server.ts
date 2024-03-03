import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = () => {
  // Initial page load data, i.e. first 20 items that are SSR-ed into the HTML
  const items = Array(20)
    .fill(0)
    .map((_, i) => i)
  return {
    items
  }
}
