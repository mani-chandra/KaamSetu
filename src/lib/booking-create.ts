import { prisma } from "@/lib/prisma";
import { notifyBookingEvent } from "@/lib/notifications";
import { validateProForBooking } from "@/lib/pro-availability";
import {
  type BookingFlow,
  bookingFlowToType,
  getBookingFlow,
  getBookingFlowConfig,
} from "@/lib/booking-flows";
import type { BookingFlowType, BookingStatus, BookingType, Prisma } from "@prisma/client";

export type CreateBookingInput = {
  customerId: string;
  professionalId?: string | null;
  categoryId: string;
  categorySlug: string;
  title: string;
  description?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  address?: string;
  city?: string;
  photoUrls?: string[];
  videoUrls?: string[];
  metadata?: Record<string, string>;
  specialInstructions?: string;
  packageId?: string;
  consultationMode?: string;
  budget?: number;
  eventDate?: string;
  recurring?: {
    frequency: string;
    preferredTime: string;
    durationWeeks?: number;
    endDate?: string;
  };
  isEmergency?: boolean;
  latitude?: number;
  longitude?: number;
};

function flowToEnum(flow: BookingFlow): BookingFlowType {
  const map: Record<BookingFlow, BookingFlowType> = {
    instant: "INSTANT",
    repair: "REPAIR",
    inspection: "INSPECTION",
    recurring: "RECURRING",
    marketplace: "MARKETPLACE",
    consultation: "CONSULTATION",
    emergency: "EMERGENCY",
  };
  return map[flow];
}

export async function resolveBookingAmount(
  input: CreateBookingInput,
  servicePrice: number | null | undefined
): Promise<{ amount: number | null; packageId?: string }> {
  if (input.packageId) {
    const flowConfig = getBookingFlowConfig(input.categorySlug);
    const pkgDef = flowConfig.packages?.find((p) => p.id === input.packageId);
    const pkg = await prisma.servicePackage.findFirst({
      where: {
        categoryId: input.categoryId,
        professionalId: input.professionalId ?? null,
        ...(pkgDef ? { name: pkgDef.name } : { id: input.packageId }),
      },
    });
    if (pkg) return { amount: pkg.price, packageId: pkg.id };
  }
  const flow = getBookingFlow(input.categorySlug);
  if (flow === "instant" && servicePrice) return { amount: servicePrice };
  return { amount: null };
}

