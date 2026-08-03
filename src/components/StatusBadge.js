import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { STATUS } from "../constants/config";
import { useAuth } from "../context/AuthContext";

const COLORS = {
  [STATUS.PENDING]: { bg: "#fef3c7", text: "#92400e" },
  [STATUS.UNDER_REVIEW]: { bg: "#dbeafe", text: "#1e40af" },
  [STATUS.APPROVED]: { bg: "#dcfce7", text: "#166534" },
  [STATUS.REJECTED]: { bg: "#fee2e2", text: "#991b1b" },
};

// The same underlying status means something different depending on who's
// looking at it. "under_review" to a reviewer means "I already approved
// this, it's now with the approver". To an approver it means "this is
// waiting on ME right now". To an admin it's just informational.
// Label it per-role instead of showing the raw enum value.
const ROLE_LABELS = {
  reviewer: {
    [STATUS.UNDER_REVIEW]: "Awaiting approval",
  },
  approver: {
    [STATUS.UNDER_REVIEW]: "Awaiting your approval",
  },
  admin: {
    [STATUS.UNDER_REVIEW]: "Awaiting final approval",
  },
};

function formatLabel(status) {
  return String(status || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ status }) {
  const { user } = useAuth();
  const colors = COLORS[status] || { bg: "#f3f4f6", text: "#374151" };
  const label = ROLE_LABELS[user?.role]?.[status] || formatLabel(status);

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  text: { fontSize: 12, fontWeight: "600" },
});