import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ProfessionalCard } from "@/components/ProfessionalCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import Colors from "@/constants/Colors";
import { radii, spacing, typography } from "@/constants/theme";
import { api } from "@/lib/api";
import type { Category, Professional } from "@/lib/types";

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    Promise.all([api.getCategories(), api.search({ category: slug })])
      .then(([categoryData, searchData]) => {
        const match = categoryData.categories.find((item) => item.slug === slug);
        setCategory(match ?? null);
        setProfessionals(searchData.professionals);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <Screen loading={loading}>
      <ScreenHeader
        eyebrow="Category"
        title={category?.name ?? slug ?? "Services"}
        subtitle={category?.description ?? `${professionals.length} professionals available`}
        large
      />

      {category?.description ? (
        <View style={styles.descriptionCard}>
          <Text style={styles.description}>{category.description}</Text>
        </View>
      ) : null}

      {professionals.length === 0 ? (
        <EmptyState
          icon="🛠️"
          title="No pros listed yet"
          description="Check back soon or try searching in another category."
        />
      ) : (
        professionals.map((pro) => (
          <ProfessionalCard key={pro.id} professional={pro} categorySlug={slug} />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  descriptionCard: {
    backgroundColor: Colors.light.brandSoft,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.brandMuted,
  },
  description: {
    ...typography.body,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
});
