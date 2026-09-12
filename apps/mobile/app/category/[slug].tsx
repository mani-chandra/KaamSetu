import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ProfessionalCard } from "@/components/ProfessionalCard";
import Colors from "@/constants/Colors";
import { api } from "@/lib/api";
import type { Category, Professional } from "@/lib/types";

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    Promise.all([
      api.getCategories(),
      api.search({ category: slug }),
    ])
      .then(([categoryData, searchData]) => {
        const match = categoryData.categories.find((item) => item.slug === slug);
        setCategory(match ?? null);
        setProfessionals(searchData.professionals);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.light.brand} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{category?.name ?? slug}</Text>
      {category?.description ? (
        <Text style={styles.description}>{category.description}</Text>
      ) : null}

      <Text style={styles.count}>{professionals.length} professionals</Text>
      {professionals.map((pro) => (
        <ProfessionalCard key={pro.id} professional={pro} categorySlug={slug} />
      ))}
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
    fontSize: 24,
    fontWeight: "800",
    color: Colors.light.text,
  },
  description: {
    fontSize: 14,
    color: Colors.light.muted,
    marginTop: 6,
    marginBottom: 12,
  },
  count: {
    fontSize: 13,
    color: Colors.light.muted,
    marginBottom: 12,
  },
});
