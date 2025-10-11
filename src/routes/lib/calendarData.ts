import type { Week, Day } from './types';

export function generateWeekData(startDate: Date, weekNumber: number): Week {
  const days: Day[] = [];
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // Add 6 days to get the end of week
  
  let totalActivities = 0;
  
  // Generate 7 days for the week
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    // Random number of activities (0-3)
    const activities = Math.floor(Math.random() * 4);
    totalActivities += activities;
    
    days.push({
      date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
      dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
      activities
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
    // Find the start of the week (Monday)
    const dayOfWeek = currentDate.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - daysFromMonday);
    
    weeks.push(generateWeekData(weekStart, i + 1));
    
    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return weeks;
}