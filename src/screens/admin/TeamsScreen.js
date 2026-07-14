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
import { getTeams } from "../../api/admin";

export default function TeamsScreen({ route, navigation }) {
  const { deptId, deptName } = route.params;
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await getTeams(deptId);
      setTeams(data || []);
    } catch (err) {
      console.warn("Failed to load teams", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [deptId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{deptName || "Teams"}</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? "Loading…" : `${teams.length} team${teams.length === 1 ? "" : "s"}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CreateTeam", { deptId, deptName })}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#2563EB" />
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => String(item.team_id)}
          contentContainerStyle={{ padding: 16, paddingTop: 4, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#2563EB" />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name="people-outline" size={18} color="#059669" />
              </View>
              <Text style={styles.cardTitle}>{item.name}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No teams yet</Text>
              <Text style={styles.emptySubtitle}>Tap the + button to create the first team in this department.</Text>
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
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 14.5, fontWeight: "600", color: "#111827" },
  empty: { alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#374151", marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: "#9CA3AF", marginTop: 4, textAlign: "center", paddingHorizontal: 30 },
});