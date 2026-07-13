import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import StatusBadge from "./StatusBadge";

export default function ReportCard({ report, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{report.title || report.type}</Text>
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
  title: { fontSize: 15, fontWeight: "600", flex: 1, marginRight: 8 },
  meta: { fontSize: 12, color: "#888" },
});
