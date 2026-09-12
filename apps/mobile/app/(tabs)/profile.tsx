import { router } from "expo-router";
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
      <View style={styles.center}>
        <Text style={styles.emptyText}>Sign in to manage your profile</Text>
        <Pressable style={styles.button} onPress={() => router.push("/login")}>
          <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.light.brand} />
      </View>
    );
  }

  const profile = account ?? user;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.name}>{profile.name ?? "Customer"}</Text>
        <Text style={styles.detail}>{profile.email}</Text>
        {profile.phone ? <Text style={styles.detail}>{profile.phone}</Text> : null}
        {profile.city ? <Text style={styles.detail}>{profile.city}</Text> : null}
      </View>

      <Text style={styles.sectionTitle}>Recent notifications</Text>
      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications</Text>
      ) : (
        notifications.map((item) => (
          <View key={item.id} style={styles.notification}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationBody}>{item.message}</Text>
          </View>
        ))
      )}

      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
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
    padding: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
  },
  detail: {
    fontSize: 14,
    color: Colors.light.muted,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 10,
  },
  notification: {
    backgroundColor: Colors.light.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  notificationBody: {
    fontSize: 13,
    color: Colors.light.muted,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.muted,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.light.brand,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  signOutButton: {
    marginTop: 24,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  signOutText: {
    color: "#ef4444",
    fontWeight: "700",
  },
});
