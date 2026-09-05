<script lang="ts">
  import { onDestroy, type Snippet } from "svelte"
  import { STATUS, LoaderState } from "./loaderState.svelte"

  type InfiniteLoaderProps = {
    triggerLoad: () => Promise<void>
    loopTimeout?: number
    loopDetectionTimeout?: number
    loopMaxCalls?: number
    intersectionOptions?: IntersectionObserverInit
    loaderState: LoaderState
    children: Snippet
    loading?: Snippet
    noResults?: Snippet
    noData?: Snippet
    coolingOff?: Snippet
    error?: Snippet<[() => Promise<void>]>
  }

  const {
    triggerLoad,
    loopTimeout = 3000,
    loopDetectionTimeout = 2000,
    loopMaxCalls = 5,
    intersectionOptions = {},
    loaderState,
    children,
    loading: loadingSnippet,
    noResults: noResultsSnippet,
    noData: noDataSnippet,
    coolingOff: coolingOffSnippet,
    error: errorSnippet
  }: InfiniteLoaderProps = $props()

  let loopTracker = $state<{
    coolingOff: boolean
    count: number
  }>({
    coolingOff: false,
    count: 0
  })
  let detectionTimer: ReturnType<typeof setTimeout> | undefined
  let coolingOffTimer: ReturnType<typeof setTimeout> | undefined

  let showLoading = $derived(loaderState.status === STATUS.LOADING)
  let showError = $derived(loaderState.status === STATUS.ERROR)
  let showNoResults = $derived(loaderState.status === STATUS.COMPLETE && loaderState.isFirstLoad)
  let showNoData = $derived(loaderState.status === STATUS.COMPLETE && !loaderState.isFirstLoad)
  let showCoolingOff = $derived(loaderState.status !== STATUS.COMPLETE && loopTracker.coolingOff)

  function clearTimers() {
    clearTimeout(detectionTimer)
    clearTimeout(coolingOffTimer)
  }

  function trackLoad() {
    loopTracker.count += 1

    clearTimeout(detectionTimer)
    detectionTimer = setTimeout(() => {
      loopTracker.count = 0
    }, loopDetectionTimeout)

    if (loopTracker.count >= loopMaxCalls) {
      console.error(
        `Attempted to execute load function ${loopMaxCalls} or more times within a short period. Please wait before trying again.`
      )

      loopTracker.coolingOff = true
      coolingOffTimer = setTimeout(() => {
        loopTracker.coolingOff = false
        loopTracker.count = 0
      }, loopTimeout)
    }
  }

  async function attemptLoad() {
    if (
      loaderState.status === STATUS.COMPLETE ||
      loopTracker.coolingOff ||
      (loaderState.status !== STATUS.READY && loaderState.status !== STATUS.ERROR)
    ) {
      return
    }

    loaderState.status = STATUS.LOADING

    try {
      await triggerLoad()
      trackLoad()
    } catch (error) {
      console.error(error)
      loaderState.error()
    } finally {
      if (loaderState.status === STATUS.LOADING) {
        loaderState.isFirstLoad = false
        loaderState.status = STATUS.READY
      }
    }
  }

  onDestroy(clearTimers)

  function observeIntersection(node: HTMLElement) {
    $effect(() => {
      const appliedIntersectionOptions = {
        rootMargin: "0px 0px 200px 0px",
        ...intersectionOptions
      }
      const obs = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting) {
          void attemptLoad()
        }
      }, appliedIntersectionOptions)
      obs.observe(node)

      return () => {
        obs.disconnect()
      }
    })
  }
</script>

<div class="infinite-loader-wrapper">
  {@render children()}

  <div
    class="infinite-intersection-target"
    aria-busy={showLoading}
    aria-live="polite"
    {@attach observeIntersection}
  >
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
        <div class="infinite-error" role="alert">
          <div class="infinite-error__label">Oops, something went wrong</div>
          <button
            class="infinite-error__btn"
            disabled={loaderState.status === STATUS.COMPLETE}
            onclick={attemptLoad}
            type="button"
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
