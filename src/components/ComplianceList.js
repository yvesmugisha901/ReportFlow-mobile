import React from "react";
import { View, Text, StyleSheet } from "react-native";

const BAR_COLORS = ["#4f46e5", "#7c3aed", "#0284c7", "#059669", "#d97706", "#e11d48"];

export default function ComplianceList({ departments }) {
  if (!departments || departments.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Dept. Compliance</Text>
        <Text style={styles.empty}>No data yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Dept. Compliance</Text>
      {departments.map((d, i) => {
        const pct = d.total > 0 ? Math.round((d.submitted / d.total) * 100) : 0;
        const color = BAR_COLORS[i % BAR_COLORS.length];
        return (
          <View key={d.name} style={styles.row}>
            <View style={styles.rowHeader}>
              <Text style={styles.deptName}>{d.name}</Text>
              <Text style={styles.deptPct}>{pct}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 16,
  },
  title: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 12 },
  empty: { fontSize: 13, color: "#9ca3af" },
  row: { marginBottom: 14 },
  rowHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  deptName: { fontSize: 13, fontWeight: "600", color: "#374151" },
  deptPct: { fontSize: 12, color: "#9ca3af" },
  track: { height: 6, backgroundColor: "#f3f4f6", borderRadius: 3, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
});