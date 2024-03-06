<script context="module" lang="ts">
  const STATUS = {
    READY: "READY",
    LOADING: "LOADING",
    COMPLETE: "COMPLETE",
    ERROR: "ERROR"
  } as const

  let isFirstLoad = $state(true)
  let status = $state<keyof typeof STATUS>(STATUS.READY)

  export const loaderState = {
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
  import { onMount, onDestroy, type Snippet } from "svelte"

  type InfiniteLoaderProps = {
    triggerLoad: () => Promise<void>
    loopTimeout?: number
    loopDetectionTimeout?: number
    loopMaxCalls?: number
    intersectionOptions?: IntersectionObserverInit
    children: Snippet
    loading?: Snippet
    noResults?: Snippet
    noData?: Snippet
    error?: Snippet<[{ attemptLoad: Promise<() => void> }]>
  }

  const {
    triggerLoad,
    loopTimeout = 2000,
    loopDetectionTimeout = 1000,
    loopMaxCalls = 5,
    intersectionOptions = {},
    children,
    loading,
    noResults,
    noData,
    error
  } = $props<InfiniteLoaderProps>()

  const ERROR_INFINITE_LOOP = `Attempted to execute load function ${loopMaxCalls} or more times within a short period. Please wait before trying again..`

  // Avoid infinite loops
  class LoopTracker {
    coolingOff = false
    #coolingOffTimer: number | null = null
    #timer: number | null = null
    #count = 0

    track() {
      this.#count += 1

      clearTimeout(this.#timer)
      this.#timer = setTimeout(() => {
        this.#count = 0
      }, loopDetectionTimeout)

      if (this.#count >= loopMaxCalls) {
        console.error(ERROR_INFINITE_LOOP)

        this.coolingOff = true
        this.#coolingOffTimer = setTimeout(() => {
          this.coolingOff = false
          this.#count = 0
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
  let showNoData = $derived(status === STATUS.COMPLETE && !isFirstLoad)

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
    // via loaderState.complete(), TS obviously doesn't know this.
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
  {@render children()}

  <div class="infinite-intersection-target" bind:this={intersectionTarget}>
    {#if showLoading}
      {#if loading}
        {@render loading()}
      {:else}
        <div class="infinite-loading">Loading...</div>
      {/if}
    {/if}

    {#if showNoResults}
      {#if noResults}
        {@render noResults()}
      {:else}
        <div class="infinite-no-results">No results</div>
      {/if}
    {/if}

    {#if showNoData}
      {#if noData}
        {@render noData()}
      {:else}
        <div class="infinite-no-data">No more data</div>
      {/if}
    {/if}

    {#if showError}
      {#if error}
        {@render error(attemptLoad)}
      {:else}
        <div class="infinite-error">
          <div class="infinite-label">Oops, something went wrong</div>
          <button class="infinite-btn" disabled={status === STATUS.COMPLETE} onclick={attemptLoad}>
            Retry
          </button>
        </div>
      {/if}
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
      padding-block: 2rem;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
</style>
