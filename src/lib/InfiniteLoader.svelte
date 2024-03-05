<script context="module" lang="ts">
  const STATUS = {
    READY: "READY",
    LOADING: "LOADING",
    COMPLETE: "COMPLETE",
    ERROR: "ERROR"
  } as const

  let isFirstLoad = $state(true)
  let status = $state<keyof typeof STATUS>(STATUS.READY)

  export const stateChanger = {
    loaded: () => {
      isFirstLoad = false
      status = STATUS.READY
    },
    complete: () => {
      isFirstLoad = false
      status = STATUS.COMPLETE
    },
    reset: () => {
      status = STATUS.READY
      isFirstLoad = true
    },
    error: () => {
      status = STATUS.ERROR
    }
  }
</script>

<script lang="ts">
  import { onMount, onDestroy } from "svelte"

  type InfiniteLoaderProps = {
    triggerLoad: () => Promise<void>
    loopTimeout?: number
    loopMaxCalls?: number
    intersectionOptions?: IntersectionObserverInit
  }

  const {
    triggerLoad,
    loopTimeout = 1000,
    loopMaxCalls = 5,
    intersectionOptions = {}
  } = $props<InfiniteLoaderProps>()

  const ERROR_INFINITE_LOOP = `Executed load function ${loopMaxCalls} or more times within a short period. Cooling off..`

  // Avoid infinite loops
  class LoopTracker {
    coolingOff = false
    timer: number | null = null
    count = 0

    track() {
      this.count += 1

      if (this.count >= loopMaxCalls) {
        console.error(ERROR_INFINITE_LOOP)

        this.coolingOff = true
        this.timer = setTimeout(() => {
          this.coolingOff = false
          this.count = 0
        }, loopTimeout)
      }
    }
  }

  const loopTracker = new LoopTracker()

  let intersectionTarget = $state<HTMLElement>()
  let observer = $state<IntersectionObserver>()

  let showLoading = $derived(status === STATUS.LOADING)
  let showError = $derived(status === STATUS.ERROR)
  let showNoResults = $derived(status === STATUS.COMPLETE && isFirstLoad)
  let showNoMore = $derived(status === STATUS.COMPLETE && !isFirstLoad)

  async function attemptLoad() {
    // If we're complete, don't attempt to load again
    // If we're not ready (i.e. in the middle of a fetch) don't attempt to load again
    // However, if we're in an error state, allow the user to retry via btn click
    if (status === STATUS.COMPLETE || (status !== STATUS.READY && status !== STATUS.ERROR)) {
      return
    }

    status = STATUS.LOADING

    // Skip loading if we're in infinite loop cool-off
    if (!loopTracker.coolingOff) {
      await triggerLoad()
      loopTracker.track()
    }

    // @ts-expect-error - client can set status to complete inside triggerLoad
    // via stateChanger.complete(), TS obviously doesn't know this.
    if (status !== STATUS.ERROR && status !== STATUS.COMPLETE) {
      if (status === STATUS.LOADING) {
        status = STATUS.READY
        isFirstLoad = false
      }
    }
  }

  onMount(() => {
    if (observer || !intersectionTarget) return

    const appliedIntersectionOptions = {
      rootMargin: "0px 0px 200px 0px",
      ...intersectionOptions
    }
    observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        attemptLoad()
      }
    }, appliedIntersectionOptions)
    observer.observe(intersectionTarget)
  })

  onDestroy(() => {
    if (observer) {
      observer.disconnect()
    }
  })
</script>

<div class="infinite-loader-wrapper">
  <slot />

  <div class="infinite-intersection-target" bind:this={intersectionTarget}>
    {#if showLoading}
      <slot name="loading">
        <div class="infinite-loading">Loading...</div>
      </slot>
    {/if}

    {#if showNoResults}
      <slot name="no-results">
        <div class="infinite-no-results">No results</div>
      </slot>
    {/if}

    {#if showNoMore}
      <slot name="no-data">
        <div class="infinite-no-data">No more data</div>
      </slot>
    {/if}

    {#if showError}
      <slot name="error" {attemptLoad}>
        <div class="infinite-error">
          <div class="infinite-label">Oops, something went wrong</div>
          <button class="infinite-btn" disabled={status === STATUS.COMPLETE} onclick={attemptLoad}>
            Retry
          </button>
        </div>
      </slot>
    {/if}
  </div>
</div>

<style>
  .infinite-loader-wrapper {
    width: 100%;

    .infinite-loading {
      font-size: 1.5rem;
    }

    .infinite-no-results {
      font-size: 1.5rem;
    }

    .infinite-no-data {
      font-size: 1.5rem;
    }

    .infinite-error {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      font-size: 1.5rem;
      margin-block: 1rem;

      .infinite-label {
        color: crimson;
      }

      .infinite-btn {
        color: white;
        background-color: #333;
        padding-inline: 1.5rem;
        padding-block: 0.75rem;
        border-radius: 0.25rem;
        border: none;
        transition: background-color 0.3s;
        line-height: normal;
      }
      .infinite-btn:hover {
        cursor: pointer;
        background-color: #222;
      }
    }

    .infinite-intersection-target {
      width: 100%;
      min-height: 1px;
      display: flex;
      margin-block: 2rem;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
</style>
