<img src="/src/assets/SvelteLogo.svg" alt="Svelte Logo" width="128px" />

# Svelte Infinite

Svelte Infinite Scroller designed for use in Svelte 5 with runes.

> Initially inspired by https://github.com/jonasgeiler/svelte-infinite-loading

## 🏗️ Getting Started

First install `svelte-infinite` from npm.

```bash
# create a new project in the current directory
pnpm install svelte-infinite
```

Then, import and use the component in your Svelte project.

```svelte
<script lang="ts">
  import { InfiniteLoader, stateChanger } from "svelte-infinite"

  const LOAD_LIMIT = 20
  const allItems = $state<number[]>($page.data.items)
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
    </InfiniteLoader>
</main>

</script>
```

## ♾️ Usage

The `InfiniteLoader` component is a wrapper around your items, which will trigger the `triggerLoad` function when the user scrolls to the bottom of the list.

However, there is also a `stateChanger` export which you should use to interact with the internal state of the loader. For example, if your `fetch` call errored, or you've reached the maximum number of items, etc. See the `loadMore` function above or the example application in `/src/routes` in this repository.

### `stateChanger`

The `stateChanger` import is an object with 4 methods on it:

1. `stateChanger.loaded()` - Designed to be called after a successful fetch.
2. `stateChanger.error()` - Designed to be called after a failed fetch or any other error. This will cause the `InfiniteLoader` to render a "Retry" button.
3. `stateChanger.complete()` - Designed to be called when you've reached the end of your list and there are no more items to fetch.
4. `stateChanger.reset()` - Designed to be called when you want to reset the state of the `InfiniteLoader` to its initial state, for example if there is a search input tied to your infinite list and the user enters a new query.

## 📝 License

MIT
