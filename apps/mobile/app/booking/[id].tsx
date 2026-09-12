import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/Colors";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Booking } from "@/lib/types";

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.light.brand} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Booking not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{booking.title}</Text>
      <Text style={styles.status}>{booking.status}</Text>

      {booking.category ? (
        <Text style={styles.detail}>Category: {booking.category.name}</Text>
      ) : null}
      {booking.description ? (
        <Text style={styles.detail}>{booking.description}</Text>
      ) : null}
      {booking.scheduledDate ? (
        <Text style={styles.detail}>
          Scheduled: {new Date(booking.scheduledDate).toLocaleString("en-IN")}
          {booking.scheduledTime ? ` at ${booking.scheduledTime}` : ""}
        </Text>
      ) : null}
      {booking.address ? (
        <Text style={styles.detail}>
          {booking.address}
          {booking.city ? `, ${booking.city}` : ""}
        </Text>
      ) : null}
      {booking.professional?.user.name ? (
        <Text style={styles.detail}>Professional: {booking.professional.user.name}</Text>
      ) : null}
      {booking.payment ? (
        <Text style={styles.detail}>Payment: {booking.payment.status}</Text>
      ) : null}
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
  },
  empty: {
    color: Colors.light.muted,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.light.text,
  },
  status: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.brand,
    marginTop: 6,
    marginBottom: 16,
  },
  detail: {
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 10,
    lineHeight: 22,
  },
});
