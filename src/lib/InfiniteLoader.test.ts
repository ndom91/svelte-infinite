import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { STATUS, LoaderState } from "./loaderState.svelte"

describe("InfiniteLoader", () => {
  let loaderState: LoaderState
  let triggerLoad: vi.Mock
  let loopTimeout: number
  let loopDetectionTimeout: number
  let loopMaxCalls: number

  beforeEach(() => {
    loaderState = new LoaderState()
    triggerLoad = vi.fn(() => Promise.resolve())
    loopTimeout = 3000
    loopDetectionTimeout = 2000
    loopMaxCalls = 5
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("tracks load attempts correctly", () => {
    const loopTracker = {
      coolingOff: false,
      count: 0,
      timers: [] as (number | null)[]
    }

    function trackLoad() {
      loopTracker.count += 1

      loopTracker.timers.forEach((timer) => {
        if (timer !== null) clearTimeout(timer)
      })
      loopTracker.timers = []

      loopTracker.timers.push(
        setTimeout(() => {
          loopTracker.count = 0
        }, loopDetectionTimeout)
      )

      if (loopTracker.count >= loopMaxCalls) {
        loopTracker.coolingOff = true
        loopTracker.timers.push(
          setTimeout(() => {
            loopTracker.coolingOff = false
            loopTracker.count = 0
          }, loopTimeout)
        )
      }
    }

    for (let i = 0; i < loopMaxCalls - 1; i++) {
      trackLoad()
      expect(loopTracker.count).toBe(i + 1)
      expect(loopTracker.coolingOff).toBe(false)
    }

    trackLoad()
    expect(loopTracker.count).toBe(loopMaxCalls)
    expect(loopTracker.coolingOff).toBe(true)
  })

  it("resets count after loopDetectionTimeout", async () => {
    const loopTracker = {
      coolingOff: false,
      count: 0,
      timers: [] as (number | null)[]
    }

    function trackLoad() {
      loopTracker.count += 1

      loopTracker.timers.forEach((timer) => {
        if (timer !== null) clearTimeout(timer)
      })
      loopTracker.timers = []

      loopTracker.timers.push(
        setTimeout(() => {
          loopTracker.count = 0
        }, loopDetectionTimeout)
      )

      if (loopTracker.count >= loopMaxCalls) {
        loopTracker.coolingOff = true
        loopTracker.timers.push(
          setTimeout(() => {
            loopTracker.coolingOff = false
            loopTracker.count = 0
          }, loopTimeout)
        )
      }
    }

    trackLoad()
    expect(loopTracker.count).toBe(1)

    await new Promise((resolve) => setTimeout(resolve, loopDetectionTimeout + 100))

    expect(loopTracker.count).toBe(0)
  })

  it("prevents loading when in coolingOff state", () => {
    const loopTracker = {
      coolingOff: true,
      count: 0,
      timers: [] as (number | null)[]
    }

    expect(loopTracker.coolingOff).toBe(true)
  })

  it("handles error state correctly", () => {
    loaderState.error()
    expect(loaderState.status).toBe(STATUS.ERROR)
  })

  it("handles complete state correctly", () => {
    loaderState.complete()
    expect(loaderState.status).toBe(STATUS.COMPLETE)
    expect(loaderState.isFirstLoad).toBe(false)
  })

  it("handles loaded state correctly", () => {
    loaderState.loaded()
    expect(loaderState.status).toBe(STATUS.READY)
    expect(loaderState.isFirstLoad).toBe(false)
  })

  it("handles reset state correctly", () => {
    loaderState.isFirstLoad = false
    loaderState.status = STATUS.ERROR
    loaderState.reset()

    expect(loaderState.isFirstLoad).toBe(true)
    expect(loaderState.status).toBe(STATUS.READY)
  })
})
