import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Colors from "@/constants/Colors";
import { radii, shadows, spacing, typography } from "@/constants/theme";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.heroContent}>
            <View style={styles.logoMark}>
              <Text style={styles.logoLetter}>K</Text>
            </View>
            <Text style={styles.logo}>KaamSetu</Text>
            <Text style={styles.tagline}>Trusted pros, on demand</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.formArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>Sign in to book and track your services</Text>

            <Input
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={error ?? undefined}
            />

            <View style={styles.demoPill}>
              <Text style={styles.demoLabel}>Demo account</Text>
              <Text style={styles.demoText}>customer@demo.com · customer123</Text>
            </View>

            <Button label="Sign in" onPress={handleLogin} loading={loading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  hero: {
    paddingBottom: spacing.xxxl,
  },
  heroContent: {
    alignItems: "center",
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  logoLetter: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
  logo: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  tagline: {
    ...typography.subtitle,
    color: "rgba(255,255,255,0.9)",
    marginTop: spacing.sm,
  },
  formArea: {
    flex: 1,
    marginTop: -spacing.xxxl,
  },
  formScroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  cardTitle: {
    ...typography.title,
    color: Colors.light.text,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.body,
    color: Colors.light.muted,
    marginBottom: spacing.xl,
  },
  demoPill: {
    backgroundColor: Colors.light.brandSoft,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.brandMuted,
  },
  demoLabel: {
    ...typography.label,
    color: Colors.light.brandDark,
    marginBottom: 2,
  },
  demoText: {
    ...typography.caption,
    color: Colors.light.textSecondary,
  },
});
