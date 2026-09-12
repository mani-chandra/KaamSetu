import { API_URL } from "@/constants/config";
import type {
  Booking,
  Category,
  CategoryGroup,
  Notification,
  Professional,
  User,
} from "@/lib/types";

type ApiOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error ?? "Request failed", response.status);
  }

  return data as T;
}

export const api = {
  login(email: string, password: string) {
    return request<{ token: string; user: User }>("/api/mobile/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },

  me(token: string) {
    return request<{ user: User }>("/api/mobile/auth/me", { token });
  },

  getAccount(token: string) {
    return request<{ user: User }>("/api/account", { token });
  },

  getCategories() {
    return request<{ groups: CategoryGroup[]; categories: Category[] }>("/api/categories");
  },

  search(params: Record<string, string | undefined>) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    return request<{ professionals: Professional[]; total: number }>(
      `/api/mobile/search?${query.toString()}`
    );
  },

  getBookings(token: string) {
    return request<{ bookings: Booking[] }>("/api/bookings", { token });
  },

  getBooking(token: string, id: string) {
    return request<{ booking: Booking }>(`/api/bookings/${id}`, { token });
  },

  createBooking(token: string, body: Record<string, unknown>) {
    return request<{ booking: Booking }>("/api/bookings", {
      method: "POST",
      token,
      body,
    });
  },

  getNotifications(token: string) {
    return request<{ notifications: Notification[]; unreadCount: number }>(
      "/api/notifications",
      { token }
    );
  },
};

export { ApiError };
