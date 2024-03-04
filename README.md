<p align="center">
 <img align="center" src="https://raw.githubusercontent.com/ndom91/svelte-infinite/51683d459ae954a99e7c5c25817ed667678a0840/src/assets/SvelteLogo.svg" height="96" />
 <h1 align="center">
  Svelte Infinite
 </h1>
</p>

![](https://img.shields.io/badge/typescript-black?style=for-the-badge&logo=typescript&logoColor=white)
![](https://img.shields.io/badge/only-svelte5?style=for-the-badge&logo=svelte&logoColor=white&label=svelte5&labelColor=black&color=black)
[![](https://img.shields.io/npm/v/svelte-infinite?style=for-the-badge&labelColor=black&color=black)](https://npmjs.org/packages/svelte-infinite)
[![](https://img.shields.io/badge/13kb-size?style=for-the-badge&label=size&labelColor=black&color=black)](https://npmjs.org/packages/svelte-infinite)
[![](https://img.shields.io/npm/dm/svelte-infinite?style=for-the-badge&labelColor=black&color=black)](https://npmjs.org/packages/svelte-infinite)
[![](https://img.shields.io/badge/demo-black?style=for-the-badge&logo=&logoColor=white&labelColor=black&color=black)](https://svelte-5-infinite.vercel.app)

> Svelte Infinite Loader designed and rebuilt specifically for use in **Svelte 5** with runes

✨ Flexible  
⏰ Infinite Loop Detection  
📣 Control Loader State  
🔎 `IntersectionObserver` based  
🧑‍🔧 **Demo**: [svelte-5-infinite.vercel.app](https://svelte-5-infinite.vercel.app)

## 🏗️ Getting Started

1. Install `svelte-infinite`

```bash
npm install svelte-infinite
pnpm install svelte-infinite
yarn add svelte-infinite
```

2. Import both `InfiniteLoader` and `stateChanger` from `svelte-infinite`

```svelte
<script lang="ts">
  import { InfiniteLoader, stateChanger } from "svelte-infinite"

  const allItems = $state([])

  const loadMore = async () => {
    const res = fetch("...")
    const data = await jes.json()
    allItems.push(...data)
    stateChanger.loaded()
  }
</script>

<InfiniteLoader triggerLoad={loadMore}>
  {#each allItems as user (user.id)}
    <div>{user.name}</div>
  {/each}
</InfiniteLoader>
```

The component should wrap your list of items, and `stateChanger` should be used in your `triggerLoad` function (and/or elsewhere) to interact with the internal state of the Loader component. You tell it whether you're out of data, ran into an error, etc.

See the example below and [in this repository](https://github.com/ndom91/svelte-infinite/blob/main/src/routes/%2Bpage.svelte#L12-L50) for more details.

## 🍍 Example

```svelte
<script lang="ts">
  import { InfiniteLoader, stateChanger } from "svelte-infinite"
  import UserCard from "$components/UserCard.svelte"

  const LOAD_LIMIT = 20
  const allItems = $state<{ id: number, body: string }[]>($page.data.items)
  let pageNumber = $state(1)

  // 1. You'll have to pass the InfiniteLoader component a load function
  // to its `triggerLoad` prop.
  const loadMore = async () => {
    // This is a relatively straight-forward load function with support for pagination
    try {
      pageNumber += 1
      const limit = String(LOAD_LIMIT)
      const skip = String(LOAD_LIMIT * (pageNumber - 1))

      // If there are less results on the first page (page.server loaded data)
      // than the limit, don't keep trying to fetch more. We're done.
      if (allItems.length < LOAD_LIMIT) {
        stateChanger.complete()
        return
      }

      const searchParams = new URLSearchParams({ limit, skip })

      // Execute the API call to grab more data
      const dataResponse = await fetch(`/api/data?${searchParams}`)

      // Ideally, like most paginated endpoints, this should return the data
      // you've requested for your page, as well as the total amount of data
      // available to page through
      if (!dataResponse.ok) {
        stateChanger.error()

        // On errors, set the pageNumber back so we can retry
        // that page's data on the next 'loadMore' attempt
        pageNumber -= 1
        return
      }
      const data = await dataResponse.json()

      // If we've received data, push it to the reactive state variable
      // rendering our items inside the `<InfiniteLoader />` below.
      if (data.items.length) {
        allItems.push(...data.items)
      }

      // If there are more (or equal) number of items loaded as are totally available
      // from the API, don't keep trying to fetch more. We're done.
      if (allItems.length >= data.totalCount) {
        stateChanger.complete()
      } else {
        stateChanger.loaded()
      }
    } catch (error) {
      console.error(error)
      stateChanger.error()
      pageNumber -= 1
    }
  }
</script>

<main class="container">

    <!-- 2. Here you wrap your items with the InfiniteLoader component -->

    <InfiniteLoader triggerLoad={loadMore}>
      {#each allItems as user (user.id)}
        <UserCard {user} />
      {/each}

      <!-- There are a few optional slots for customizing what is shown at the bottom
           of the scroller in various states, see README.md for more details -->
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

- `stateChanger.loaded()`
  - Designed to be called after a successful fetch.
- `stateChanger.error()`
  - Designed to be called after a failed fetch or any other error. This will cause the `InfiniteLoader` to render a "Retry" button by default, or the `error` slot.
- `stateChanger.complete()`
  - Designed to be called when you've reached the end of your list and there are no more items to fetch. This will render a "No more data" string, or the `no-data` slot.
- `stateChanger.reset()`
  - Designed to be called when you want to reset the state of the `InfiniteLoader` to its initial state, for example if there is a search input tied to your infinite list and the user enters a new query.

### Props

- `triggerLoad: () => Promise<void>` - **required**
  - The async function to call when we should attempt to load more data to show.
- `intersectionOptions: `[`IntersectionObserverInit`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver#options)` = { rootMargin: "0px 0px 200px 0px" }` - optional
  - The options to pass to the `IntersectionObserver` instance. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver#options) for more details. The default `rootMargin` value will cause the target to intersect 200px earlier and trigger the `loadMore` function before it actually intersects with the root element (window by default). This has the effect of beginning to load the next page of data before the user has actually reached the current bottom of the list, making the experience feel more smooth.
  - It may also be required to pass in a reference to your scroll container as the `root` option, if your scroll container is not the window.
- `loopTimeout: number = 1000` - optional
  - If the `loopMaxCalls` is reached within this duration (in milliseconds), a cool down period is triggered.
- `loopMaxCalls: number = 5` - optional
  - The number of calls to the `triggerLoad` function within timeout which should trigger cool down period.

### Slots

- `loading`
  - Shown while calling `triggerLoad` and waiting on a response.
- `no-results`
  - Shown when there are no more results to display and we haven't fetched any data yet (i.e. data is less than count of items to be shown on first "page").
- `no-data`
  - Shown when `stateChanger.complete()` is called, indicating we've fetched and displayed all available data.
- `error`
  - Shown when there is an error or `stateChanger.error()` has been called. The slot has an `attemptLoad` prop passed to it which is just the internal `triggerLoad` function, designed for a "Retry" button or similar.

## 📦 Contributing

- Initially inspired by [jonasgeiler/svelte-infinite-loading](https://github.com/jonasgeiler/svelte-infinite-loading)
- Open to contributions, issues, and feedback 🙏

## 📝 License

MIT
