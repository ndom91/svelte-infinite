import { fail, json } from "@sveltejs/kit"
import type { RequestHandler, RequestEvent } from "./$types"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const POST: RequestHandler = async (event: RequestEvent) => {
  try {
    const { limit, skip } = await event.request.json()

    // Artificially wait a bit..
    await wait(1000)

    const items = Array(limit)
      .fill(0)
      .map((_, i) => i + skip)

    return json({
      items,
      totalCount: 200
    })
  } catch (error) {
    console.error(error)
    return fail(401, { error })
  }
}