export async function createBookingRecord(
  input: CreateBookingInput,
  options?: { skipAvailabilityCheck?: boolean; initialStatus?: BookingStatus }
) {
  const flow = input.isEmergency ? "emergency" : getBookingFlow(input.categorySlug);
  const bookingFlow = flowToEnum(flow);
  const type = bookingFlowToType(flow) as BookingType;

  if (input.professionalId && !options?.skipAvailabilityCheck && input.scheduledDate && input.scheduledTime) {
    const validation = await validateProForBooking({
      professionalId: input.professionalId,
      categoryId: input.categoryId,
      scheduledDate: input.scheduledDate,
      scheduledTime: input.scheduledTime,
      frequency: input.recurring?.frequency,
      preferredTime: input.recurring?.preferredTime,
    });
    if (!validation.valid) {
      throw new Error(validation.message || "Selected time is not available");
    }
  }

  let servicePrice: number | null = null;
  if (input.professionalId) {
    const service = await prisma.professionalService.findUnique({
      where: {
        professionalId_categoryId: {
          professionalId: input.professionalId,
          categoryId: input.categoryId,
        },
      },
      include: { professional: { include: { user: true } } },
    });
    if (!service || service.professional.status !== "APPROVED") {
      throw new Error("Professional not available");
    }
    servicePrice = service.price;
  }

  const { amount, packageId: resolvedPackageId } = await resolveBookingAmount(input, servicePrice);

  let status: BookingStatus = options?.initialStatus ?? "REQUESTED";
  if (flow === "instant" && amount && !options?.initialStatus) status = "CONFIRMED";
  if (flow === "emergency") status = "REQUESTED";

  const mediaCreates: Prisma.BookingMediaCreateWithoutBookingInput[] = [
    ...(input.photoUrls ?? []).map((url) => ({ url, mediaType: "photo" })),
    ...(input.videoUrls ?? []).map((url) => ({ url, mediaType: "video" })),
  ];

  const booking = await prisma.booking.create({
    data: {
      customerId: input.customerId,
      professionalId: input.professionalId ?? undefined,
      categoryId: input.categoryId,
      type,
      bookingFlow,
      status,
      title: input.title,
      description: input.description,
      scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : undefined,
      scheduledTime: input.scheduledTime,
      address: input.address,
      city: input.city,
      amount: amount ?? undefined,
      budget: input.budget,
      eventDate: input.eventDate ? new Date(input.eventDate) : undefined,
      consultationMode: input.consultationMode,
      specialInstructions: input.specialInstructions,
      isEmergency: input.isEmergency ?? flow === "emergency",
      latitude: input.latitude,
      longitude: input.longitude,
      packageId: resolvedPackageId ?? input.packageId,
      metadata: input.metadata ?? {},
      statusHistory: { create: { status, note: "Booking created" } },
      ...(mediaCreates.length
        ? {
            media: { create: mediaCreates },
            photos: {
              create: (input.photoUrls ?? []).map((imageUrl) => ({ imageUrl })),
            },
          }
        : {}),
      ...(flow === "repair" || flow === "inspection"
        ? input.professionalId
          ? {
              quote: {
                create: {
                  professionalId: input.professionalId,
                  amount: 0,
                  status: "PENDING",
                },
              },
            }
          : {}
        : {}),
      ...(input.recurring
        ? {
            recurringSchedule: {
              create: {
                frequency: input.recurring.frequency,
                preferredTime: input.recurring.preferredTime,
                durationWeeks: input.recurring.durationWeeks,
                endDate: input.recurring.endDate ? new Date(input.recurring.endDate) : undefined,
              },
            },
          }
        : {}),
    },
    include: {
      professional: { include: { user: true } },
      category: true,
    },
  });

  return booking;
}

export async function notifyBookingCreated(
  booking: {
    id: string;
    title: string;
    type: BookingType;
    professional?: { user: { id: string } } | null;
  },
  customerUserId: string
) {
  if (booking.professional?.user.id) {
    await notifyBookingEvent(
      booking.professional.user.id,
      "BOOKING_REQUEST",
      booking.type === "EMERGENCY" ? "Emergency request" : "New booking request",
      `You have a new request: ${booking.title}`,
      `/pro/dashboard/bookings`
    );
  }

  await notifyBookingEvent(
    customerUserId,
    booking.type === "INSTANT" ? "BOOKING_CONFIRMED" : "BOOKING_REQUEST",
    booking.type === "INSTANT" ? "Booking confirmed" : "Request submitted",
    `Your booking "${booking.title}" has been ${booking.type === "INSTANT" ? "confirmed" : "submitted"}.`,
    `/dashboard/bookings/${booking.id}`
  );
}

export async function notifyMarketplacePros(categoryId: string, city: string | undefined, bookingTitle: string) {
  const pros = await prisma.professionalProfile.findMany({
    where: {
      status: "APPROVED",
      services: { some: { categoryId } },
      ...(city ? { user: { city } } : {}),
    },
    include: { user: true },
    take: 20,
  });

  await Promise.all(
    pros.map((pro) =>
      notifyBookingEvent(
        pro.user.id,
        "BOOKING_REQUEST",
        "New marketplace request",
        `A customer posted: ${bookingTitle}. Submit your quote.`,
        `/pro/dashboard/bookings`
      )
    )
  );
}

export async function notifyEmergencyPros(
  categoryId: string,
  city: string | undefined,
  bookingTitle: string
) {
  const pros = await prisma.professionalProfile.findMany({
    where: {
      status: "APPROVED",
      services: { some: { categoryId } },
      ...(city ? { user: { city } } : {}),
    },
    include: { user: true },
    take: 15,
  });

  await Promise.all(
    pros.map((pro) =>
      notifyBookingEvent(
        pro.user.id,
        "BOOKING_REQUEST",
        "🚨 Emergency alert",
        `Emergency nearby: ${bookingTitle}. First to accept gets the job.`,
        `/pro/dashboard/bookings`
      )
    )
  );
}
