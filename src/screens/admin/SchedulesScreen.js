import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getMySchedules } from "../../api/schedules";

const FREQUENCY_LABELS = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  custom: "Custom",
};

const FREQUENCY_COLORS = {
  weekly: "#2563EB",
  biweekly: "#7C3AED",
  monthly: "#059669",
  quarterly: "#D97706",
  custom: "#6B7280",
};

export default function SchedulesScreen({ navigation }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await getMySchedules();
      setSchedules(data || []);
    } catch (err) {
      console.warn("Failed to load schedules", err);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Report Schedules</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? "Loading…" : `${schedules.length} schedule${schedules.length === 1 ? "" : "s"}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CreateSchedule")}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#2563EB" />
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={(item) => String(item.schedule_id)}
          contentContainerStyle={{ padding: 16, paddingTop: 4, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#2563EB" />
          }
          renderItem={({ item }) => {
            const freqColor = FREQUENCY_COLORS[item.frequency] || "#6B7280";
            const scope = item.team
              ? `${item.department?.name || "—"} · ${item.team.name}`
              : item.department
              ? item.department.name
              : "Company-wide";

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate("EditSchedule", { scheduleId: item.schedule_id })}
                activeOpacity={0.7}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={[styles.freqPill, { backgroundColor: freqColor + "1A" }]}>
                    <Text style={[styles.freqPillText, { color: freqColor }]}>
                      {FREQUENCY_LABELS[item.frequency] || item.frequency}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardMeta}>{item.report_type}</Text>
                <Text style={styles.cardScope}>
                  <Ionicons name="business-outline" size={11} color="#9CA3AF" /> {scope}
                </Text>
                <Text style={styles.cardDates}>
                  Starts {item.start_date} · Deadline {item.deadline}
                </Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No schedules yet</Text>
              <Text style={styles.emptySubtitle}>Tap the + button to define a reporting timeline.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F3",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  headerSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  cardTitle: { fontSize: 14.5, fontWeight: "700", color: "#111827", flex: 1, marginRight: 8 },
  freqPill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  freqPillText: { fontSize: 10.5, fontWeight: "700" },
  cardMeta: { fontSize: 12.5, color: "#4B5563", marginBottom: 6 },
  cardScope: { fontSize: 11.5, color: "#9CA3AF", marginBottom: 4 },
  cardDates: { fontSize: 11, color: "#9CA3AF" },
  empty: { alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#374151", marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: "#9CA3AF", marginTop: 4, textAlign: "center", paddingHorizontal: 30 },
});