<script lang="ts">
  import type { Week } from './types';
  
  const { week } = $props<{ week: Week }>();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const formatDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
</script>

<section class="border-b border-gray-200 py-6">
  <div class="flex items-center justify-between px-6 mb-4">
    <div>
      <h2 class="text-lg font-medium text-gray-800">{formatDate(week.startDate)} - {formatDate(week.endDate)}</h2>
      <p class="text-sm text-gray-500">Total: {week.totalActivities} activity{week.totalActivities !== 1 ? 'ies' : ''}</p>
    </div>
    <div class="flex items-center gap-2">
      <span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">
        WEEK {week.weekNumber}
      </span>
      <button class="text-sm text-gray-500 hover:text-gray-700 transition-colors">Reset ↻</button>
    </div>
  </div>

  <!-- Days -->
  <div class="divide-y divide-gray-100">
    {#each week.days as day}
      <div class="flex px-6 py-4 items-start hover:bg-gray-50 transition-colors cursor-pointer">
        <div class="w-20 text-gray-500 font-medium">{formatDayName(day.date)} {formatDate(day.date)}</div>
        <div class="flex-1">
          {#if day.activities === 0}
            <div class="text-blue-500 hover:text-blue-600 hover:underline transition-colors">+ Add</div>
          {:else}
            <div class="text-sm text-gray-600">{day.activities} activity{day.activities !== 1 ? 'ies' : ''}</div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</section>