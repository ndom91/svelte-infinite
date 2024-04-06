<script lang="ts">
  import { onMount, onDestroy, type Snippet } from "svelte"
  import { STATUS, loaderState } from "./loaderState.svelte"

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
    coolingOff?: Snippet
    error?: Snippet<[typeof attemptLoad]>
  }

  const {
    triggerLoad,
    loopTimeout = 3000,
    loopDetectionTimeout = 2000,
    loopMaxCalls = 5,
    intersectionOptions = {},
    children,
    loading: loadingSnippet,
    noResults: noResultsSnippet,
    noData: noDataSnippet,
    coolingOff: coolingOffSnippet,
    error: errorSnippet
  } = $props<InfiniteLoaderProps>()

  const ERROR_INFINITE_LOOP = `Attempted to execute load function ${loopMaxCalls} or more times within a short period. Please wait before trying again..`

  // Track load counts to avoid infinite loops
  class LoopTracker {
    coolingOff = false
    #coolingOffTimer: number | null = null
    #timer: number | null = null
    #count = 0

    // On each call, increment the count and reset the timer
    track() {
      this.#count += 1

      clearTimeout(this.#timer!)
      // Cooldown, after 2s, reset count to 0
      this.#timer = setTimeout(() => {
        this.#count = 0
      }, loopDetectionTimeout)

      // If count > loopMaxCalls, begin cool-down period
      // and start timer to reset loop count tracker
      if (this.#count >= loopMaxCalls) {
        console.error(ERROR_INFINITE_LOOP)

        this.coolingOff = true
        this.#coolingOffTimer = setTimeout(() => {
          this.coolingOff = false
          this.#count = 0
        }, loopTimeout)
      }
    }

    destroy() {
      this.#timer && clearTimeout(this.#timer)
      this.#coolingOffTimer && clearTimeout(this.#coolingOffTimer)
    }
  }

  const loopTracker = new LoopTracker()

  let intersectionTarget = $state<HTMLElement>()
  let observer = $state<IntersectionObserver>()

  let showLoading = $derived(loaderState.status === STATUS.LOADING)
  let showError = $derived(loaderState.status === STATUS.ERROR)
  let showNoResults = $derived(loaderState.status === STATUS.COMPLETE && loaderState.isFirstLoad)
  let showNoData = $derived(loaderState.status === STATUS.COMPLETE && !loaderState.isFirstLoad)
  let showCoolingOff = $derived(loaderState.status !== STATUS.COMPLETE && loopTracker.coolingOff)

  async function attemptLoad() {
    // If we're complete, don't attempt to load again
    // If we're not ready (i.e. in the middle of a fetch) don't attempt to load again
    // However, if we're in an error state, allow the user to retry via btn click
    if (
      loaderState.status === STATUS.COMPLETE ||
      (loaderState.status !== STATUS.READY && loaderState.status !== STATUS.ERROR)
    ) {
      return
    }

    loaderState.status = STATUS.LOADING

    // Skip loading if we're in infinite loop cool-off
    if (!loopTracker.coolingOff) {
      await triggerLoad()
      loopTracker.track()
    }

    // @ts-expect-error - client can set status to 'COMPLETE' inside the
    // `triggerLoad` fn above via `loaderState.complete()`, TS obviously doesn't know this.
    if (loaderState.status !== STATUS.ERROR && loaderState.status !== STATUS.COMPLETE) {
      if (loaderState.status === STATUS.LOADING) {
        loaderState.status = STATUS.READY
        loaderState.isFirstLoad = false
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
    observer && observer.disconnect()
    loopTracker && loopTracker.destroy()
  })
</script>

<div class="infinite-loader-wrapper">
  <!-- Render the users list items -->
  {@render children()}

  <div class="infinite-intersection-target" bind:this={intersectionTarget}>
    {#if showLoading}
      {#if loadingSnippet}
        {@render loadingSnippet()}
      {:else}
        <div class="infinite-loading">Loading...</div>
      {/if}
    {/if}

    {#if showNoResults}
      {#if noResultsSnippet}
        {@render noResultsSnippet()}
      {:else}
        <div class="infinite-no-results">No results</div>
      {/if}
    {/if}

    {#if showNoData}
      {#if noDataSnippet}
        {@render noDataSnippet()}
      {:else}
        <div class="infinite-no-data">No more data</div>
      {/if}
    {/if}

    {#if showCoolingOff}
      {#if coolingOffSnippet}
        {@render coolingOffSnippet()}
      {:else}
        <div class="infinite-cooling-off">Potential loop detected, please wait and try again..</div>
      {/if}
    {/if}

    {#if showError}
      {#if errorSnippet}
        {@render errorSnippet(attemptLoad)}
      {:else}
        <div class="infinite-error">
          <div class="infinite-error__label">Oops, something went wrong</div>
          <button
            class="infinite-error__btn"
            disabled={loaderState.status === STATUS.COMPLETE}
            onclick={attemptLoad}
          >
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

    .infinite-cooling-off {
      font-size: 1.25rem;
    }

    .infinite-error {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      font-size: 1.5rem;
      margin-block: 1rem;

      .infinite-error__label {
        color: crimson;
      }

      .infinite-error__btn {
        color: white;
        background-color: #333;
        padding-inline: 1.5rem;
        padding-block: 0.75rem;
        border-radius: 0.25rem;
        border: none;
        transition: background-color 0.3s;
        line-height: normal;
      }
      .infinite-error__btn:hover {
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
