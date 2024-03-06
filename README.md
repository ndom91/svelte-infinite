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

Svelte 5 is still early days, but I couldn't find an infinite loader-type component that was maintained for the last few years of Svelte 4. So I had recently built this for a Svelte 5-based application I was working on and was pretty happy with it, so I decided to clean it up and share it with the world! As Svelte 5 inevitably changes over the next weeks and months, I plan to keep this package updated and working with the latest available version of Svelte 5.

## 🏗️ Getting Started

1. Install `svelte-infinite`

```bash
npm install svelte-infinite
pnpm install svelte-infinite
yarn add svelte-infinite
```

2. Import both `InfiniteLoader` and `loaderState` from `svelte-infinite`

```svelte
<script lang="ts">
  import { InfiniteLoader, loaderState } from "svelte-infinite"

  const allItems = $state([])

  const loadMore = async () => {
    const res = fetch("...")
    const data = await jes.json()
    allItems.push(...data)
    loaderState.loaded()
  }
</script>

<InfiniteLoader triggerLoad={loadMore}>
  {#each allItems as user (user.id)}
    <div>{user.name}</div>
  {/each}
</InfiniteLoader>
```

The component should wrap your list of items, and `loaderState` should be used in your `triggerLoad` function (and/or elsewhere) to interact with the internal state of the Loader component. You tell it whether you're out of data, ran into an error, etc.

See the example below and [in this repository](https://github.com/ndom91/svelte-infinite/blob/main/src/routes/%2Bpage.svelte#L12-L50) for more details.

## 🍍 Example

```svelte
<script lang="ts">
  import { InfiniteLoader, loaderState } from "svelte-infinite"
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
        loaderState.complete()
        return
      }

      const searchParams = new URLSearchParams({ limit, skip })

      // Execute the API call to grab more data
      const dataResponse = await fetch(`/api/data?${searchParams}`)

      // Ideally, like most paginated endpoints, this should return the data
      // you've requested for your page, as well as the total amount of data
      // available to page through
      if (!dataResponse.ok) {
        loaderState.error()

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
        loaderState.complete()
      } else {
        loaderState.loaded()
      }
    } catch (error) {
      console.error(error)
      loaderState.error()
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

      <!-- 3. There are a few optional snippets for customizing what is shown at the bottom
           of the scroller in various states, see the 'Snippets' section for more details -->
      {#snippet loading()}
        Loading...
      {/snippet}
      {#snippet error(load)}
        <div>Error fetching data</div>
        <button onclick={load}>Retry</button>
      {/snippet}
    </InfiniteLoader>
</main>

</script>
```

## ♾️ Usage

This package consists of two parts, first the `InfiniteLoader` component which is a wrapper around your items. It will trigger whichever async function you've passed to the `triggerLoad` prop when the user scrolls to the bottom of the list.

Second, there is also a `loaderState` import which you should use to interact with the internal state of the loader. For example, if your `fetch` call errored, or you've reached the maximum number of items, etc. you can communicate that to the loader. The most basic usage example can be seen in the 'Getting Started' section above. A more complex example can be seen in the 'Example' section, and of course the application in `/src/routes/+page.svelte` in this repository also has a "real-world" usage example.

### loaderState

The `loaderState` import is an object with 4 methods on it:

- `loaderState.loaded()`
  - Designed to be called after a successful fetch.
- `loaderState.error()`
  - Designed to be called after a failed fetch or any other error. This will cause the `InfiniteLoader` to render a "Retry" button by default, or the `error` snippet.
- `loaderState.complete()`
  - Designed to be called when you've reached the end of your list and there are no more items to fetch. This will render a "No more data" string, or the `no-data` snippet.
- `loaderState.reset()`
  - Designed to be called when you want to reset the state of the `InfiniteLoader` to its initial state, for example if there is a search input tied to your infinite list and the user enters a new query.

### Props

- `triggerLoad: () => Promise<void>` - **required**
  - The async function to call when we should attempt to load more data to show.
- `intersectionOptions: `[`IntersectionObserverInit`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver#options)` = { rootMargin: "0px 0px 200px 0px" }` - optional
  - The options to pass to the `IntersectionObserver` instance. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver#options) for more details. The default `rootMargin` value will cause the target to intersect 200px earlier and trigger the `loadMore` function before it actually intersects with the root element (window by default). This has the effect of beginning to load the next page of data before the user has actually reached the current bottom of the list, making the experience feel more smooth.
  - It may also be required to pass in a reference to your scroll container as the `root` option, if your scroll container is not the window.
- `loopTimeout: number = 2000` - optional
  - If the `loopMaxCalls` is reached within the detection timeout, a cool down period is triggered of this length (in milliseconds).
- `loopDetectionTimeout: number = 1000` - optional
  - The time in milliseconds in which the `loopMaxCalls` count must be hit in order to trigger a cool down period of `loopTimeout` length.
- `loopMaxCalls: number = 5` - optional
  - The number of calls to the `triggerLoad` function within timeout which should trigger cool down period.

### Snippets

Snippets [replace slots](https://svelte-5-preview.vercel.app/docs/snippets#snippets-and-slots) in Svelte 5, and as such are used here to customize the content shown at the bottom of the scroller in various states. The `InfiniteLoader` component has 4 props for snippets available.

- `loading`
  - Shown while calling `triggerLoad` and waiting on a response.
- `noResults`
  - Shown when there are no more results to display and we haven't fetched any data yet (i.e. data is less than count of items to be shown on first "page").
- `noData`
  - Shown when `loaderState.complete()` is called, indicating we've fetched and displayed all available data.
- `error`
  - Shown when there is an error or `loaderState.error()` has been called. The snippet has an `attemptLoad` parameter passed to it which is just the internal `triggerLoad` function, designed for a "Retry" button or similar.

## 📦 Contributing

- Initially inspired by [jonasgeiler/svelte-infinite-loading](https://github.com/jonasgeiler/svelte-infinite-loading)
- Open to contributions, issues, and feedback 🙏

## 📝 License

MIT
