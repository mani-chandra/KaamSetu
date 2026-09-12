import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import Colors from "@/constants/Colors";
import { radii, spacing, typography } from "@/constants/theme";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Booking, BookingStatus } from "@/lib/types";

const STATUS_COLORS: Record<BookingStatus, string> = {
  REQUESTED: "#b45309",
  CONFIRMED: "#1d4ed8",
  EN_ROUTE: "#6d28d9",
  IN_PROGRESS: "#0f766e",
  COMPLETED: "#15803d",
  CANCELLED: "#b91c1c",
};

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) {
      setLoading(false);
      return;
    }

    api
      .getBooking(token, id)
      .then((data) => setBooking(data.booking))
      .finally(() => setLoading(false));
  }, [token, id]);

  if (!loading && !booking) {
    return (
      <Screen scroll={false}>
        <EmptyState icon="📋" title="Booking not found" description="This booking may have been removed." />
      </Screen>
    );
  }

  const statusColor = booking ? (STATUS_COLORS[booking.status] ?? Colors.light.muted) : Colors.light.muted;

  return (
    <Screen loading={loading}>
      {booking ? (
        <>
          <View style={styles.hero}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{booking.status.replace("_", " ")}</Text>
            </View>
            <Text style={styles.title}>{booking.title}</Text>
            {booking.category ? <Text style={styles.category}>{booking.category.name}</Text> : null}
          </View>

          {booking.description ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Details</Text>
              <Text style={styles.description}>{booking.description}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Schedule & location</Text>
            {booking.scheduledDate ? (
              <DetailRow
                icon="📅"
                label="Date"
                value={`${new Date(booking.scheduledDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}${booking.scheduledTime ? ` at ${booking.scheduledTime}` : ""}`}
              />
            ) : (
              <DetailRow icon="📅" label="Date" value="Flexible" />
            )}
            {booking.address || booking.city ? (
              <DetailRow
                icon="📍"
                label="Location"
                value={[booking.address, booking.city].filter(Boolean).join(", ")}
              />
            ) : null}
          </View>

          {booking.professional?.user.name ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Professional</Text>
              <DetailRow icon="👤" label="Assigned to" value={booking.professional.user.name} />
            </View>
          ) : null}

          {booking.payment ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Payment</Text>
              <DetailRow icon="💳" label="Status" value={booking.payment.status} />
            </View>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: spacing.lg,
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: spacing.md,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  title: {
    ...typography.hero,
    fontSize: 26,
    color: Colors.light.text,
  },
  category: {
    ...typography.subtitle,
    color: Colors.light.brand,
    marginTop: spacing.xs,
    fontWeight: "600",
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  cardTitle: {
    ...typography.subtitle,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  rowIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    ...typography.caption,
    color: Colors.light.muted,
    marginBottom: 2,
  },
  rowValue: {
    ...typography.body,
    color: Colors.light.text,
    fontWeight: "500",
  },
});
