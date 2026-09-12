import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/Colors";
import { radii, shadows, spacing, typography } from "@/constants/theme";
import type { Booking, BookingStatus } from "@/lib/types";

const STATUS_CONFIG: Record<BookingStatus, { color: string; bg: string; label: string }> = {
  REQUESTED: { color: "#b45309", bg: "#fef3c7", label: "Requested" },
  CONFIRMED: { color: "#1d4ed8", bg: "#dbeafe", label: "Confirmed" },
  EN_ROUTE: { color: "#6d28d9", bg: "#ede9fe", label: "En route" },
  IN_PROGRESS: { color: "#0f766e", bg: "#ccfbf1", label: "In progress" },
  COMPLETED: { color: "#15803d", bg: "#dcfce7", label: "Completed" },
  CANCELLED: { color: "#b91c1c", bg: "#fee2e2", label: "Cancelled" },
};

function formatDate(value?: string | null) {
  if (!value) return "Flexible date";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BookingCard({ booking }: { booking: Booking }) {
  const status = STATUS_CONFIG[booking.status] ?? {
    color: Colors.light.muted,
    bg: Colors.light.background,
    label: booking.status,
  };

  return (
    <Link href={`/booking/${booking.id}`} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.topRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {booking.title}
            </Text>
            {booking.category ? (
              <Text style={styles.category}>{booking.category.name}</Text>
            ) : null}
          </View>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📅</Text>
            <Text style={styles.metaText}>{formatDate(booking.scheduledDate)}</Text>
          </View>
          {booking.scheduledTime ? (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🕐</Text>
              <Text style={styles.metaText}>{booking.scheduledTime}</Text>
            </View>
          ) : null}
          {booking.city ? (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.metaText}>{booking.city}</Text>
            </View>
          ) : null}
        </View>

        {booking.professional?.user.name ? (
          <View style={styles.proRow}>
            <View style={styles.proAvatar}>
              <Text style={styles.proInitial}>
                {booking.professional.user.name[0]?.toUpperCase() ?? "P"}
              </Text>
            </View>
            <Text style={styles.proName}>{booking.professional.user.name}</Text>
          </View>
        ) : null}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    ...typography.subtitle,
    fontWeight: "700",
    color: Colors.light.text,
  },
  category: {
    ...typography.caption,
    color: Colors.light.brand,
    fontWeight: "600",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaIcon: {
    fontSize: 12,
  },
  metaText: {
    ...typography.caption,
    color: Colors.light.muted,
  },
  proRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  proAvatar: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: Colors.light.brandMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  proInitial: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.light.brandDark,
  },
  proName: {
    ...typography.caption,
    color: Colors.light.textSecondary,
    fontWeight: "600",
  },
});
