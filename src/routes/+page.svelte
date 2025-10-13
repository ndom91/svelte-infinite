<script lang="ts">
  import { InfiniteLoader, LoaderState } from "$lib/index.js"
  import WeekSection from "$routes/lib/WeekSection.svelte"
  import { generateCalendarWeeks, generateCalendarWeeksFromCurrent } from "$routes/lib/calendarData"
  import type { Week, Day } from "$routes/lib/types"

  const loaderState = new LoaderState()
  let calendarWeeks = $state<Week[]>([])
  let pageNumber = $state(1)
  let rootElement = $state<HTMLElement>()
  
  // Initialize with current UK week (Week 41, Oct 6-12, 2025)
  calendarWeeks = generateCalendarWeeksFromCurrent(4);

  // Function to handle adding a meal to a specific day
  const addActivity = (date: string, meal: any) => {
    // Find the week containing this date
    const weekIndex = calendarWeeks.findIndex(week => 
      week.days.some(day => day.date === date)
    );
    
    if (weekIndex !== -1) {
      // Update the specific day
      const dayIndex = calendarWeeks[weekIndex].days.findIndex(day => day.date === date);
      if (dayIndex !== -1) {
        // Initialize meals array if it doesn't exist
        if (!calendarWeeks[weekIndex].days[dayIndex].meals) {
          calendarWeeks[weekIndex].days[dayIndex].meals = [];
        }
        
        // Add the meal
        calendarWeeks[weekIndex].days[dayIndex].meals.push(meal);
        calendarWeeks[weekIndex].days[dayIndex].activities += 1;
        calendarWeeks[weekIndex].totalActivities += 1;
        
        // Trigger reactivity by creating new objects
        calendarWeeks[weekIndex] = { ...calendarWeeks[weekIndex] };
        calendarWeeks[weekIndex].days = [...calendarWeeks[weekIndex].days];
        calendarWeeks = [...calendarWeeks];
      }
    }
  };

  // Function to handle moving a meal between different dates
  const moveMeal = (fromDate: string, toDate: string, mealId: string) => {
    // Find the source week and day
    const fromWeekIndex = calendarWeeks.findIndex(week => 
      week.days.some(day => day.date === fromDate)
    );
    
    // Find the target week and day
    const toWeekIndex = calendarWeeks.findIndex(week => 
      week.days.some(day => day.date === toDate)
    );
    
    if (fromWeekIndex !== -1 && toWeekIndex !== -1) {
      const fromDayIndex = calendarWeeks[fromWeekIndex].days.findIndex(day => day.date === fromDate);
      const toDayIndex = calendarWeeks[toWeekIndex].days.findIndex(day => day.date === toDate);
      
      if (fromDayIndex !== -1 && toDayIndex !== -1) {
        // Find the meal to move
        const fromMeals = calendarWeeks[fromWeekIndex].days[fromDayIndex].meals || [];
        const mealToMove = fromMeals.find(meal => meal.id === mealId);
        
        if (mealToMove) {
          // Remove meal from source day
          calendarWeeks[fromWeekIndex].days[fromDayIndex].meals = fromMeals.filter(meal => meal.id !== mealId);
          calendarWeeks[fromWeekIndex].days[fromDayIndex].activities = calendarWeeks[fromWeekIndex].days[fromDayIndex].meals.length;
          calendarWeeks[fromWeekIndex].totalActivities = calendarWeeks[fromWeekIndex].days.reduce((sum, day) => sum + (day.meals?.length || 0), 0);
          
          // Add meal to target day
          if (!calendarWeeks[toWeekIndex].days[toDayIndex].meals) {
            calendarWeeks[toWeekIndex].days[toDayIndex].meals = [];
          }
          calendarWeeks[toWeekIndex].days[toDayIndex].meals.push(mealToMove);
          calendarWeeks[toWeekIndex].days[toDayIndex].activities = calendarWeeks[toWeekIndex].days[toDayIndex].meals.length;
          calendarWeeks[toWeekIndex].totalActivities = calendarWeeks[toWeekIndex].days.reduce((sum, day) => sum + (day.meals?.length || 0), 0);
          
          // Trigger reactivity
          calendarWeeks[fromWeekIndex] = { ...calendarWeeks[fromWeekIndex] };
          calendarWeeks[fromWeekIndex].days = [...calendarWeeks[fromWeekIndex].days];
          calendarWeeks[toWeekIndex] = { ...calendarWeeks[toWeekIndex] };
          calendarWeeks[toWeekIndex].days = [...calendarWeeks[toWeekIndex].days];
          calendarWeeks = [...calendarWeeks];
        }
      }
    }
  };

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
  <!-- Scrollable content -->
  <div class="flex-1 overflow-y-auto" bind:this={rootElement}>
    <InfiniteLoader
      {loaderState}
      triggerLoad={loadMore}
      loopDetectionTimeout={7500}
      intersectionOptions={{ root: rootElement, rootMargin: "0px 0px 500px 0px" }}
    >
      {#each calendarWeeks as week (week.startDate)}
        <WeekSection {week} onAddActivity={addActivity} onMoveMeal={moveMeal} />
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
