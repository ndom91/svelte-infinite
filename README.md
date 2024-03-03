<img align="right" src="https://raw.githubusercontent.com/ndom91/svelte-infinite/51683d459ae954a99e7c5c25817ed667678a0840/src/assets/SvelteLogo.svg" alt="Svelte Logo" width="128px" />

# Svelte Infinite

Svelte Infinite Scroller designed for use in **Svelte 5** with runes

- ⏰ Infinite Loop Detection
- 📣 Control Loader State
- 🔎 `IntersectionObservor` based
- ✨ Flexible

**Demo**: [svelte-5-infinite.vercel.app](https://svelte-5-infinite.vercel.app)

## 🏗️ Getting Started

1. Install `svelte-infinite`

```bash
pnpm install svelte-infinite
```

2. Import both `InfiniteLoader` and `stateChanger` from `svelte-infinite`

3. The component should wrap your list of items, and `stateChanger` should be used in your `triggerLoad` function to interact with the internal state of the component, telling it whether you're out of data, ran into an error, etc. See the example below and [in this repository](https://github.com/ndom91/svelte-infinite/blob/main/src/routes/%2Bpage.svelte#L12-L50) for more details.

## 🍍 Example

```svelte
<script lang="ts">
  import { InfiniteLoader, stateChanger } from "svelte-infinite"
  import UserCard from "$components/UserCard.svelte"

  const LOAD_LIMIT = 20
  const allItems = $state<{ id: number, data: string }[]>($page.data.items)
  let pageNumber = $state(1)

  // 1. You'll have to pass the InfiniteLoader component a load function
  // to its `triggerLoad` prop.
  const loadMore = async () => {
    try {
      pageNumber += 1
      const limit = LOAD_LIMIT
      const skip = LOAD_LIMIT * (pageNumber - 1)

      // If there are less results on the first page than the limit,
      // don't keep trying to fetch more. We're done.
      if (allItems.length < LOAD_LIMIT) {
        stateChanger.complete()
        return
      }

      const searchParams = new URLSearchParams({ limit, skip })

      const dataResponse = await fetch(`/api/data?${searchParams}`)

      if (!dataResponse.ok) {
        stateChanger.error()
        return
      }
      const data = await dataResponse.json()

      if (data.items.length) {
        allItems.push(...data.items)
      }

      // There are less items available than fit on one page,
      // don't keep trying to fetch more. We're done.
      if (allItems.length >= data.totalCount) {
        stateChanger.complete()
      } else {
        stateChanger.loaded()
      }
    } catch (error) {
      console.error(error)
      stateChanger.error()
    }
  }
</script>

<main class="container">

    <!-- 2. Here you wrap your items with the InfiniteLoader component -->

    <InfiniteLoader triggerLoad={loadMore}>
      {#each allItems as user (user.id)}
        <UserCard {user} />
      {/each}
      <div slot="loading">Loading...</div>
      <div slot="no-data">Thats it, no more users left!</div>
    </InfiniteLoader>
</main>

</script>
```

## ♾️ Usage

The `InfiniteLoader` component is a wrapper around your items, which will trigger the `triggerLoad` function when the user scrolls to the bottom of the list.

However, there is also a `stateChanger` export which you should use to interact with the internal state of the loader. For example, if your `fetch` call errored, or you've reached the maximum number of items, etc. See the `loadMore` function above or the example application in `/src/routes` in this repository.

### stateChanger

The `stateChanger` import is an object with 4 methods on it:

1. `stateChanger.loaded()` - Designed to be called after a successful fetch.
2. `stateChanger.error()` - Designed to be called after a failed fetch or any other error. This will cause the `InfiniteLoader` to render a "Retry" button.
3. `stateChanger.complete()` - Designed to be called when you've reached the end of your list and there are no more items to fetch.
4. `stateChanger.reset()` - Designed to be called when you want to reset the state of the `InfiniteLoader` to its initial state, for example if there is a search input tied to your infinite list and the user enters a new query.

### Props

- `triggerLoad: () => Promise<void>` - **required** - The function to call when the user scrolls to the bottom of the list.
- `loopTimeout: number = 1000` - optional - If the `loopMaxCalls` is reached within this duration (in milliseconds), a cool down period is triggered.
- `loopMaxCalls: number = 5` - optional - The number of calls to the `triggerLoad` function within timeout which should trigger cool down period.

### Slots

- `loading` - Shown while calling `triggerLoad` and waiting on a response.
- `no-results` - Shown when there are no results to display.
- `no-data` - Shown when `stateChanger.complete()` is called, indicating the end of scroll.
- `error` - Shown when there is an error. Slot has an `attemptLoad` prop passed to it which is the `triggerLoad` function, designed for a "Retry" button or similar.

## 📦 Contributing

- Initially inspired by [jonasgeiler/svelte-infinite-loading](https://github.com/jonasgeiler/svelte-infinite-loading)
- Open to contributions, issues, and feedback.

## 📝 License

MIT
