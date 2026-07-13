import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import StatusBadge from "./StatusBadge";

export default function ReportCard({ report, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{report.title || report.type}</Text>
          {report.isCustom && (
            <View style={styles.customTag}>
              <Text style={styles.customTagText}>Custom</Text>
            </View>
          )}
        </View>
        <StatusBadge status={report.status} />
      </View>
      <Text style={styles.meta}>
        {report.department} • {new Date(report.submittedAt || report.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  titleRow: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8, gap: 6 },
  title: { fontSize: 15, fontWeight: "600", flexShrink: 1 },
  customTag: {
    backgroundColor: "#EFF6FF",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  customTagText: { fontSize: 10, fontWeight: "700", color: "#2563EB" },
  meta: { fontSize: 12, color: "#888" },
});