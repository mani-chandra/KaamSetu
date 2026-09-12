import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/Colors";
import { api } from "@/lib/api";
import type { CategoryGroup } from "@/lib/types";

export default function HomeScreen() {
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getCategories()
      .then((data) => setGroups(data.groups))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.light.brand} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>What do you need help with?</Text>
      <Text style={styles.subheading}>Browse services by category</Text>

      {groups.map((group) => (
        <View key={group.id} style={styles.group}>
          <Text style={styles.groupTitle}>{group.name}</Text>
          <View style={styles.grid}>
            {group.categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`} asChild>
                <Pressable style={styles.categoryCard}>
                  <Text style={styles.categoryIcon}>{category.icon ?? "🔧"}</Text>
                  <Text style={styles.categoryName} numberOfLines={2}>
                    {category.name}
                  </Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
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
  subheading: {
    fontSize: 14,
    color: Colors.light.muted,
    marginTop: 4,
    marginBottom: 20,
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryCard: {
    width: "31%",
    minWidth: 100,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    color: Colors.light.text,
  },
});
