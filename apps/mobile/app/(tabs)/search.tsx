import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfessionalCard } from "@/components/ProfessionalCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import Colors from "@/constants/Colors";
import { radii, spacing, typography } from "@/constants/theme";
import { api } from "@/lib/api";
import type { Professional } from "@/lib/types";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.search({ q: query || undefined, city: city || undefined });
        setProfessionals(data.professionals);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, city]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Screen
        loading={loading && !searched}
        contentContainerStyle={styles.content}
        edges={[]}
      >
        <ScreenHeader
          eyebrow="Discover"
          title="Find professionals"
          subtitle="Search by service, name, or city"
        />

        <View style={styles.filters}>
          <Input
            placeholder="Plumber, electrician, painter…"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
          <Input
            placeholder="City (e.g. Mumbai)"
            value={city}
            onChangeText={setCity}
          />
        </View>

        {!loading && searched ? (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {professionals.length} professional{professionals.length !== 1 ? "s" : ""} found
            </Text>
          </View>
        ) : null}

        {loading && searched ? (
          <Text style={styles.loadingText}>Searching…</Text>
        ) : null}

        {!loading && searched && professionals.length === 0 ? (
          <EmptyState
            icon="🔎"
            title="No matches yet"
            description="Try a different service name or city to find available professionals near you."
          />
        ) : (
          professionals.map((pro) => <ProfessionalCard key={pro.id} professional={pro} />)
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
  filters: {
    marginBottom: spacing.lg,
  },
  searchInput: {
    backgroundColor: Colors.light.surface,
  },
  resultsHeader: {
    marginBottom: spacing.md,
  },
  resultsCount: {
    ...typography.caption,
    color: Colors.light.muted,
    fontWeight: "600",
  },
  loadingText: {
    ...typography.body,
    color: Colors.light.muted,
    textAlign: "center",
    marginVertical: spacing.xl,
  },
});
