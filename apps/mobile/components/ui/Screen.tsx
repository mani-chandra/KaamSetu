import { ReactNode } from "react";
import {
  ActivityIndicator,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/Colors";
import { spacing } from "@/constants/theme";

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  loading?: boolean;
  contentStyle?: ViewStyle;
  edges?: ("top" | "bottom" | "left" | "right")[];
} & Pick<ScrollViewProps, "refreshControl" | "contentContainerStyle">;

export function Screen({
  children,
  scroll = true,
  loading = false,
  contentStyle,
  edges = ["bottom"],
  refreshControl,
  contentContainerStyle,
}: ScreenProps) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.brand} />
      </View>
    );
  }

  if (scroll) {
    return (
      <SafeAreaView style={styles.safe} edges={edges}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, contentContainerStyle, contentStyle]}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, styles.flex, contentStyle]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

export function ScreenCenter({ children }: { children: ReactNode }) {
  return <View style={styles.center}>{children}</View>;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    padding: spacing.xxl,
  },
});
