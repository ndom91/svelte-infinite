import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { STATUS, LoaderState } from "./loaderState.svelte"

describe("LoaderState", () => {
  let state: LoaderState

  beforeEach(() => {
    state = new LoaderState()
  })

  it("initializes with correct default values", () => {
    expect(state.isFirstLoad).toBe(true)
    expect(state.status).toBe(STATUS.READY)
    expect(state.mounted).toBe(false)
  })

  describe("loaded()", () => {
    it("sets isFirstLoad to false on first call", () => {
      state.loaded()

      expect(state.isFirstLoad).toBe(false)
    })

    it("keeps isFirstLoad false on subsequent calls", () => {
      state.loaded()
      state.loaded()

      expect(state.isFirstLoad).toBe(false)
    })

    it("sets status to READY", () => {
      state.status = STATUS.ERROR
      state.loaded()

      expect(state.status).toBe(STATUS.READY)
    })
  })

  describe("complete()", () => {
    it("sets isFirstLoad to false on first call", () => {
      state.complete()

      expect(state.isFirstLoad).toBe(false)
    })

    it("keeps isFirstLoad false on subsequent calls", () => {
      state.complete()
      state.complete()

      expect(state.isFirstLoad).toBe(false)
    })

    it("sets status to COMPLETE", () => {
      state.status = STATUS.LOADING
      state.complete()

      expect(state.status).toBe(STATUS.COMPLETE)
    })
  })

  describe("reset()", () => {
    it("sets isFirstLoad to true", () => {
      state.isFirstLoad = false
      state.reset()

      expect(state.isFirstLoad).toBe(true)
    })

    it("sets status to READY", () => {
      state.status = STATUS.ERROR
      state.reset()

      expect(state.status).toBe(STATUS.READY)
    })
  })

  describe("error()", () => {
    it("sets status to ERROR", () => {
      state.status = STATUS.LOADING
      state.error()

      expect(state.status).toBe(STATUS.ERROR)
    })
  })
})
