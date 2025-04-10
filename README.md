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

✨ Flexible  
⏰ Infinite Loop Detection  
📣 Control Loader State  
🔎 `IntersectionObserver` based  
🔥 Using Runes and Snippets  
🧑‍🔧 **Demo**: [svelte-5-infinite.vercel.app](https://svelte-5-infinite.vercel.app)  

> [!WARNING]
> `v0.5.0` contains a breaking change. See [this PR](https://github.com/ndom91/svelte-infinite/pull/12) for more details including migration steps.

## 🏗️ Getting Started

1. Install `svelte-infinite`

```bash
npm install svelte-infinite
pnpm install svelte-infinite
yarn add svelte-infinite
```

2. Import both `InfiniteLoader` and `LoaderState` from `svelte-infinite`

```svelte
<script lang="ts">
  import { InfiniteLoader, LoaderState } from "svelte-infinite"

  const loaderState = new LoaderState()
  const allItems = $state([])

  const loadMore = async () => {
    const res = fetch("...")
    const data = await res.json()
    allItems.push(...data)
    loaderState.loaded()
  }
</script>

<InfiniteLoader {loaderState} triggerLoad={loadMore}>
  {#each allItems as user (user.id)}
    <div>{user.name}</div>
  {/each}
</InfiniteLoader>
```

## 🍍 Example

This is a more realistic example use-case which includes a paginated data endpoint that your `triggerLoad` function should hit every time it's called to load more data. It also includes the use of some of the optional snippets to render custom markup inside the loader component.

```svelte
<script lang="ts">
  // +page.svelte
  import { InfiniteLoader, LoaderState } from "svelte-infinite"
  import UserCard from "$components/UserCard.svelte"

  const loaderState = new LoaderState()
  const LOAD_LIMIT = 20
  // Assume `$page.data.items` is the `+page.server.ts` server-side loaded
  // and rendered initial 20 items of the list
  const allItems = $state<{ id: number, body: string }[]>($page.data.items)
  let pageNumber = $state(1)

  // 1. This `loadMore` function is what we'll pass the InfiniteLoader component
  // to its `triggerLoad` prop.
  const loadMore = async () => {
    try {
      pageNumber += 1
      const limit = String(LOAD_LIMIT)
      const skip = String(LOAD_LIMIT * (pageNumber - 1))

      // If there are less results on the first page (page.server loaded data)
      // than the limit, don't keep trying to fetch more. We're done.
      if (allItems.length < LOAD_LIMIT) {
        loaderState.complete()               // <--- using loaderState
        return
      }

      const searchParams = new URLSearchParams({ limit, skip })

      // Fetch an endpoint that supports server-side pagination
      const dataResponse = await fetch(`/api/data?${searchParams}`)

      // Ideally, like most paginated endpoints, this should return the data
      // you've requested for your page, as well as the total amount of data
      // available to page through

      if (!dataResponse.ok) {
        loaderState.error()                 // <--- using loaderState

        // On errors, set the pageNumber back so we can retry
        // that page's data on the next 'loadMore' attempt
        pageNumber -= 1
        return
      }
      const data = await dataResponse.json()

      // If we've successfully received data, push it to the reactive state variable
      if (data.items.length) {
        allItems.push(...data.items)
      }

      // If there are more (or equal) number of items loaded as are totally available
      // from the API, don't keep trying to fetch more. We're done.
      if (allItems.length >= data.totalCount) {
        loaderState.complete()               // <--- using loaderState
      } else {
        loaderState.loaded()                 // <--- using loaderState
      }
    } catch (error) {
      console.error(error)
      loaderState.error()                   // <--- using loaderState
      pageNumber -= 1
    }
  }
</script>

<main class="container">

    <!-- 2. Here you wrap your items with the InfiniteLoader component -->
    <InfiniteLoader {loaderState} triggerLoad={loadMore}>
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
```

## ♾️ Usage

This package consists of two parts, first the `InfiniteLoader` component which is a wrapper around your items. It will trigger whichever async function you've passed to the `triggerLoad` prop when the user scrolls to the bottom of the list.

Second, there is also a `LoaderState` class which you should use to interact with the internal state of the loader. For example, if your `fetch` call errored, or you've reached the maximum number of items, etc. you can communicate that to the loader. The most basic usage example can be seen in the 'Getting Started' section above. A more complex example can be seen in the 'Example' section, and of course the application in `/src/routes/+page.svelte` in this repository also has a "real world" usage example.

> [!WARNING]
> As of `0.5.0` the `LoaderState` import is not an instance of the class, but the class itself. Meaning you'll need to instantiate it yourself with `new LoaderState()` per component instance. This gives the user more flexibility when trying to use multiple `svelte-infinite` instances per page, as well as resetting the state.

### `loaderState` Controller

The `loaderState` controller has 4 methods on it. You should call these at the appropriate times to control the internal state of the `InfiniteLoader`.

- `loaderState.loaded()`
  - Designed to be called after a successful fetch. Will set the internal state back to `READY` so another fetch can be attempted.
- `loaderState.error()`
  - Designed to be called after a failed fetch or any other error. This will cause the `InfiniteLoader` to render a "Retry" button by default, or the `error` snippet.
- `loaderState.complete()`
  - Designed to be called when you've reached the end of your list and there are no more items to fetch. This will render a "No more data" string, or the `noData` snippet.
- `loaderState.reset()`
  - Designed to be called when you want to reset the state of the `InfiniteLoader` to its initial state, for example if there is a search input tied to your data and the user enters a new query.

### `InfiniteLoader` Props

- `loaderState: LoaderState`
  - An instance of the `LoaderState` class.
- `triggerLoad: () => Promise<void>` - **required**
  - The async function to call when we should attempt to load more data to show.
- `intersectionOptions: `[`IntersectionObserverInit`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver#options)` = { rootMargin: "0px 0px 200px 0px" }` - optional
  - The options to pass to the `IntersectionObserver` instance. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver#options) for more details. The default `rootMargin` value will cause the target to intersect 200px earlier and trigger the `loadMore` function before it actually intersects with the root element (window by default). This has the effect of beginning to load the next page of data before the user has actually reached the current bottom of the list, making the experience feel more smooth.
  - If you are using a separate scroll container (element with `overflow-y: scroll`) other than the window / viewport, then it might be necessary for you to also pass a [custom `root` element](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/root) here.
- `loopTimeout: number = 3000` - optional
  - Length of the cool down period (in milliseconds).
- `loopDetectionTimeout: number = 2000` - optional
  - The time in milliseconds in which the `loopMaxCalls` count must be hit in order to trigger a cool down period.
- `loopMaxCalls: number = 5` - optional
  - The limit of `triggerLoad` executions which will trigger a cool down period, if reached within the `loopDetectionTimeout`.

### `InfiniteLoader` Snippets

Snippets [replace slots](https://svelte-5-preview.vercel.app/docs/snippets#snippets-and-slots) in Svelte 5, and as such are used here to customize the content shown at the bottom of the scroller in various states. The `InfiniteLoader` component has 5 snippet "slots" available.

- `loading`
  - Shown while calling `triggerLoad` and waiting on a response.
- `noResults`
  - Shown when there are no more results to display and we haven't fetched any data yet (i.e. data is less than count of items to be shown on first "page").
- `noData`
  - Shown when `loaderState.complete()` is called, indicating we've fetched and displayed all available data.
- `coolingOff`
  - Shown when `loaderState !== "COMPLETE"` and a loop has been detected. Will disappear and `loopTimeout` when the cooling off period expires.
- `error`
  - Shown when there is an error or `loaderState.error()` has been called. The snippet has an `attemptLoad` parameter passed to it which is just the internal `triggerLoad` function, designed for a "Retry" button or similar.

## 📦 Contributing

- Initially inspired by [jonasgeiler/svelte-infinite-loading](https://github.com/jonasgeiler/svelte-infinite-loading)
- Open to contributions, issues, and feedback 🙏

## 📝 License

MIT
