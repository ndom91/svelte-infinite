<script lang="ts">
  import { page } from "$app/stores"
  import SvelteLogo from "../assets/SvelteLogo.svelte"
  import { LOAD_LIMIT } from "$lib/utils"
  import UserCard from "$lib/UserCard.svelte"
  import { InfiniteLoader, stateChanger } from "../lib/index.js"

  const allItems = $state<number[]>($page.data.items)
  let pageNumber = $state(1)

  // Load more items on infinite scroll
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

      const dataResponse = await fetch("/api/data", {
        method: "POST",
        body: JSON.stringify({ limit, skip })
      })
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
  <nav>
    <h1>Svelte <sup>5</sup> Infinite</h1>
    <SvelteLogo alt="Svelte Logo" />
  </nav>
  <div class="content">
    <p><strong>Instructions</strong>: Just keep scrolling..</p>
    <InfiniteLoader triggerLoad={async () => await loadMore()}>
      {#each allItems as user (user.id)}
        <UserCard {user} />
      {/each}
    </InfiniteLoader>
  </div>
</main>

<style>
  :global(body) {
    display: grid;
    place-items: center;
    margin: 0 auto;
    width: 100%;
    max-width: 1024px;
    max-height: 100vh;
    overflow: hidden;
  }

  .container {
    display: flex;
    flex-direction: column;
    width: min(95%, 960px);
    margin: 2rem;
    background-color: #eee;
    border-radius: 1rem;
    max-height: calc(100vh - 4rem);
  }

  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-block: 1rem;
    padding-inline: 4rem;
    border-radius: 1rem 1rem 0 0;
    background-color: #333;

    h1 {
      color: white;
      font-size: 3rem;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    padding: 2rem;
    overflow-y: scroll;

    p {
      font-size: 1.25rem;
    }
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
