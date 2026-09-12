import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BookingCard } from "@/components/BookingCard";
import Colors from "@/constants/Colors";
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
      <View style={styles.center}>
        <Text style={styles.emptyText}>Sign in to view your bookings</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.light.brand} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadBookings();
          }}
        />
      }
    >
      <Text style={styles.heading}>My bookings</Text>
      {bookings.length === 0 ? (
        <Text style={styles.emptyText}>No bookings yet</Text>
      ) : (
        bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    padding: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.light.muted,
    textAlign: "center",
  },
});
