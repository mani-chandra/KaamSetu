import type { BookingStatus } from "@prisma/client";

export function generateServiceOtp(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function getServiceOtpExpiry(): Date {
  return new Date(Date.now() + 3 * 60 * 60 * 1000);
}

export function isServiceOtpValid(
  otp: string | null | undefined,
  expiresAt: Date | null | undefined,
  submitted: string
): boolean {
  if (!otp || !expiresAt) return false;
  if (expiresAt.getTime() < Date.now()) return false;
  return otp === submitted.trim();
}

export type JourneyStepId =
  | "requested"
  | "approved"
  | "enRoute"
  | "inProgress"
  | "completed";

export type JourneyStep = {
  id: JourneyStepId;
  labelKey: keyof typeof journeyStepOrder;
  done: boolean;
  active: boolean;
};

const journeyStepOrder = {
  requested: 0,
  approved: 1,
  enRoute: 2,
  inProgress: 3,
  completed: 4,
} as const;

const STATUS_TO_STEP: Record<BookingStatus, JourneyStepId> = {
  REQUESTED: "requested",
  QUOTED: "requested",
  CONFIRMED: "approved",
  EN_ROUTE: "enRoute",
  IN_PROGRESS: "inProgress",
  COMPLETED: "completed",
  CANCELLED: "requested",
  DISPUTED: "inProgress",
};

export function getBookingJourneySteps(status: BookingStatus): JourneyStep[] {
  const current = STATUS_TO_STEP[status];
  const currentIndex = journeyStepOrder[current];

  const steps: { id: JourneyStepId; labelKey: JourneyStepId }[] = [
    { id: "requested", labelKey: "requested" },
    { id: "approved", labelKey: "approved" },
    { id: "enRoute", labelKey: "enRoute" },
    { id: "inProgress", labelKey: "inProgress" },
    { id: "completed", labelKey: "completed" },
  ];

  return steps.map((step) => {
    const stepIndex = journeyStepOrder[step.id];
    return {
      ...step,
      done: stepIndex < currentIndex || status === "COMPLETED",
      active: step.id === current && status !== "COMPLETED" && status !== "CANCELLED",
    };
  });
}

export function getCustomerStatusHint(status: BookingStatus): keyof typeof customerStatusHints | null {
  if (status === "REQUESTED" || status === "QUOTED") return "waitingApproval";
  if (status === "CONFIRMED") return "proApprovedHint";
  if (status === "EN_ROUTE") return "proOnTheWayHint";
  if (status === "IN_PROGRESS") return "serviceInProgress";
  return null;
}

export const customerStatusHints = {
  waitingApproval: "waitingApproval",
  proApprovedHint: "proApprovedHint",
  proOnTheWayHint: "proOnTheWayHint",
  serviceInProgress: "serviceInProgress",
} as const;
