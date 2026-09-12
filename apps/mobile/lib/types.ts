export type UserRole = "CUSTOMER" | "PROFESSIONAL" | "ADMIN";

export type User = {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  city?: string | null;
  role: UserRole;
  image?: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  groupSlug?: string;
  groupName?: string;
};

export type CategoryGroup = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  categories: Category[];
};

export type Professional = {
  id: string;
  bio: string | null;
  experienceYears: number;
  avgRating: number;
  reviewCount: number;
  completedJobs: number;
  responseTime: number | null;
  serviceAreas: unknown;
  isVerified: boolean;
  user: { name: string | null; image: string | null; city: string | null };
  badges: { label: string }[];
  services: {
    price: number | null;
    priceType: string;
    minPrice: number | null;
    category?: { id: string; name: string; slug: string };
  }[];
};

export type BookingStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "EN_ROUTE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type Booking = {
  id: string;
  title: string;
  description?: string | null;
  status: BookingStatus;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  address?: string | null;
  city?: string | null;
  amount?: number | null;
  createdAt: string;
  category?: { id: string; name: string; slug: string };
  professional?: {
    id: string;
    user: { name: string | null; image: string | null; phone?: string | null };
  } | null;
  payment?: { status: string; amount: number } | null;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};
