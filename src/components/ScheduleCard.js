import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatFrequency, periodLabel, formatDate, getScheduleStatus } from "../utils/scheduleUtils";

export default function ScheduleCard({ schedule, onPress }) {
  const status = getScheduleStatus(schedule);
  const canSubmit = !schedule.alreadySubmitted || schedule.existingReportStatus === "changes_requested";

  return (
    <TouchableOpacity
      activeOpacity={canSubmit ? 0.7 : 1}
      onPress={canSubmit ? onPress : undefined}
      style={[styles.card, !canSubmit && styles.cardDisabled]}
    >
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>{schedule.title}</Text>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="repeat-outline" size={14} color="#6B7280" />
        <Text style={styles.metaText}>{formatFrequency(schedule.frequency)}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
        <Text style={styles.metaText}>{periodLabel(schedule)}</Text>
      </View>

      {schedule.currentPeriod?.deadline && !schedule.alreadySubmitted && (
        <Text style={[styles.deadline, schedule.isOverdue && styles.deadlineOverdue]}>
          Due {formatDate(schedule.currentPeriod.deadline)}
        </Text>
      )}

      {!canSubmit && (
        <Text style={styles.submittedNote}>
          Already submitted for this period — next one opens automatically.
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardDisabled: { opacity: 0.6 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 15.5, fontWeight: "700", color: "#111827", flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 4 },
  metaText: { fontSize: 12.5, color: "#6B7280", marginRight: 4 },
  metaDot: { color: "#D1D5DB", marginHorizontal: 2 },
  deadline: { fontSize: 12, color: "#2563EB", fontWeight: "600", marginTop: 8 },
  deadlineOverdue: { color: "#DC2626" },
  submittedNote: { fontSize: 12, color: "#9CA3AF", marginTop: 8, fontStyle: "italic" },
});