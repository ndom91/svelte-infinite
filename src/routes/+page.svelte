<script lang="ts">
  import { InfiniteLoader, LoaderState } from "$lib/index.js"
  import WeekSection from "$routes/lib/WeekSection.svelte"
  import { generateCalendarWeeks } from "$routes/lib/calendarData"
  import type { Week } from "$routes/lib/types"

  const loaderState = new LoaderState()
  const calendarWeeks = $state<Week[]>([])
  let pageNumber = $state(1)
  let rootElement = $state<HTMLElement>()
  
  // Initialize with some starting weeks
  const startDate = new Date('2024-01-01'); // Starting from January 1, 2024
  const initialWeeks = generateCalendarWeeks(startDate, 4);
  calendarWeeks.push(...initialWeeks);

  // Load more items on infinite scroll
  const loadMore = async () => {
    try {
      pageNumber += 1
      
      // Generate more weeks
      const lastWeek = calendarWeeks[calendarWeeks.length - 1];
      const lastDate = new Date(lastWeek.endDate);
      lastDate.setDate(lastDate.getDate() + 1); // Start next day after last week
      
      const newWeeks = generateCalendarWeeks(lastDate, 2); // Generate 2 weeks at a time
      
      if (newWeeks.length > 0) {
        calendarWeeks.push(...newWeeks);
        loaderState.loaded();
      } else {
        // Stop loading if we reach a certain number of weeks (for demo purposes)
        if (pageNumber > 10) {
          loaderState.complete();
        } else {
          loaderState.loaded();
        }
      }
    } catch (error) {
      console.error(error);
      loaderState.error();
      pageNumber -= 1;
    }
  }
</script>

<div class="flex flex-col h-screen bg-gray-50">
  <!-- Header -->
  <header class="flex justify-between items-center px-6 py-4 border-b bg-white sticky top-0 z-10">
    <h1 class="text-xl font-semibold text-gray-900">MealPlanner Calendar View</h1>
    <button class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">Save</button>
  </header>

  <!-- Scrollable content -->
  <div class="flex-1 overflow-y-auto" bind:this={rootElement}>
    <InfiniteLoader
      {loaderState}
      triggerLoad={loadMore}
      loopDetectionTimeout={7500}
      intersectionOptions={{ root: rootElement, rootMargin: "0px 0px 500px 0px" }}
    >
      {#each calendarWeeks as week (week.startDate)}
        <WeekSection {week} />
      {/each}
      {#snippet loading()}
        <div class="flex justify-center py-6 text-gray-400 text-sm">Loading more weeks...</div>
      {/snippet}
    </InfiniteLoader>
  </div>
</div>

<style>
  :global(html) {
    height: 100%;
  }
  :global(body) {
    height: 100%;
    margin: 0;
    padding: 0;
  }
</style>
