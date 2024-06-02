export const STATUS = {
  READY: "READY",
  LOADING: "LOADING",
  COMPLETE: "COMPLETE",
  ERROR: "ERROR"
} as const

class LoaderState {
  isFirstLoad = $state(true)
  status = $state<keyof typeof STATUS>(STATUS.READY)
  mounted = $state(false)

  loaded = () => {
    if (this.isFirstLoad) this.isFirstLoad = false
    this.status = STATUS.READY
  }
  complete = () => {
    if (this.isFirstLoad) this.isFirstLoad = false
    this.status = STATUS.COMPLETE
  }
  reset = () => {
    this.isFirstLoad = true
    this.status = STATUS.READY
  }
  error = () => {
    this.status = STATUS.ERROR
  }
}

export const loaderState = new LoaderState()
