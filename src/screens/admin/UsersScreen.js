import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getAllUsers } from "../../api/admin";
import { initials } from "../../utils/reportUtils";

const ROLE_FILTERS = [
  { label: "All", value: null },
  { label: "Employees", value: "employee" },
  { label: "Reviewers", value: "reviewer" },
  { label: "Approvers", value: "approver" },
  { label: "Admins", value: "admin" },
];

const ROLE_COLORS = {
  admin: "#7C3AED",
  reviewer: "#2563EB",
  approver: "#D97706",
  employee: "#059669",
};

export default function UsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.warn("Failed to load users", err);
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

  const filtered = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Users</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? "Loading…" : `${users.length} total`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("RegisterEmployee")}
        >
          <Ionicons name="person-add-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or email"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <FlatList
        horizontal
        data={ROLE_FILTERS}
        keyExtractor={(item) => String(item.value)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => {
          const active = roleFilter === item.value;
          return (
            <TouchableOpacity
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setRoleFilter(item.value)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#2563EB" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.user_id)}
          contentContainerStyle={{ padding: 16, paddingTop: 4, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#2563EB" />
          }
          renderItem={({ item }) => {
            const roleColor = ROLE_COLORS[item.role] || "#6B7280";
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate("UserDetail", { userId: item.user_id })}
                activeOpacity={0.7}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(item.full_name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.full_name}</Text>
                    {!item.is_active && (
                      <View style={styles.inactivePill}>
                        <Text style={styles.inactivePillText}>Inactive</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardMeta} numberOfLines={1}>
                    {item.email}
                  </Text>
                  <Text style={styles.cardMeta} numberOfLines={1}>
                    {item.department?.name || "No department"}
                    {item.team?.name ? ` · ${item.team.name}` : ""}
                  </Text>
                </View>
                <View style={[styles.rolePill, { backgroundColor: roleColor + "1A" }]}>
                  <Text style={[styles.rolePillText, { color: roleColor }]}>{item.role}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptySubtitle}>Try a different search or filter.</Text>
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#111827" },
  filterRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
 filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,

},
filterChipActive: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" }, // only changes color, not size
  filterChipText: { fontSize: 12.5, fontWeight: "600", color: "#6B7280" },
  filterChipTextActive: { color: "#fff" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#4F46E5", fontWeight: "700", fontSize: 12 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#111827", flexShrink: 1 },
  cardMeta: { fontSize: 11.5, color: "#9CA3AF", marginTop: 1 },
  inactivePill: { backgroundColor: "#FEF2F2", borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1 },
  inactivePillText: { fontSize: 9.5, fontWeight: "700", color: "#DC2626" },
  rolePill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  rolePillText: { fontSize: 10.5, fontWeight: "700", textTransform: "capitalize" },
  empty: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#374151", marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: "#9CA3AF", marginTop: 4 },
});