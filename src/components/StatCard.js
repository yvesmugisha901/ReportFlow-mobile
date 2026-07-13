import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLOR_MAP = {
  indigo: { bg: "#eef2ff", icon: "#4f46e5" },
  amber: { bg: "#fffbeb", icon: "#d97706" },
  emerald: { bg: "#ecfdf5", icon: "#059669" },
  sky: { bg: "#f0f9ff", icon: "#0284c7" },
  violet: { bg: "#f5f3ff", icon: "#7c3aed" },
  rose: { bg: "#fff1f2", icon: "#e11d48" },
};

export default function StatCard({ label, value, icon, trend, color = "indigo" }) {
  const palette = COLOR_MAP[color] || COLOR_MAP.indigo;

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: palette.bg }]}>
        <Ionicons name={icon} size={18} color={palette.icon} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend ? <Text style={styles.trend}>{trend}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: "48%",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 14,
    marginBottom: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  value: { fontSize: 20, fontWeight: "800", color: "#111827" },
  label: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  trend: { fontSize: 11, color: "#9ca3af", marginTop: 6 },
});