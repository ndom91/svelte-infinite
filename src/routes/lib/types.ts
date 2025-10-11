export interface Day {
  date: string;
  dayName: string;
  activities: number;
}

export interface Week {
  startDate: string;
  endDate: string;
  weekNumber: number;
  totalActivities: number;
  days: Day[];
}