import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { timeAgo, initials } from "../utils/timeAgo";

const STATUS_STYLES = {
  submitted: { bg: "#EFF6FF", fg: "#2563EB", label: "Awaiting review" },
  stage1_approved: { bg: "#FFF7ED", fg: "#D97706", label: "Awaiting approval" },
  under_review: { bg: "#EFF6FF", fg: "#2563EB", label: "In review" },
  changes_requested: { bg: "#FEF2F2", fg: "#DC2626", label: "Changes requested" },
};

export default function ReviewCard({ report, onPress }) {
  const submitter = report.submittedBy || report.employee || {};
  const statusInfo = STATUS_STYLES[report.status] || {
    bg: "#F3F4F6",
    fg: "#6B7280",
    label: report.status?.replace(/_/g, " ") || "Pending",
  };

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(submitter.name || submitter.full_name)}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {report.title || report.type}
          </Text>
          {report.is_late ? (
            <View style={styles.lateTag}>
              <Ionicons name="alert-circle" size={12} color="#DC2626" />
              <Text style={styles.lateText}>Late</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.subtitle} numberOfLines={1}>
          {submitter.name || submitter.full_name || "Unknown"} · {report.department || "—"}
        </Text>

        <View style={styles.bottomRow}>
          <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.badgeText, { color: statusInfo.fg }]}>{statusInfo.label}</Text>
          </View>
          <Text style={styles.time}>{timeAgo(report.submittedAt || report.created_at)}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#C7CBD1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  body: { flex: 1, marginRight: 8 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 15, fontWeight: "700", color: "#111827", flex: 1, marginRight: 6 },
  lateTag: { flexDirection: "row", alignItems: "center", gap: 3 },
  lateText: { fontSize: 11, color: "#DC2626", fontWeight: "600", marginLeft: 2 },
  subtitle: { fontSize: 12.5, color: "#6B7280", marginTop: 2 },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  time: { fontSize: 11, color: "#9CA3AF" },
});