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
import { getAllDepartments } from "../../api/admin";

export default function DepartmentsScreen({ navigation }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await getAllDepartments();
      setDepartments(data || []);
    } catch (err) {
      console.warn("Failed to load departments", err);
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
          <Text style={styles.headerTitle}>Departments</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? "Loading…" : `${departments.length} department${departments.length === 1 ? "" : "s"}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CreateDepartment")}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#2563EB" />
      ) : (
        <FlatList
          data={departments}
          keyExtractor={(item) => String(item.dept_id)}
          contentContainerStyle={{ padding: 16, paddingTop: 4, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#2563EB" />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("Teams", { deptId: item.dept_id, deptName: item.name })}
              activeOpacity={0.7}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="business-outline" size={20} color="#4F46E5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardMeta}>
                  {(item.teams?.length ?? 0)} team{(item.teams?.length ?? 0) === 1 ? "" : "s"}
                  {item.reviewer ? ` · Reviewer: ${item.reviewer.full_name}` : " · No reviewer assigned"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="business-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No departments yet</Text>
              <Text style={styles.emptySubtitle}>Tap the + button to create your first one.</Text>
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
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 14.5, fontWeight: "700", color: "#111827" },
  cardMeta: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  empty: { alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#374151", marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: "#9CA3AF", marginTop: 4, textAlign: "center" },
});