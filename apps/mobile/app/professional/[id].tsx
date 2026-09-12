import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/Colors";
import { api } from "@/lib/api";
import type { Professional } from "@/lib/types";

export default function ProfessionalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    api
      .search({})
      .then((data) => {
        const match = data.professionals.find((item) => item.id === id) ?? null;
        setProfessional(match);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.light.brand} />
      </View>
    );
  }

  if (!professional) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Professional not found</Text>
      </View>
    );
  }

  const categorySlug = professional.services[0]?.category?.slug ?? "general";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {professional.user.image ? (
          <Image source={{ uri: professional.user.image }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>{professional.user.name?.[0] ?? "P"}</Text>
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.name}>{professional.user.name}</Text>
          <Text style={styles.rating}>
            ★ {professional.avgRating.toFixed(1)} · {professional.reviewCount} reviews
          </Text>
          {professional.user.city ? (
            <Text style={styles.city}>{professional.user.city}</Text>
          ) : null}
        </View>
      </View>

      {professional.bio ? <Text style={styles.bio}>{professional.bio}</Text> : null}

      <View style={styles.stats}>
        <Text style={styles.stat}>{professional.experienceYears} years experience</Text>
        <Text style={styles.stat}>{professional.completedJobs} jobs completed</Text>
      </View>

      <Link
        href={{
          pathname: "/book/[categorySlug]",
          params: { categorySlug, proId: professional.id },
        }}
        asChild
      >
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Book this professional</Text>
        </Pressable>
      </Link>
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
  header: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ccfbf1",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.light.brand,
  },
  headerText: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.light.text,
  },
  rating: {
    fontSize: 14,
    color: Colors.light.muted,
    marginTop: 4,
  },
  city: {
    fontSize: 14,
    color: Colors.light.muted,
    marginTop: 2,
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.light.text,
    marginBottom: 16,
  },
  stats: {
    gap: 6,
    marginBottom: 20,
  },
  stat: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  button: {
    backgroundColor: Colors.light.brand,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
