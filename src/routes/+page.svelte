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
    <img
      id="svelte-vtuber"
      src="/svelte-vtuber.png"
      alt="Svelte VTuber-style Logo; Credit: https://twitter.com/styxpilled"
    />
    <label class="sr-only" for="svelte-vtuber">
      Credit https://twitter.com/styxpilled/status/1781565832251719868/photo/1
    </label>
    <h1>Infinite</h1>
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
      intersectionOptions={{ root: rootElement, rootMargin: "0px 0px 500px 0px" }}
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
    height: 100svh;
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
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;
    padding-block: 1rem;
    padding-inline: 2rem;
    border-radius: 1rem 1rem 0 0;
    background-color: #333;

    h1 {
      color: white;
      font-size: 2.5rem;
      font-family: "Operator Mono", "Cascadia Code", "Source Code Pro", Menlo, Consolas,
        "DejaVu Sans Mono", monospace;
      font-weight: 500;
      text-wrap: balance;
    }

    img {
      width: 256px;
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
      h1 {
        font-size: 2rem;
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
      h1 {
        display: none;
      }
    }
    .content p {
      flex-direction: column;
      align-items: flex-start;
      justify-content: start;
      font-size: 1rem;
    }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
