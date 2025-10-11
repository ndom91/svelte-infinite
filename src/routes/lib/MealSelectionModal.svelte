<script lang="ts">
  let { isOpen = $bindable(), onSelectMeal } = $props<{
    isOpen: boolean;
    onSelectMeal: (meal: any) => void;
  }>();

  // Sample meal data for the modal
  const availableMeals = [
    { name: "Spaghetti Bolognese", time: "45 min", icon: "utensils", color: "green" },
    { name: "Chicken Stir-Fry", time: "30 min", icon: "utensils", color: "green" },
    { name: "Fish and Chips", time: "40 min", icon: "utensils", color: "teal" },
    { name: "Vegetable Curry", time: "35 min", icon: "utensils", color: "yellow" },
    { name: "Roast Chicken", time: "90 min", icon: "chef-hat", color: "green" },
    { name: "Beef Tacos", time: "25 min", icon: "utensils", color: "teal" },
    { name: "Salmon Teriyaki", time: "20 min", icon: "utensils", color: "green" },
    { name: "Mushroom Risotto", time: "35 min", icon: "chef-hat", color: "yellow" }
  ];

  let searchTerm = $state("");

  const filteredMeals = $derived(
    availableMeals.filter(meal => 
      meal.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSelectMeal = (meal: any) => {
    onSelectMeal(meal);
    isOpen = false;
  };

  const handleClose = () => {
    isOpen = false;
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };
</script>

{#if isOpen}
  <div 
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    onclick={handleBackdropClick}
    role="presentation"
  >
    <div 
      role="dialog" 
      aria-labelledby="meal-modal-title"
      aria-describedby="meal-modal-description"
      class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg sm:max-w-md"
      tabindex="-1"
      style="pointer-events: auto;"
    >
      <!-- Header -->
      <div class="flex flex-col space-y-1.5 text-center sm:text-left">
        <div class="flex items-center justify-between">
          <h2 id="meal-modal-title" class="text-lg font-semibold leading-none tracking-tight">Add a Meal</h2>
          <button 
            type="button" 
            class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            onclick={handleClose}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x h-4 w-4">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
            <span class="sr-only">Close</span>
          </button>
        </div>
      </div>

      <!-- Search and filters -->
      <div class="space-y-3">
        <input 
          type="text" 
          class="flex h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full" 
          placeholder="Search recipes or type #ingredient..." 
          bind:value={searchTerm}
        />
        <div class="flex items-center gap-2">
          <button class="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 border bg-white shadow-xs hover:bg-gray-50 border-gray-300 h-8 rounded-md px-3 text-xs gap-1" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus h-4 w-4">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            Ingredient
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down h-4 w-4">
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          </button>
          <div class="flex flex-wrap gap-2"></div>
        </div>
      </div>

      <!-- Meal list -->
      <div class="space-y-2 h-[400px] overflow-y-auto mt-4">
        {#each filteredMeals as meal}
          <button 
            class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 text-left"
            onclick={() => handleSelectMeal(meal)}
          >
            <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-{meal.icon} w-5 h-5 text-gray-600">
                {#if meal.icon === 'utensils'}
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                  <path d="M7 2v20"></path>
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                {:else if meal.icon === 'chef-hat'}
                  <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"></path>
                  <path d="M6 17h12"></path>
                {/if}
              </svg>
            </div>
            <div class="flex-1 text-left">
              <div class="font-medium text-gray-900">{meal.name}</div>
              <div class="text-sm text-gray-500">{meal.time}</div>
            </div>
          </button>
        {/each}
        
        {#if filteredMeals.length === 0}
          <div class="text-center text-gray-500 py-8">
            No meals found matching "{searchTerm}"
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}