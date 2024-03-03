<script lang="ts">
  import { page } from "$app/stores"
  import { InfiniteLoader, stateChanger } from "../lib/index.js"

  const allItems = $state<number[]>($page.data.items)
  const limitLoadCount = 10
  let pageNumber = $state(1)

  // Load more items on infinite scroll
  const loadMore = async () => {
    try {
      pageNumber += 1
      const limit = limitLoadCount
      const skip = limitLoadCount * (pageNumber - 1)

      // If there are less results than the first page, we are done
      if (allItems.length < skip) {
        stateChanger.complete()
        return
      }

      const dataResponse = await fetch("/api/data", {
        method: "POST",
        body: JSON.stringify({ limit, skip })
      })
      if (!dataResponse.ok) return
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

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<div class="loader-wrapper">
  <InfiniteLoader triggerLoad={async () => await loadMore()}>
    {#each allItems as data}
      <div class="data-item">{data}</div>
    {/each}
  </InfiniteLoader>
</div>

<style>
  body {
    display: grid;
    place-items: center;
    max-width: 1024px;
    width: 100%;
  }

  .data-item {
    display: grid;
    place-items: center;
    padding: 3rem;
    border: 1px solid #ccc;
  }

  .loader-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
  }
</style>
