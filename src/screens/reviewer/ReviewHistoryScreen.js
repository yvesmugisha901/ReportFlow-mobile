import React, { useCallback, useState, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getMyReviewHistory } from "../../api/reviews";

const ACTION_META = {
  approve: { label: "Approved", color: "#16A34A", icon: "checkmark-circle" },
  approved: { label: "Approved", color: "#16A34A", icon: "checkmark-circle" },
  reject: { label: "Rejected", color: "#DC2626", icon: "close-circle" },
  rejected: { label: "Rejected", color: "#DC2626", icon: "close-circle" },
  changes: { label: "Changes requested", color: "#D97706", icon: "create-outline" },
  changes_requested: { label: "Changes requested", color: "#D97706", icon: "create-outline" },
};

function getActionMeta(action) {
  return ACTION_META[action] || { label: action || "Reviewed", color: "#6B7280", icon: "ellipse-outline" };
}

// Groups logs into "Today", "This Week", "Earlier" sections for readability.
function groupByRecency(logs) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const groups = { Today: [], "This Week": [], Earlier: [] };
  for (const log of logs) {
    const created = new Date(log.created_at || log.createdAt);
    if (created >= startOfToday) groups.Today.push(log);
    else if (created >= startOfWeek) groups["This Week"].push(log);
    else groups.Earlier.push(log);
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .flatMap(([section, items]) => [
      { type: "header", key: `header-${section}`, title: section },
      ...items.map((item) => ({ type: "item", key: `item-${item.log_id}`, data: item })),
    ]);
}

export default function ReviewHistoryScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await getMyReviewHistory();
      // sort newest first in case the API doesn't guarantee order
      const sorted = [...(data || [])].sort(
        (a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
      );
      setLogs(sorted);
    } catch (err) {
      console.warn("Failed to load review history", err);
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

  const sections = useMemo(() => groupByRecency(logs), [logs]);

  function renderItem({ item }) {
    if (item.type === "header") {
      return <Text style={styles.sectionHeader}>{item.title}</Text>;
    }

    const log = item.data;
    const report = log.report || {};
    const meta = getActionMeta(log.action);
    const reportId = report.report_id ?? log.report_id ?? log.reportId;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => reportId && navigation.navigate("ReviewDetail", { reportId })}
        disabled={!reportId}
        activeOpacity={0.7}
      >
        <View style={styles.cardTop}>
          <View style={[styles.actionPill, { backgroundColor: meta.color + "1A" }]}>
            <Ionicons name={meta.icon} size={13} color={meta.color} />
            <Text style={[styles.actionPillText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <Text style={styles.date}>
            {new Date(log.created_at || log.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.reportTitle} numberOfLines={1}>
          {report.title || log.title || "Report"}
        </Text>
        <Text style={styles.reportMeta} numberOfLines={1}>
          {(report.employee?.full_name || report.submittedBy?.name) ?? "Unknown"}
          {report.department ? ` · ${report.department}` : ""}
          {log.stage ? ` · ${log.stage}` : ""}
        </Text>

        {log.comment ? <Text style={styles.comment} numberOfLines={2}>{log.comment}</Text> : null}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Review History</Text>
        <Text style={styles.headerSubtitle}>
          {loading ? "Loading…" : `${logs.length} decision${logs.length === 1 ? "" : "s"} total`}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#2563EB" />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ padding: 16, paddingTop: 4, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#2563EB" />
          }
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="time-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No reviews yet</Text>
              <Text style={styles.emptySubtitle}>Decisions you make will show up here.</Text>
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
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  actionPillText: { fontSize: 11, fontWeight: "700" },
  date: { fontSize: 11, color: "#9CA3AF" },
  reportTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  reportMeta: { fontSize: 12, color: "#888", marginTop: 2 },
  comment: { fontSize: 12.5, color: "#4B5563", marginTop: 8, fontStyle: "italic" },
  empty: { alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#374151", marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: "#9CA3AF", marginTop: 4 },
});