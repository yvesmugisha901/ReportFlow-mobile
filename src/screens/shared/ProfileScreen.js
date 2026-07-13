import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from "react-native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { initials } from "../../utils/reportUtils";
import EditProfileModal from "./EditProfileModal";

const ROLE_LABELS = {
  admin: "Administrator",
  employee: "Employee",
  reviewer: "Department Reviewer",
  approver: "Final Approver",
};

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [editVisible, setEditVisible] = useState(false);

  function confirmLogout() {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout },
    ]);
  }

  const displayName = user?.full_name || user?.name || "User";
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || "—";
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(displayName)}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{roleLabel}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <InfoRow icon="mail-outline" label="Email" value={user?.email} />
        {user?.department?.name ? (
          <InfoRow icon="business-outline" label="Department" value={user.department.name} />
        ) : null}
        {user?.team?.name ? (
          <InfoRow icon="people-outline" label="Team" value={user.team.name} />
        ) : null}
      </View>

      <TouchableOpacity style={styles.editButton} onPress={() => setEditVisible(true)}>
        <Ionicons name="create-outline" size={16} color="#2563eb" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <InfoRow icon="information-circle-outline" label="App Version" value={appVersion} />
          <TouchableOpacity onPress={() => Linking.openURL("mailto:support@company.com")}>
            <InfoRow icon="help-circle-outline" label="Support" value="support@company.com" isLink />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
        <Ionicons name="log-out-outline" size={18} color="#fff" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <EditProfileModal
        visible={editVisible}
        user={user}
        onClose={() => setEditVisible(false)}
        onSaved={updateUser}
      />
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, isLink }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color="#9ca3af" style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, isLink && styles.infoLink]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { alignItems: "center", paddingTop: 32, paddingBottom: 24, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  avatar: { width: 72, height: 72, borderRadius: 20, backgroundColor: "#eef2ff", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { color: "#4f46e5", fontWeight: "800", fontSize: 24 },
  name: { fontSize: 18, fontWeight: "700", color: "#111827" },
  roleBadge: { marginTop: 8, backgroundColor: "#eef2ff", borderColor: "#c7d2fe", borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  roleBadgeText: { fontSize: 12, fontWeight: "600", color: "#4f46e5" },
  card: { backgroundColor: "#fff", marginHorizontal: 16, marginTop: 16, borderRadius: 14, borderWidth: 1, borderColor: "#eee", padding: 4 },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  infoLabel: { fontSize: 11, color: "#9ca3af", marginBottom: 1 },
  infoValue: { fontSize: 14, color: "#111827", fontWeight: "500" },
  infoLink: { color: "#2563eb" },
  editButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginHorizontal: 16, marginTop: 12, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "#c7d2fe", backgroundColor: "#eef2ff" },
  editButtonText: { color: "#2563eb", fontWeight: "700", fontSize: 13 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, marginTop: 24, marginBottom: 40, backgroundColor: "#dc2626", borderRadius: 12, paddingVertical: 14 },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});