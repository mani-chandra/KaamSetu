export type AvailabilitySlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function getDayOfWeekFromDate(dateStr: string): number {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.getDay();
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isTimeWithinSlot(time: string, startTime: string, endTime: string): boolean {
  const value = timeToMinutes(time);
  return value >= timeToMinutes(startTime) && value < timeToMinutes(endTime);
}

export function isBookingWithinAvailability(
  scheduledDate: string,
  scheduledTime: string,
  availability: AvailabilitySlot[]
): { valid: boolean; message?: string } {
  const activeSlots = availability.filter((slot) => slot.isAvailable);
  if (activeSlots.length === 0) {
    return { valid: true };
  }

  const dayOfWeek = getDayOfWeekFromDate(scheduledDate);
  const daySlots = activeSlots.filter((slot) => slot.dayOfWeek === dayOfWeek);

  if (daySlots.length === 0) {
    return {
      valid: false,
      message: `Professional is not available on ${DAY_NAMES[dayOfWeek]}. Please pick another date.`,
    };
  }

  const matches = daySlots.some((slot) =>
    isTimeWithinSlot(scheduledTime, slot.startTime, slot.endTime)
  );

  if (!matches) {
    const ranges = daySlots.map((s) => `${s.startTime}–${s.endTime}`).join(", ");
    return {
      valid: false,
      message: `Selected time is outside working hours for ${DAY_NAMES[dayOfWeek]} (${ranges}).`,
    };
  }

  return { valid: true };
}

export function formatAvailabilitySummary(availability: AvailabilitySlot[]): string {
  const active = availability.filter((slot) => slot.isAvailable);
  if (active.length === 0) return "No fixed schedule — flexible timing";

  const byDay = new Map<number, string[]>();
  for (const slot of active) {
    const list = byDay.get(slot.dayOfWeek) ?? [];
    list.push(`${slot.startTime}–${slot.endTime}`);
    byDay.set(slot.dayOfWeek, list);
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a - b)
    .map(([day, ranges]) => `${DAY_NAMES[day]}: ${ranges.join(", ")}`)
    .join(" · ");
}
