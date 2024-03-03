import { json } from "@sveltejs/kit"
import { loremIpsum } from "$routes/lib/lorem"
import { extractSnippet, LOAD_LIMIT } from "$routes/lib/utils"
import type { RequestHandler, RequestEvent } from "./$types"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const GET: RequestHandler = async ({ url }: RequestEvent) => {
  try {
    const skip = Number(url.searchParams.get("skip") ?? "0")
    const limit = Number(url.searchParams.get("limit") ?? String(LOAD_LIMIT))

    // Artificially wait a bit..
    await wait(1000)

    // Randomly fail 10% of the time
    if (Math.random() < 0.1) {
      return new Response(null, { status: 500, statusText: "Randomly failing.." })
    }

    const items = Array(limit)
      .fill(0)
      .map((_, i) => {
        return {
          id: i + skip,
          body: extractSnippet(loremIpsum, 6).trim()
        }
      })

    return json({
      items,
      totalCount: 200
    })
  } catch (error) {
    console.error(error)
    return new Response(null, { status: 500 })
  }
}
