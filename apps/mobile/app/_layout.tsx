import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, Text, TextInput } from "react-native";
import "react-native-reanimated";

import Colors from "@/constants/Colors";
import { AuthProvider, useAuth } from "@/lib/auth";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

// Apply Inter as default font across the app
const fontFamily = Platform.select({
  web: "Inter, system-ui, -apple-system, sans-serif",
  default: "Inter_400Regular",
});

if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.style = [{ fontFamily }, Text.defaultProps.style].flat();

if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.style = [{ fontFamily }, TextInput.defaultProps.style].flat();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "login";

    if (!user && !inAuthGroup && (segments[0] === "(tabs)" || segments[0] === "bookings")) {
      router.replace("/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AuthGate>
        <RootLayoutNav />
      </AuthGate>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.light.surface },
        headerTintColor: Colors.light.brand,
        headerTitleStyle: { fontWeight: "700", color: Colors.light.text },
        headerShadowVisible: false,
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: Colors.light.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="category/[slug]" options={{ title: "Services" }} />
      <Stack.Screen name="professional/[id]" options={{ title: "Professional" }} />
      <Stack.Screen name="book/[categorySlug]" options={{ title: "Book Service" }} />
      <Stack.Screen name="booking/[id]" options={{ title: "Booking Details" }} />
    </Stack>
  );
}
