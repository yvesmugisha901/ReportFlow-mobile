import React, { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getMySchedules } from "../../api/schedules";
import ScheduleCard from "../../components/ScheduleCard";

export default function SelectScheduleScreen({ navigation }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await getMySchedules();
      setSchedules(data);
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

  function handleSelect(schedule) {
    navigation.navigate("SubmitReport", {
      scheduleId: schedule.schedule_id,
      schedule, // pass the whole object so SubmitReportScreen can show frequency/title without refetching
    });
  }

  function handleCustom() {
    // No scheduleId, no schedule param — SubmitReportScreen already
    // handles this: no frequency box, empty title, ad-hoc report with schedule_id: null.
    navigation.navigate("SubmitReport", {});
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Report Schedules</Text>
        <Text style={styles.headerSubtitle}>Select a schedule to submit a report for</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#2563EB" />
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={(item) => String(item.schedule_id)}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#2563EB" />
          }
          ListHeaderComponent={
            <TouchableOpacity style={styles.customCard} onPress={handleCustom} activeOpacity={0.7}>
              <View style={styles.customIconWrap}>
                <Ionicons name="create-outline" size={20} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.customTitle}>Submit a Custom Report</Text>
                <Text style={styles.customSubtitle}>
                  Not on a schedule? Report something ad-hoc, like a missing item or issue.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <ScheduleCard schedule={item} onPress={() => handleSelect(item)} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No schedules yet</Text>
              <Text style={styles.emptySubtitle}>
                Your department has no report schedules assigned right now — you can still submit a custom report above.
              </Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F3",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
  headerSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  customCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    gap: 12,
  },
  customIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  customTitle: { fontSize: 14.5, fontWeight: "700", color: "#111827" },
  customSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  empty: { alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#374151", marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: "#9CA3AF", marginTop: 4, textAlign: "center", paddingHorizontal: 30 },
});