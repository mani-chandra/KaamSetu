import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/Colors";
import type { Booking, BookingStatus } from "@/lib/types";

const STATUS_COLORS: Record<BookingStatus, string> = {
  REQUESTED: "#f59e0b",
  CONFIRMED: "#3b82f6",
  EN_ROUTE: "#8b5cf6",
  IN_PROGRESS: "#0d9488",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
};

function formatDate(value?: string | null) {
  if (!value) return "Flexible";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BookingCard({ booking }: { booking: Booking }) {
  const statusColor = STATUS_COLORS[booking.status] ?? Colors.light.muted;

  return (
    <Link href={`/booking/${booking.id}`} asChild>
      <Pressable style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {booking.title}
          </Text>
          <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{booking.status}</Text>
          </View>
        </View>

        {booking.category ? (
          <Text style={styles.category}>{booking.category.name}</Text>
        ) : null}

        <View style={styles.meta}>
          <Text style={styles.metaText}>{formatDate(booking.scheduledDate)}</Text>
          {booking.scheduledTime ? (
            <Text style={styles.metaText}>{booking.scheduledTime}</Text>
          ) : null}
          {booking.city ? <Text style={styles.metaText}>{booking.city}</Text> : null}
        </View>

        {booking.professional?.user.name ? (
          <Text style={styles.proName}>Pro: {booking.professional.user.name}</Text>
        ) : null}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  category: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.light.brand,
    fontWeight: "500",
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 10,
  },
  metaText: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  proName: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.light.text,
  },
});
