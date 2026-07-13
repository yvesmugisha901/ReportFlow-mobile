import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { STATUS } from "../constants/config";

const COLORS = {
  [STATUS.PENDING]: { bg: "#fef3c7", text: "#92400e" },
  [STATUS.UNDER_REVIEW]: { bg: "#dbeafe", text: "#1e40af" },
  [STATUS.APPROVED]: { bg: "#dcfce7", text: "#166534" },
  [STATUS.REJECTED]: { bg: "#fee2e2", text: "#991b1b" },
};

export default function StatusBadge({ status }) {
  const colors = COLORS[status] || { bg: "#f3f4f6", text: "#374151" };
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{status}</Text>
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
