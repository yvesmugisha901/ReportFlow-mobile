import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getAdminDashboardStats, getPendingUsers } from "../../api/admin";
import StatCard from "../../components/StatCard";
import ReportCard from "../../components/ReportCard";
import ComplianceList from "../../components/ComplianceList";
import ApproveUserModal from "./ApproveUserModal";
import { normalizeReport, timeAgo, initials } from "../../utils/reportUtils";

const QUICK_ACTIONS = [
  { key: "RegisterEmployee", label: "Register", icon: "person-add-outline", color: "#4F46E5", bg: "#EEF2FF" },
  { key: "Users", label: "Users", icon: "people-outline", color: "#059669", bg: "#ECFDF5" },
  { key: "Departments", label: "Departments", icon: "business-outline", color: "#2563EB", bg: "#EFF6FF" },
];

export default function DashboardScreen({ navigation }) {
  const [dashData, setDashData] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      const [stats, pending] = await Promise.all([
        getAdminDashboardStats(),
        getPendingUsers(),
      ]);
      setDashData(stats);
      setPendingUsers(pending.users ?? []);
      setError(null);
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setPendingLoading(false);
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

  function handleApproved(userId) {
    setPendingUsers((prev) => prev.filter((u) => u.user_id !== userId));
    getAdminDashboardStats().then(setDashData).catch(() => {});
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadAll}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stats = [
    { label: "Total Reports", value: String(dashData?.totalReports ?? 0), icon: "document-text-outline", trend: `${dashData?.reportsThisMonth ?? 0} this month`, color: "indigo" },
    { label: "Pending Review", value: String(dashData?.pendingReports ?? 0), icon: "time-outline", trend: `${dashData?.overdueReports ?? 0} overdue`, color: "amber" },
    { label: "Approved", value: String(dashData?.approvedReports ?? 0), icon: "checkmark-circle-outline", trend: `${dashData?.approvedThisWeek ?? 0} this week`, color: "emerald" },
    { label: "Departments", value: String(dashData?.totalDepartments ?? 0), icon: "business-outline", trend: "All active", color: "sky" },
    { label: "Employees", value: String(dashData?.totalEmployees ?? 0), icon: "people-outline", trend: `${dashData?.newEmployeesThisMonth ?? 0} new`, color: "violet" },
    { label: "Compliance", value: dashData?.complianceRate != null ? `${Math.round(dashData.complianceRate)}%` : "—", icon: "trending-up-outline", trend: dashData?.complianceRateDelta != null ? `${dashData.complianceRateDelta > 0 ? "+" : ""}${dashData.complianceRateDelta}% vs last mo.` : "—", color: "rose" },
  ];

  const recentReports = (dashData?.recentReports ?? []).map(normalizeReport);
  const deptCompliance = (dashData?.departmentBreakdown ?? []).map((d, i) => ({
    name: d.name ?? d.dept_name ?? `Dept ${i + 1}`,
    submitted: d.submittedCount ?? d.submitted ?? 0,
    total: d.totalCount ?? d.total ?? 0,
  }));

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.heading}>Admin Dashboard</Text>

      <View style={styles.quickActionsRow}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.key}
            style={[styles.quickAction, { backgroundColor: action.bg }]}
            onPress={() => navigation.navigate(action.key)}
            activeOpacity={0.7}
          >
            <Ionicons name={action.icon} size={20} color={action.color} />
            <Text style={[styles.quickActionText, { color: action.color }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.grid}>
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Approvals</Text>
          {pendingUsers.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingUsers.length}</Text>
            </View>
          )}
        </View>

        {pendingLoading ? (
          <ActivityIndicator style={{ marginVertical: 16 }} />
        ) : pendingUsers.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="checkmark-circle-outline" size={22} color="#059669" />
            <Text style={styles.emptyText}>No pending approvals — all caught up!</Text>
          </View>
        ) : (
          pendingUsers.map((u) => (
            <View key={u.user_id} style={styles.pendingRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(u.full_name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pendingName}>{u.full_name}</Text>
                <Text style={styles.pendingEmail}>{u.email}</Text>
              </View>
              <Text style={styles.pendingTime}>{timeAgo(u.created_at)}</Text>
              <TouchableOpacity style={styles.reviewButton} onPress={() => setSelectedUser(u)}>
                <Text style={styles.reviewButtonText}>Review</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Reports</Text>
        {recentReports.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No recent reports.</Text>
          </View>
        ) : (
          recentReports.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              onPress={() => navigation.navigate("ReportDetail", { reportId: r.id })}
            />
          ))
        )}
      </View>

      <View style={[styles.section, { marginBottom: 32 }]}>
        <ComplianceList departments={deptCompliance} />
      </View>

      <ApproveUserModal
        visible={!!selectedUser}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onApproved={handleApproved}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  errorText: { color: "#dc2626", marginBottom: 10 },
  retryText: { color: "#2563eb", fontWeight: "600" },
  heading: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 16 },
  quickActionsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  quickAction: {
    flex: 1,
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 14,
    gap: 6,
  },
  quickActionText: { fontSize: 11.5, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  section: { marginTop: 8, marginBottom: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  badge: { marginLeft: 8, backgroundColor: "#e11d48", borderRadius: 10, paddingHorizontal: 7, paddingVertical: 1 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  emptyBox: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#eee", padding: 20, alignItems: "center" },
  emptyText: { color: "#9ca3af", fontSize: 13, marginTop: 6, textAlign: "center" },
  pendingRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#eee", padding: 12, marginBottom: 8 },
  avatar: { width: 34, height: 34, borderRadius: 9, backgroundColor: "#eef2ff", alignItems: "center", justifyContent: "center", marginRight: 10 },
  avatarText: { color: "#4f46e5", fontWeight: "700", fontSize: 12 },
  pendingName: { fontSize: 13, fontWeight: "600", color: "#111827" },
  pendingEmail: { fontSize: 11, color: "#9ca3af" },
  pendingTime: { fontSize: 10, color: "#9ca3af", marginRight: 8 },
  reviewButton: { backgroundColor: "#4f46e5", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  reviewButtonText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
