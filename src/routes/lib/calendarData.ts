import type { Week, Day } from './types';

// UK week numbering (ISO 8601) - weeks start on Monday
function getUKWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

function getStartOfUKWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

export function generateWeekData(startDate: Date, weekNumber: number): Week {
  const days: Day[] = [];
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // Add 6 days to get the end of week
  
  let totalActivities = 0;
  
  // Generate 7 days for the week
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    // Start with no activities - user will add meals manually
    const activities = 0;
    
    days.push({
      date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
      dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
      activities,
      meals: []
    });
  }
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    weekNumber,
    totalActivities,
    days
  };
}

export function generateCalendarWeeks(startDate: Date, count: number): Week[] {
  const weeks: Week[] = [];
  let currentDate = new Date(startDate);
  
  for (let i = 0; i < count; i++) {
    // Find the start of the week (Monday) - UK format
    const weekStart = getStartOfUKWeek(currentDate);
    const weekNumber = getUKWeekNumber(weekStart);
    
    weeks.push(generateWeekData(weekStart, weekNumber));
    
    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return weeks;
}

// Helper function to generate weeks starting from current UK week
export function generateCalendarWeeksFromCurrent(count: number): Week[] {
  const today = new Date();
  const currentWeekStart = getStartOfUKWeek(today);
  return generateCalendarWeeks(currentWeekStart, count);
}