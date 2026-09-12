import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import Colors from "@/constants/Colors";
import { radii, spacing } from "@/constants/theme";
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

  return (
    <Screen loading={loading}>
      <ScreenHeader
        eyebrow="New booking"
        title={`Book ${category?.name ?? categorySlug}`}
        subtitle="Tell us what you need and we'll match you with the right pro"
      />

      <View style={styles.form}>
        <Input label="Title" placeholder="Brief title for your request" value={title} onChangeText={setTitle} />
        <Input
          label="Description"
          placeholder="Describe the work needed, any specifics…"
          value={description}
          onChangeText={setDescription}
          multiline
          style={styles.textArea}
        />
        <Input label="Address" placeholder="Street address" value={address} onChangeText={setAddress} />
        <Input label="City" placeholder="Your city" value={city} onChangeText={setCity} />
        <Input
          label="Preferred date"
          placeholder="YYYY-MM-DD"
          value={scheduledDate}
          onChangeText={setScheduledDate}
        />
        <Input
          label="Preferred time"
          placeholder="e.g. 10:00 AM"
          value={scheduledTime}
          onChangeText={setScheduledTime}
        />
      </View>

      <Button label="Submit booking request" onPress={handleSubmit} loading={submitting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: Colors.light.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
});
