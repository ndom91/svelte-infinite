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
  const LOOP_CHECK_TIMEOUT = 1000
  const LOOP_CHECK_MAX_CALLS = 5
  const ERROR_INFINITE_LOOP = `executed the callback function more than ${LOOP_CHECK_MAX_CALLS} times for a short time.`
  $inspect("status", status)

  class LoopTracker {
    coolingOff = false
    timer: number | null = null
    count = 0

    track() {
      // record track times
      this.count += 1

      // throw warning if the times of continuous calls large than the maximum times
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

  let showSpinner = $derived(status === STATUS.LOADING)
  let showError = $derived(status === STATUS.ERROR)
  let showNoResults = $derived(status === STATUS.COMPLETE && isFirstLoad)
  let showNoMore = $derived(status === STATUS.COMPLETE && !isFirstLoad)

  async function attemptLoad() {
    if (status === STATUS.COMPLETE) {
      return
    }

    if (!loopTracker.coolingOff && status !== STATUS.LOADING) {
      await triggerLoad()
      loopTracker.track()
    }

    // @ts-expect-error - client can set status to complete inside triggerLoad
    if (status !== STATUS.ERROR && status !== STATUS.COMPLETE) {
      status = STATUS.LOADING

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

  {#if showSpinner}
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
      <div class="error-label">Oops, something went wrong</div>
      <button class="error-btn" on:click={attemptLoad}> Retry </button>
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
      font-size: 1.5rem;
    }

    .no-results {
      font-size: 1.5rem;
    }

    .no-data {
      font-size: 1.5rem;
    }

    .error {
      display: flex;
      flex-direction: column;
      font-size: 1.5rem;

      .error-label {
        color: palevioletred;
      }

      .error-btn {
        color: white;
        background-color: midnightblue;
        padding-inline: 2rem;
        padding-block: 1rem;
        border-radius: 0.25rem;
        border: none;
      }
    }

    .target {
      height: 4rem;
    }
  }
</style>
