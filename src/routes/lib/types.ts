export interface Meal {
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