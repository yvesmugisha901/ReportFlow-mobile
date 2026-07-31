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
import { getMySchedules } from "../../api/schedules";
import ReportCard from "../../components/ReportCard";
import StatCard from "../../components/StatCard";
import { normalizeReport } from "../../utils/reportUtils";

const PREVIEW_LIMIT = 5;
const UPCOMING_WINDOW_DAYS = 7;

function daysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const deadline = new Date(dateString);
  const diffMs = deadline - startOfToday;
  return Math.round(diffMs / 86400000);
}

function formatDueLabel(days) {
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days > 1) return `Due in ${days} days`;
  if (days === -1) return "Overdue by 1 day";
  return `Overdue by ${Math.abs(days)} days`;
}

export default function MyReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [reportsData, schedulesData] = await Promise.all([
        getMyReports(),
        getMySchedules().catch((err) => {
          console.warn("Failed to load schedules", err);
          return [];
        }),
      ]);
      setReports(Array.isArray(reportsData) ? reportsData : reportsData?.reports ?? []);
      setSchedules(schedulesData || []);
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

  const preview = normalized.slice(0, PREVIEW_LIMIT);
  const hasMore = normalized.length > PREVIEW_LIMIT;

  // Upcoming = schedules whose deadline falls within the next N days (or is
  // already overdue). Sorted soonest/most-overdue first.
  const upcoming = schedules
    .map((s) => ({ ...s, _daysUntil: daysUntil(s.deadline) }))
    .filter((s) => s._daysUntil !== null && s._daysUntil <= UPCOMING_WINDOW_DAYS)
    .sort((a, b) => a._daysUntil - b._daysUntil);

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
      data={preview}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <>
          <View style={styles.statsGrid}>
            <StatCard label="Total" value={String(counts.total)} icon="document-text-outline" color="indigo" />
            <StatCard label="Pending" value={String(counts.pending)} icon="time-outline" color="amber" />
            <StatCard label="Approved" value={String(counts.approved)} icon="checkmark-circle-outline" color="emerald" />
            <StatCard label="Needs Action" value={String(counts.rejected)} icon="alert-circle-outline" color="rose" />
          </View>

          {upcoming.length > 0 && (
            <View style={styles.upcomingSection}>
              <Text style={styles.upcomingHeading}>Upcoming</Text>
              <View style={styles.upcomingStack}>
                {upcoming.map((s) => {
                  const overdue = s._daysUntil < 0;
                  return (
                    <TouchableOpacity
                      key={s.schedule_id}
                      style={[styles.upcomingCard, overdue && styles.upcomingCardOverdue]}
                      onPress={() => navigation.navigate("SelectSchedule")}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={overdue ? "alert-circle" : "calendar-outline"}
                        size={16}
                        color={overdue ? "#DC2626" : "#D97706"}
                      />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.upcomingTitle} numberOfLines={1}>{s.title}</Text>
                        <Text style={[styles.upcomingDue, overdue && styles.upcomingDueOverdue]}>
                          {formatDueLabel(s._daysUntil)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.newButton}
            onPress={() => navigation.navigate("SelectSchedule")}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.newButtonText}>Submit New Report</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>My Reports</Text>
            {hasMore && (
              <TouchableOpacity onPress={() => navigation.navigate("AllReports")}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
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
      ListFooterComponent={
        hasMore ? (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate("AllReports")}
          >
            <Text style={styles.viewAllButtonText}>View All Reports</Text>
            <Ionicons name="arrow-forward" size={16} color="#2563eb" />
          </TouchableOpacity>
        ) : null
      }
      ListEmptyComponent={
        <Text style={styles.empty}>No reports yet — submit your first one above.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  upcomingSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  upcomingHeading: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  upcomingStack: {
    gap: 8,
  },
  upcomingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  upcomingCardOverdue: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  upcomingTitle: { fontSize: 13, fontWeight: "600", color: "#111827" },
  upcomingDue: { fontSize: 11.5, color: "#B45309", marginTop: 1, fontWeight: "600" },
  upcomingDueOverdue: { color: "#DC2626" },
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
    marginTop: 16,
  },
  newButtonText: { color: "#fff", fontWeight: "700" },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  viewAllText: { fontSize: 13, fontWeight: "700", color: "#2563eb" },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 4,
  },
  viewAllButtonText: { color: "#2563eb", fontWeight: "700", fontSize: 13.5 },
  empty: { textAlign: "center", color: "#999", marginTop: 40, paddingHorizontal: 16 },
});