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
import { getSchedules } from "../../api/schedules";
import ReportCard from "../../components/ReportCard";
import StatCard from "../../components/StatCard";
import { normalizeReport } from "../../utils/reportUtils";

export default function MyReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [reportsData, schedulesData] = await Promise.all([
        getMyReports(),
        getSchedules().catch(() => []), // don't block the screen if schedules fail
      ]);
      setReports(Array.isArray(reportsData) ? reportsData : reportsData?.reports ?? []);
      setSchedules(Array.isArray(schedulesData) ? schedulesData : schedulesData?.schedules ?? []);
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
            onPress={() => navigation.navigate("SubmitReport", {})}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.newButtonText}>Submit New Report</Text>
          </TouchableOpacity>

          {schedules.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Report Schedules</Text>
              {schedules.map((s) => (
                <TouchableOpacity
                  key={s.schedule_id || s.id}
                  style={styles.scheduleRow}
                  onPress={() =>
                    navigation.navigate("SubmitReport", { scheduleId: s.schedule_id || s.id })
                  }
                >
                  <View style={styles.scheduleIcon}>
                    <Ionicons name="calendar-outline" size={16} color="#4f46e5" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scheduleTitle}>{s.title || s.frequency}</Text>
                    <Text style={styles.scheduleMeta}>
                      {s.frequency ? s.frequency.replace(/_/g, " ") : ""}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.sectionTitle, { marginHorizontal: 16, marginTop: 8 }]}>
            Recent Reports
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
  section: { marginTop: 16, marginHorizontal: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 10 },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
    marginBottom: 8,
  },
  scheduleIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: "#eef2ff", alignItems: "center", justifyContent: "center", marginRight: 10 },
  scheduleTitle: { fontSize: 13, fontWeight: "600", color: "#111827" },
  scheduleMeta: { fontSize: 11, color: "#9ca3af", textTransform: "capitalize" },
  empty: { textAlign: "center", color: "#999", marginTop: 40, paddingHorizontal: 16 },
});