import React, { useCallback, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getPendingReviews } from "../../api/reviews";
import ReviewCard from "../../components/ReviewCard";

export default function PendingApprovalsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await getPendingReviews();
      setReports(data);
    } catch (err) {
      console.warn("Failed to load pending reviews", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pending Reviews</Text>
        <Text style={styles.headerSubtitle}>
          {loading
            ? "Loading…"
            : `${reports.length} report${reports.length === 1 ? "" : "s"} awaiting you`}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#2563EB" />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => String(item.report_id ?? item.id)}
          contentContainerStyle={{ padding: 16, paddingTop: 4, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#2563EB" />
          }
          renderItem={({ item }) => (
            <ReviewCard
              report={item}
              onPress={() =>
                navigation.navigate("ReviewDetail", { reportId: item.report_id ?? item.id })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="checkmark-done-circle-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>All caught up</Text>
              <Text style={styles.emptySubtitle}>Nothing is waiting on you right now.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F3",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
  headerSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  empty: { alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#374151", marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: "#9CA3AF", marginTop: 4 },
});