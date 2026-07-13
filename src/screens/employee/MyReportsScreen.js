import React, { useCallback, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getMyReports } from "../../api/reports";
import ReportCard from "../../components/ReportCard";
import StatCard from "../../components/StatCard";
import { normalizeReport } from "../../utils/reportUtils";

export default function MyReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const reportsData = await getMyReports();
      setReports(Array.isArray(reportsData) ? reportsData : reportsData?.reports ?? []);
    } catch (err) {
      console.warn("Failed to load reports", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  function onRefresh() {
    setRefreshing(true);
    loadAll();
  }

  const normalized = reports.map(normalizeReport);
  const counts = {
    total: normalized.length,
    pending: normalized.filter((r) => r.status === "Pending" || r.status === "Under Review").length,
    approved: normalized.filter((r) => r.status === "Approved").length,
    rejected: normalized.filter((r) => r.status === "Rejected" || r.status === "Changes Requested").length,
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      data={normalized}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <>
          <View style={styles.statsGrid}>
            <StatCard label="Total" value={String(counts.total)} icon="document-text-outline" color="indigo" />
            <StatCard label="Pending" value={String(counts.pending)} icon="time-outline" color="amber" />
            <StatCard label="Approved" value={String(counts.approved)} icon="checkmark-circle-outline" color="emerald" />
            <StatCard label="Needs Action" value={String(counts.rejected)} icon="alert-circle-outline" color="rose" />
          </View>

          <TouchableOpacity
            style={styles.newButton}
            onPress={() => navigation.navigate("SelectSchedule")}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.newButtonText}>Submit New Report</Text>
          </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginHorizontal: 16, marginTop: 8 }]}>
  My Reports
</Text>
        </>
      }
      contentContainerStyle={{ paddingBottom: 24 }}
      renderItem={({ item }) => (
        <View style={{ paddingHorizontal: 16 }}>
          <ReportCard
            report={item}
            onPress={() => navigation.navigate("ReportDetail", { reportId: item.id })}
          />
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>No reports yet — submit your first one above.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16 },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  newButtonText: { color: "#fff", fontWeight: "700" },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 10 },
  empty: { textAlign: "center", color: "#999", marginTop: 40, paddingHorizontal: 16 },
});