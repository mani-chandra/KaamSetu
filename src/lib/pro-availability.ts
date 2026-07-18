import { prisma } from "@/lib/prisma";
import {
  getDayOfWeekFromDate,
  isBookingWithinAvailability,
  type AvailabilitySlot,
} from "@/lib/availability";
import type { Prisma } from "@prisma/client";

const CONFLICT_STATUSES = ["CONFIRMED", "IN_PROGRESS", "QUOTED"] as const;

export type AvailableProfessional = {
  id: string;
  bio: string | null;
  experienceYears: number;
  avgRating: number;
  reviewCount: number;
  completedJobs: number;
  isVerified: boolean;
  user: { name: string | null; image: string | null; city: string | null };
  badges: { label: string }[];
  service: {
    price: number | null;
    priceType: string;
    minPrice: number | null;
    maxPrice: number | null;
  } | null;
  availabilitySummary: string;
};

export type AlternateSlot = {
  date: string;
  time: string;
  professionalCount: number;
};

type CandidatePro = {
  id: string;
  bio: string | null;
  experienceYears: number;
  avgRating: number;
  reviewCount: number;
  completedJobs: number;
  isVerified: boolean;
  user: { name: string | null; image: string | null; city: string | null };
  badges: { label: string }[];
  availability: AvailabilitySlot[];
  services: {
    price: number | null;
    priceType: string;
    minPrice: number | null;
    maxPrice: number | null;
  }[];
};

