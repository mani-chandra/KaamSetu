import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/Colors";
import type { Professional } from "@/lib/types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProfessionalCard({
  professional,
  categorySlug,
}: {
  professional: Professional;
  categorySlug?: string;
}) {
  const service = professional.services[0];
  const priceLabel = service?.price
    ? formatCurrency(service.price)
    : service?.minPrice
      ? `From ${formatCurrency(service.minPrice)}`
      : "Get quote";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {professional.user.image ? (
          <Image source={{ uri: professional.user.image }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>{professional.user.name?.[0] ?? "P"}</Text>
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.name}>{professional.user.name ?? "Professional"}</Text>
          <Text style={styles.rating}>
            ★ {professional.avgRating.toFixed(1)} ({professional.reviewCount})
          </Text>
          {professional.bio ? (
            <Text style={styles.bio} numberOfLines={2}>
              {professional.bio}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.meta}>
        <Text style={styles.metaText}>{professional.experienceYears} yrs exp</Text>
        <Text style={styles.metaText}>{professional.completedJobs} jobs</Text>
        {professional.user.city ? (
          <Text style={styles.metaText}>{professional.user.city}</Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>{priceLabel}</Text>
        <View style={styles.actions}>
          <Link href={`/professional/${professional.id}`} asChild>
            <Pressable style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>Profile</Text>
            </Pressable>
          </Link>
          <Link
            href={{
              pathname: "/book/[categorySlug]",
              params: {
                categorySlug: categorySlug ?? service?.category?.slug ?? "general",
                proId: professional.id,
              },
            }}
            asChild
          >
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Book</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ccfbf1",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.brand,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  rating: {
    fontSize: 13,
    color: Colors.light.muted,
    marginTop: 2,
  },
  bio: {
    fontSize: 13,
    color: Colors.light.muted,
    marginTop: 4,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  metaText: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.brand,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  outlineButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  outlineButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.text,
  },
  primaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.brand,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
});
