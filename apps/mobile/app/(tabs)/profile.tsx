import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import Colors from "@/constants/Colors";
import { radii, shadows, spacing, typography } from "@/constants/theme";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Notification, User } from "@/lib/types";

export default function ProfileScreen() {
  const { user, token, signOut } = useAuth();
  const [account, setAccount] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    Promise.all([api.getAccount(token), api.getNotifications(token)])
      .then(([accountData, notificationData]) => {
        setAccount(accountData.user);
        setNotifications(notificationData.notifications.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Screen scroll={false} edges={[]}>
          <EmptyState
            icon="👤"
            title="Your profile"
            description="Sign in to manage your account, view notifications, and update your details."
            actionLabel="Sign in"
            onAction={() => router.push("/login")}
          />
        </Screen>
      </SafeAreaView>
    );
  }

  const profile = account ?? user;
  const initials = (profile.name ?? "C")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Screen loading={loading} contentContainerStyle={styles.content} edges={[]}>
        <ScreenHeader eyebrow="Account" title="Profile" />

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile.name ?? "Customer"}</Text>
            <Text style={styles.email}>{profile.email}</Text>
            {profile.city ? (
              <View style={styles.locationPill}>
                <Text style={styles.locationText}>📍 {profile.city}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{notifications.length}</Text>
            <Text style={styles.statLabel}>Recent alerts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile.phone ? "✓" : "—"}</Text>
            <Text style={styles.statLabel}>Phone verified</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Notifications</Text>
        {notifications.length === 0 ? (
          <View style={styles.emptyNotifications}>
            <Text style={styles.emptyText}>You're all caught up — no new notifications.</Text>
          </View>
        ) : (
          notifications.map((item) => (
            <View key={item.id} style={styles.notification}>
              <View style={styles.notificationDot} />
              <View style={styles.notificationBody}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
              </View>
            </View>
          ))
        )}

        <Button
          label="Sign out"
          variant="danger"
          onPress={handleSignOut}
          style={styles.signOut}
        />
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    backgroundColor: Colors.light.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: Colors.light.brandMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.light.brandDark,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...typography.title,
    fontSize: 20,
    color: Colors.light.text,
  },
  email: {
    ...typography.body,
    color: Colors.light.muted,
  },
  locationPill: {
    alignSelf: "flex-start",
    backgroundColor: Colors.light.brandSoft,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  locationText: {
    ...typography.caption,
    color: Colors.light.brandDark,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.light.brand,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: Colors.light.muted,
    textAlign: "center",
  },
  sectionTitle: {
    ...typography.subtitle,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: spacing.md,
  },
  notification: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.brand,
    marginTop: 6,
  },
  notificationBody: {
    flex: 1,
  },
  notificationTitle: {
    ...typography.subtitle,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 2,
  },
  notificationMessage: {
    ...typography.caption,
    color: Colors.light.muted,
    lineHeight: 18,
  },
  emptyNotifications: {
    backgroundColor: Colors.light.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  emptyText: {
    ...typography.body,
    color: Colors.light.muted,
    textAlign: "center",
  },
  signOut: {
    marginTop: spacing.xl,
  },
});