function dateAtNoon(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00`);
}

function conflictKey(proId: string, dateStr: string, time: string): string {
  return `${proId}|${dateStr}|${time}`;
}

export async function hasBookingConflict(
  professionalId: string,
  scheduledDate: string,
  scheduledTime: string
): Promise<boolean> {
  const count = await prisma.booking.count({
    where: {
      professionalId,
      scheduledDate: dateAtNoon(scheduledDate),
      scheduledTime,
      status: { in: [...CONFLICT_STATUSES] },
    },
  });
  return count > 0;
}

function isProFreeAtSlot(
  pro: CandidatePro,
  dateStr: string,
  time: string,
  conflicts: Set<string>
): boolean {
  if (conflicts.has(conflictKey(pro.id, dateStr, time))) return false;
  const slotCheck = isBookingWithinAvailability(dateStr, time, pro.availability);
  return slotCheck.valid;
}

async function fetchCandidatePros(categoryId: string, city?: string): Promise<CandidatePro[]> {
  const where: Prisma.ProfessionalProfileWhereInput = {
    status: "APPROVED",
    services: { some: { categoryId, isActive: true } },
  };

  if (city?.trim()) {
    where.user = { city: { contains: city.trim() } };
  }

  return prisma.professionalProfile.findMany({
    where,
    include: {
      user: { select: { name: true, image: true, city: true } },
      badges: { select: { label: true } },
      availability: true,
      services: {
        where: { categoryId, isActive: true },
        select: { price: true, priceType: true, minPrice: true, maxPrice: true },
      },
    },
    orderBy: { avgRating: "desc" },
  });
}

async function fetchConflictSet(
  proIds: string[],
  dates: string[],
  times: string[]
): Promise<Set<string>> {
  if (proIds.length === 0 || dates.length === 0) return new Set();

  const bookings = await prisma.booking.findMany({
    where: {
      professionalId: { in: proIds },
      scheduledDate: { in: dates.map(dateAtNoon) },
      scheduledTime: times.length === 1 ? times[0] : { in: times },
      status: { in: [...CONFLICT_STATUSES] },
    },
    select: { professionalId: true, scheduledDate: true, scheduledTime: true },
  });

  const set = new Set<string>();
  for (const b of bookings) {
    if (!b.scheduledDate || !b.scheduledTime) continue;
    const dateStr = b.scheduledDate.toISOString().split("T")[0];
    set.add(conflictKey(b.professionalId!, dateStr, b.scheduledTime));
  }
  return set;
}

function formatPro(pro: CandidatePro): AvailableProfessional {
  const service = pro.services[0] ?? null;
  const active = pro.availability.filter((s) => s.isAvailable);
  let availabilitySummary = "Flexible schedule";
  if (active.length > 0) {
    const days = [...new Set(active.map((s) => s.dayOfWeek))].length;
    availabilitySummary = `${days} day${days === 1 ? "" : "s"}/week`;
  }

  return {
    id: pro.id,
    bio: pro.bio,
    experienceYears: pro.experienceYears,
    avgRating: pro.avgRating,
    reviewCount: pro.reviewCount,
    completedJobs: pro.completedJobs,
    isVerified: pro.isVerified,
    user: pro.user,
    badges: pro.badges,
    service,
    availabilitySummary,
  };
}

export async function findAvailableProfessionals(params: {
  categoryId: string;
  scheduledDate: string;
  scheduledTime: string;
  city?: string;
  preferredProId?: string;
  limit?: number;
}): Promise<AvailableProfessional[]> {
  const candidates = await fetchCandidatePros(params.categoryId, params.city);
  const proIds = candidates.map((p) => p.id);
  const conflicts = await fetchConflictSet(proIds, [params.scheduledDate], [params.scheduledTime]);

  const available = candidates.filter((pro) =>
    isProFreeAtSlot(pro, params.scheduledDate, params.scheduledTime, conflicts)
  );

  const sorted = [...available];
  if (params.preferredProId) {
    sorted.sort((a, b) => {
      if (a.id === params.preferredProId) return -1;
      if (b.id === params.preferredProId) return 1;
      return b.avgRating - a.avgRating;
    });
  }

  const limit = params.limit ?? 20;
  return sorted.slice(0, limit).map(formatPro);
}

export async function suggestAlternateSlots(params: {
  categoryId: string;
  city?: string;
  fromDate?: string;
  maxSuggestions?: number;
}): Promise<AlternateSlot[]> {
  const candidates = await fetchCandidatePros(params.categoryId, params.city);
  if (candidates.length === 0) return [];

  const times = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
  const start = params.fromDate
    ? new Date(`${params.fromDate}T12:00:00`)
    : new Date(`${new Date().toISOString().split("T")[0]}T12:00:00`);

  const dateStrings: string[] = [];
  for (let d = 0; d < 7; d++) {
    const dt = new Date(start);
    dt.setDate(dt.getDate() + d);
    dateStrings.push(dt.toISOString().split("T")[0]);
  }

  const proIds = candidates.map((p) => p.id);
  const conflicts = await fetchConflictSet(proIds, dateStrings, times);

  const suggestions: AlternateSlot[] = [];
  const max = params.maxSuggestions ?? 5;

  for (const dateStr of dateStrings) {
    for (const time of times) {
      const count = candidates.filter((pro) => isProFreeAtSlot(pro, dateStr, time, conflicts)).length;
      if (count > 0) {
        suggestions.push({ date: dateStr, time, professionalCount: count });
        if (suggestions.length >= max) return suggestions;
      }
    }
  }

  return suggestions;
}

/** Recurring: first session must fall on a day/time the pro works. */
export function isRecurringSlotValid(
  scheduledDate: string,
  preferredTime: string,
  frequency: string,
  availability: AvailabilitySlot[]
): { valid: boolean; message?: string } {
  const slotCheck = isBookingWithinAvailability(scheduledDate, preferredTime, availability);
  if (!slotCheck.valid) return slotCheck;

  if (frequency === "Daily") return { valid: true };

  const dayOfWeek = getDayOfWeekFromDate(scheduledDate);
  const activeDays = availability.filter((s) => s.isAvailable).map((s) => s.dayOfWeek);
  if (activeDays.length === 0) return { valid: true };

  if (frequency === "Weekly" || frequency === "Alternate Days" || frequency === "Monthly") {
    if (!activeDays.includes(dayOfWeek)) {
      return {
        valid: false,
        message: "Professional is not available on the chosen day for this recurring schedule.",
      };
    }
  }

  return { valid: true };
}

export async function validateProForBooking(params: {
  professionalId: string;
  categoryId: string;
  scheduledDate: string;
  scheduledTime: string;
  frequency?: string;
  preferredTime?: string;
}): Promise<{ valid: boolean; message?: string }> {
  const time = params.preferredTime || params.scheduledTime;

  const pro = await prisma.professionalProfile.findFirst({
    where: {
      id: params.professionalId,
      status: "APPROVED",
      services: { some: { categoryId: params.categoryId, isActive: true } },
    },
    include: { availability: true },
  });

  if (!pro) return { valid: false, message: "Professional not available for this service" };

  if (params.frequency) {
    const recurringCheck = isRecurringSlotValid(
      params.scheduledDate,
      time,
      params.frequency,
      pro.availability
    );
    if (!recurringCheck.valid) return recurringCheck;
  } else {
    const slotCheck = isBookingWithinAvailability(
      params.scheduledDate,
      time,
      pro.availability
    );
    if (!slotCheck.valid) return slotCheck;
  }

  if (await hasBookingConflict(params.professionalId, params.scheduledDate, time)) {
    return { valid: false, message: "This time slot was just booked. Please choose another." };
  }

  return { valid: true };
}
