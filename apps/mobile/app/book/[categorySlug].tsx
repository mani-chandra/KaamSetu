import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Colors from "@/constants/Colors";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Category } from "@/lib/types";

export default function BookScreen() {
  const { categorySlug, proId } = useLocalSearchParams<{
    categorySlug: string;
    proId?: string;
  }>();
  const { token, user } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState(user?.city ?? "");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!categorySlug) return;

    api
      .getCategories()
      .then((data) => {
        const match = data.categories.find((item) => item.slug === categorySlug);
        setCategory(match ?? null);
        if (match) {
          setTitle(`${match.name} service`);
        }
      })
      .finally(() => setLoading(false));
  }, [categorySlug]);

  async function handleSubmit() {
    if (!token) {
      router.push("/login");
      return;
    }
    if (!category) {
      Alert.alert("Error", "Category not found");
      return;
    }

    setSubmitting(true);
    try {
      const { booking } = await api.createBooking(token, {
        categoryId: category.id,
        categorySlug: category.slug,
        professionalId: proId,
        title,
        description,
        address,
        city,
        scheduledDate: scheduledDate || undefined,
        scheduledTime: scheduledTime || undefined,
      });
      router.replace(`/booking/${booking.id}`);
    } catch (error) {
      Alert.alert("Booking failed", error instanceof ApiError ? error.message : "Try again");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.light.brand} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Book {category?.name ?? categorySlug}</Text>

      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe what you need"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={scheduledDate}
        onChangeText={setScheduledDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Preferred time"
        value={scheduledTime}
        onChangeText={setScheduledTime}
      />

      <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit booking</Text>
        )}
      </Pressable>
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
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: 16,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: Colors.light.brand,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
