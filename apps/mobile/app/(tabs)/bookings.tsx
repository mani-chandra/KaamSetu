import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BookingCard } from "@/components/BookingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import Colors from "@/constants/Colors";
import { spacing } from "@/constants/theme";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Booking } from "@/lib/types";

export default function BookingsScreen() {
  const { token, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = useCallback(async () => {
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const data = await api.getBookings(token);
      setBookings(data.bookings);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    loadBookings();
  }, [loadBookings]);

  if (!user) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Screen scroll={false} edges={[]}>
          <EmptyState
            icon="📅"
            title="Your bookings live here"
            description="Sign in to view upcoming services, track progress, and manage appointments."
            actionLabel="Sign in"
            onAction={() => router.push("/login")}
          />
        </Screen>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Screen
        loading={loading}
        contentContainerStyle={styles.content}
        edges={[]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadBookings();
            }}
            tintColor={Colors.light.brand}
          />
        }
      >
        <ScreenHeader
          eyebrow="Activity"
          title="My bookings"
          subtitle="Track and manage your service requests"
        />

        {bookings.length === 0 ? (
          <EmptyState
            icon="✨"
            title="No bookings yet"
            description="Browse services on Home and book a verified professional in minutes."
            actionLabel="Browse services"
            onAction={() => router.push("/(tabs)")}
          />
        ) : (
          bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
        )}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: 120,
  },
});
