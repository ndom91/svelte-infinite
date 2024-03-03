import type { PageServerLoad } from "./$types"
import { loremIpsum } from "$lib/lorem"
import { extractSnippet } from "$lib/utils"
import { LOAD_LIMIT } from "$lib/utils"

export const load: PageServerLoad = () => {
  // Initial page load data, i.e. first 20 items that are SSR-ed into the HTML
  const items = Array(LOAD_LIMIT)
    .fill(0)
    .map((_, i) => {
      return {
        id: i,
        body: extractSnippet(loremIpsum, 6).trim()
      }
    })
  return {
    items
  }
}
