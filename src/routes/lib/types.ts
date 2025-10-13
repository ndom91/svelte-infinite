export interface Meal {
  id: string;
  name: string;
  time: string;
  icon: string;
  color: string;
}

export interface Day {
  date: string;
  dayName: string;
  activities: number;
  meals?: Meal[];
}

export interface Week {
  startDate: string;
  endDate: string;
  weekNumber: number;
  totalActivities: number;
  days: Day[];
}

// Drag and drop event types for svelte-dnd-action
export interface DndEvent<T = any> {
  items: T[];
  info: {
    trigger: string;
    id: string;
    source: string;
  };
}