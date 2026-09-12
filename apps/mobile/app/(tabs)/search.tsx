import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ProfessionalCard } from "@/components/ProfessionalCard";
import Colors from "@/constants/Colors";
import { api } from "@/lib/api";
import type { Professional } from "@/lib/types";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.search({ q: query || undefined, city: city || undefined });
        setProfessionals(data.professionals);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, city]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Find professionals</Text>
      <TextInput
        style={styles.input}
        placeholder="Search by name or service"
        value={query}
        onChangeText={setQuery}
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        value={city}
        onChangeText={setCity}
      />

      {loading ? (
        <ActivityIndicator color={Colors.light.brand} style={{ marginTop: 24 }} />
      ) : (
        <>
          <Text style={styles.count}>{professionals.length} results</Text>
          {professionals.map((pro) => (
            <ProfessionalCard key={pro.id} professional={pro} />
          ))}
        </>
      )}
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
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  count: {
    fontSize: 13,
    color: Colors.light.muted,
    marginVertical: 12,
  },
});
