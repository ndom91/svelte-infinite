<script lang="ts">
  import { page } from "$app/stores"
  import SvelteLogo from "$assets/SvelteLogo.svelte"
  import { LOAD_LIMIT } from "$routes/lib/utils"
  import UserCard from "$routes/lib/UserCard.svelte"
  import { InfiniteLoader, loaderState } from "$lib/index.js"

  const allItems = $state<{ id: number; body: string }[]>($page.data.items)
  let pageNumber = $state(1)
  let rootElement = $state<HTMLElement>()

  // Load more items on infinite scroll
  const loadMore = async () => {
    try {
      pageNumber += 1
      const limit = String(LOAD_LIMIT)
      const skip = String(LOAD_LIMIT * (pageNumber - 1))

      // If there are less results on the first page than the limit,
      // don't keep trying to fetch more. We're done.
      if (allItems.length < LOAD_LIMIT) {
        loaderState.complete()
        return
      }

      const searchParams = new URLSearchParams({ limit, skip })

      const dataResponse = await fetch(`/api/data?${searchParams}`)

      if (!dataResponse.ok) {
        loaderState.error()
        pageNumber -= 1
        return
      }
      const data = await dataResponse.json()

      if (data.items.length) {
        allItems.push(...data.items)
      }

      // There are less items available than fit on one page,
      // don't keep trying to fetch more. We're done.
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
  <nav>
    <h1>Svelte <sup>5</sup> Infinite</h1>
    <SvelteLogo />
  </nav>
  <!--
    This '.content' element is my IntersectionObserver root because it is the
    element which has the 'overflow-y: scroll' property on it. 
  -->
  <div class="content" bind:this={rootElement}>
    <p>
      <span><strong>Instructions</strong>: Just keep scrolling..</span>
      <span>
        <strong>Warning</strong>: 10% of requests will <span class="warning-text">fail</span>
      </span>
    </p>
    <InfiniteLoader
      triggerLoad={loadMore}
      loopDetectionTimeout={7500}
      intersectionOptions={{ root: rootElement }}
    >
      {#each allItems as user (user.id)}
        <UserCard {user} />
      {/each}
      {#snippet loading()}
        <span style="font-size: 1.25rem">Artificially waiting...</span>
      {/snippet}
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
    height: 100dvh;
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
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .warning-text {
      color: crimson;
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

  @media (max-width: 768px) {
    nav {
      padding-inline: 3rem;
      h1 {
        font-size: 2.2rem;
      }
    }
    .content p {
      flex-direction: column;
      align-items: flex-start;
      justify-content: start;
    }
  }

  @media (max-width: 500px) {
    nav {
      padding-inline: 2rem;
      h1 {
        font-size: 1.8rem;
      }
    }
    .content p {
      flex-direction: column;
      align-items: flex-start;
      justify-content: start;
      font-size: 1rem;
    }
  }
</style>
