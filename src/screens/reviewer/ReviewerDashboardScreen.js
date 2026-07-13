import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getPendingReviews, getMyReviewHistory } from "../../api/reviews";
import { timeAgo } from "../../utils/timeAgo";

const ACTION_META = {
  approved: { label: "Approved", color: "#16A34A", icon: "checkmark-circle" },
  changes_requested: { label: "Changes requested", color: "#D97706", icon: "create-outline" },
  rejected: { label: "Rejected", color: "#DC2626", icon: "close-circle" },
};

function isThisMonth(dateString) {
  if (!dateString) return false;
  const d = new Date(dateString);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function ReviewerDashboardScreen({ navigation }) {
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [pendingData, historyData] = await Promise.all([
        getPendingReviews(),
        getMyReviewHistory(),
      ]);
      setPending(pendingData || []);
      setHistory(historyData || []);
    } catch (err) {
      console.warn("Failed to load reviewer dashboard", err);
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

  const stats = useMemo(() => {
    const monthLogs = history.filter((h) => isThisMonth(h.created_at));
    const approvedCount = monthLogs.filter((h) => h.action === "approved").length;
    const changesCount = monthLogs.filter((h) => h.action === "changes_requested").length;
    const rejectedCount = monthLogs.filter((h) => h.action === "rejected").length;

    // Average turnaround: time between report submission and this reviewer's decision
    const turnarounds = monthLogs
      .map((h) => {
        const submitted = h.report?.submitted_at;
        if (!submitted || !h.created_at) return null;
        return new Date(h.created_at) - new Date(submitted);
      })
      .filter((v) => v !== null && v >= 0);
    const avgMs = turnarounds.length
      ? turnarounds.reduce((a, b) => a + b, 0) / turnarounds.length
      : null;
    const avgHours = avgMs !== null ? Math.round(avgMs / 3600000) : null;

    return {
      pendingCount: pending.length,
      reviewedThisMonth: monthLogs.length,
      approvedCount,
      changesCount,
      rejectedCount,
      avgHours,
    };
  }, [pending, history]);

  const recent = history.slice(0, 5);

  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} color="#2563EB" />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#2563EB" />
      }
    >
      <Text style={styles.headerTitle}>Dashboard</Text>
      <Text style={styles.headerSubtitle}>Your review activity at a glance</Text>

      {/* Top stat cards */}
      <View style={styles.statsRow}>
        <StatCard
          value={stats.pendingCount}
          label="Awaiting you"
          color="#2563EB"
          bg="#EFF6FF"
          onPress={() => navigation.navigate("PendingApprovals")}
        />
        <StatCard
          value={stats.reviewedThisMonth}
          label="Reviewed this month"
          color="#059669"
          bg="#ECFDF5"
        />
      </View>

      {stats.avgHours !== null && (
        <View style={styles.turnaroundCard}>
          <Ionicons name="time-outline" size={18} color="#6B7280" />
          <Text style={styles.turnaroundText}>
            Average turnaround this month:{" "}
            <Text style={styles.turnaroundValue}>
              {stats.avgHours < 1 ? "< 1h" : `${stats.avgHours}h`}
            </Text>
          </Text>
        </View>
      )}

      {/* Decision breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Month's Decisions</Text>
        <View style={styles.breakdownRow}>
          <BreakdownPill {...ACTION_META.approved} count={stats.approvedCount} />
          <BreakdownPill {...ACTION_META.changes_requested} count={stats.changesCount} />
          <BreakdownPill {...ACTION_META.rejected} count={stats.rejectedCount} />
        </View>
      </View>

      {/* Recent activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recent.length === 0 ? (
          <Text style={styles.emptyText}>No review activity yet.</Text>
        ) : (
          recent.map((log) => {
            const meta = ACTION_META[log.action] || {
              label: log.action,
              color: "#6B7280",
              icon: "ellipse-outline",
            };
            return (
              <View key={log.log_id} style={styles.activityRow}>
                <Ionicons name={meta.icon} size={18} color={meta.color} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTitle} numberOfLines={1}>
                    {log.report?.title || "Report"}
                  </Text>
                  <Text style={[styles.activityAction, { color: meta.color }]}>{meta.label}</Text>
                </View>
                <Text style={styles.activityTime}>{timeAgo(log.created_at)}</Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({ value, label, color, bg, onPress }) {
  const Wrapper = onPress ? require("react-native").TouchableOpacity : View;
  return (
    <Wrapper style={[styles.statCard, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Wrapper>
  );
}

function BreakdownPill({ label, color, icon, count }) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={styles.pillCount}>{count}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#111827" },
  headerSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 4, marginBottom: 16 },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, borderRadius: 14, padding: 16 },
  statValue: { fontSize: 28, fontWeight: "800" },
  statLabel: { fontSize: 12.5, color: "#6B7280", marginTop: 4, fontWeight: "600" },
  turnaroundCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  turnaroundText: { fontSize: 13, color: "#374151", marginLeft: 6 },
  turnaroundValue: { fontWeight: "700", color: "#111827" },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 12,
  },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  pill: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 12,
  },
  pillCount: { fontSize: 18, fontWeight: "800", color: "#111827", marginTop: 4 },
  pillLabel: { fontSize: 10.5, color: "#6B7280", marginTop: 2, textAlign: "center" },
  emptyText: { fontSize: 13, color: "#9CA3AF", textAlign: "center", paddingVertical: 12 },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  activityTitle: { fontSize: 13.5, fontWeight: "600", color: "#111827" },
  activityAction: { fontSize: 12, fontWeight: "600", marginTop: 1, textTransform: "capitalize" },
  activityTime: { fontSize: 11, color: "#9CA3AF", marginLeft: 8 },
});