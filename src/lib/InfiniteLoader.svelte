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
  const LOOP_CHECK_TIMEOUT = 2000
  const LOOP_CHECK_MAX_CALLS = 5
  const ERROR_INFINITE_LOOP = `executed the callback function more than ${LOOP_CHECK_MAX_CALLS} times for a short time.`

  $inspect("LoaderStatus", status)

  // Avoid infinite loops
  class LoopTracker {
    coolingOff = false
    timer: number | null = null
    count = 0

    track() {
      this.count += 1

      if (this.count >= LOOP_CHECK_MAX_CALLS) {
        console.error(ERROR_INFINITE_LOOP)

        this.coolingOff = true
        this.timer = setTimeout(() => {
          this.coolingOff = false
          this.count = 0
        }, LOOP_CHECK_TIMEOUT)
      }
    }
  }

  const loopTracker = new LoopTracker()

  const { triggerLoad } = $props<{ triggerLoad: () => Promise<void> }>()

  let intersectionTarget = $state<HTMLElement>()
  let observer = $state<IntersectionObserver>()

  let showLoading = $derived(status === STATUS.LOADING)
  let showError = $derived(status === STATUS.ERROR)
  let showNoResults = $derived(status === STATUS.COMPLETE && isFirstLoad)
  let showNoMore = $derived(status === STATUS.COMPLETE && !isFirstLoad)

  async function attemptLoad() {
    if (status === STATUS.COMPLETE) {
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

  // TODO: Observor not starting observation without
  // some sort of action after 'observer.observe()'.
  // 'return' unnecessary/wrong here in $effect
  // @ts-expect-error
  $effect(() => {
    if (!observer) {
      if (intersectionTarget) {
        observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              attemptLoad()
            }
          },
          { threshold: 0.5 }
        )
        observer.observe(intersectionTarget)
        return observer
      }
    }
    return () => observer?.disconnect()
  })
</script>

<div class="loader-wrapper">
  <slot />

  {#if showLoading}
    <div class="loading">Loading...</div>
  {/if}

  {#if showNoResults}
    <div class="no-results">No results</div>
  {/if}

  {#if showNoMore}
    <div class="no-data">No more data</div>
  {/if}

  {#if showError}
    <div class="error">
      <div class="label">Oops, something went wrong</div>
      <button class="btn" on:click={attemptLoad}> Retry </button>
    </div>
  {/if}

  <div class="target" bind:this={intersectionTarget} />
</div>

<style>
  .loader-wrapper {
    display: grid;
    width: 100%;
    place-items: center;
    margin-block: 2rem;

    .loading {
      margin-top: 1rem;
      font-size: 1.5rem;
    }

    .no-results {
      margin-top: 1rem;
      font-size: 1.5rem;
    }

    .no-data {
      margin-top: 1rem;
      font-size: 1.5rem;
    }

    .error {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      font-size: 1.5rem;
      margin-block: 1rem;

      .label {
        color: firebrick;
      }

      .btn {
        color: white;
        background-color: #333;
        padding-inline: 1.5rem;
        padding-block: 0.75rem;
        border-radius: 0.25rem;
        border: none;
      }
    }

    .target {
      height: 4rem;
    }
  }
</style>
