"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export type TimeSlot = {
  startTime: string;
  endTime: string;
};

export type DaySchedule = {
  dayOfWeek: number;
  enabled: boolean;
  slots: TimeSlot[];
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function buildDaySchedules(
  initial?: { dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean }[]
): DaySchedule[] {
  const grouped = new Map<number, TimeSlot[]>();
  for (const slot of initial ?? []) {
    if (!slot.isAvailable) continue;
    const list = grouped.get(slot.dayOfWeek) ?? [];
    list.push({ startTime: slot.startTime, endTime: slot.endTime });
    grouped.set(slot.dayOfWeek, list);
  }

  return DAYS.map((_, dayOfWeek) => {
    const slots = grouped.get(dayOfWeek);
    if (slots && slots.length > 0) {
      return { dayOfWeek, enabled: true, slots };
    }
    return {
      dayOfWeek,
      enabled: dayOfWeek >= 1 && dayOfWeek <= 6,
      slots: [{ startTime: "09:00", endTime: "18:00" }],
    };
  });
}

export function schedulesToApiSlots(schedules: DaySchedule[]) {
  return schedules.flatMap((day) =>
    day.enabled
      ? day.slots.map((slot) => ({
          dayOfWeek: day.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: true,
        }))
      : []
  );
}

type AvailabilityEditorProps = {
  schedules: DaySchedule[];
  onChange: (schedules: DaySchedule[]) => void;
};

export function AvailabilityEditor({ schedules, onChange }: AvailabilityEditorProps) {
  function updateDay(dayIndex: number, patch: Partial<DaySchedule>) {
    const next = [...schedules];
    next[dayIndex] = { ...next[dayIndex], ...patch };
    onChange(next);
  }

  function updateSlot(dayIndex: number, slotIndex: number, patch: Partial<TimeSlot>) {
    const next = [...schedules];
    const slots = [...next[dayIndex].slots];
    slots[slotIndex] = { ...slots[slotIndex], ...patch };
    next[dayIndex] = { ...next[dayIndex], slots };
    onChange(next);
  }

  function addSlot(dayIndex: number) {
    const next = [...schedules];
    next[dayIndex] = {
      ...next[dayIndex],
      slots: [...next[dayIndex].slots, { startTime: "14:00", endTime: "18:00" }],
    };
    onChange(next);
  }

  function removeSlot(dayIndex: number, slotIndex: number) {
    const next = [...schedules];
    const slots = next[dayIndex].slots.filter((_, i) => i !== slotIndex);
    next[dayIndex] = {
      ...next[dayIndex],
      slots: slots.length > 0 ? slots : [{ startTime: "09:00", endTime: "18:00" }],
    };
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add multiple time blocks per day to schedule breaks (e.g. morning and afternoon slots with a lunch break in between).
      </p>
      {schedules.map((day, dayIndex) => (
        <Card key={day.dayOfWeek}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={(e) => updateDay(dayIndex, { enabled: e.target.checked })}
                />
                {DAYS[day.dayOfWeek]}
              </label>
              {day.enabled && (
                <Button type="button" variant="outline" size="sm" onClick={() => addSlot(dayIndex)}>
                  <Plus className="h-4 w-4 mr-1" /> Add time block
                </Button>
              )}
            </div>
          </CardHeader>
          {day.enabled && (
            <CardContent className="space-y-3">
              {day.slots.map((slot, slotIndex) => (
                <div key={slotIndex} className="flex items-end gap-3 flex-wrap">
                  <div className="space-y-1">
                    <Label className="text-xs">From</Label>
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(dayIndex, slotIndex, { startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">To</Label>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(dayIndex, slotIndex, { endTime: e.target.value })}
                    />
                  </div>
                  {day.slots.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSlot(dayIndex, slotIndex)}
                      aria-label="Remove time block"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

export { DAYS as AVAILABILITY_DAYS };
