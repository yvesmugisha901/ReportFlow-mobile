import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getTeams, approveUser } from "../../api/admin";
import { initials } from "../../utils/reportUtils";

export default function ApproveUserModal({ visible, user, onClose, onApproved }) {
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible || !user) return;
    setSelectedTeamId(null);
    setError("");
    setTeamsLoading(true);
    getTeams(user.dept_id)
      .then((data) => setTeams(data.teams ?? data.data ?? data ?? []))
      .catch(() => setTeams([]))
      .finally(() => setTeamsLoading(false));
  }, [visible, user]);

  async function handleApprove() {
    setSubmitting(true);
    setError("");
    try {
      await approveUser(user.user_id, { teamId: selectedTeamId });
      onApproved(user.user_id);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || "Approval failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Approve Employee</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(user.full_name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user.full_name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            {user.department ? (
              <View style={styles.deptBadge}>
                <Text style={styles.deptBadgeText}>{user.department.name}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.label}>Assign to team (optional)</Text>
          {teamsLoading ? (
            <ActivityIndicator style={{ marginVertical: 12 }} />
          ) : teams.length === 0 ? (
            <View style={styles.noTeams}>
              <Text style={styles.noTeamsText}>No teams in this department yet — you can assign later.</Text>
            </View>
          ) : (
            <ScrollView style={styles.teamList} nestedScrollEnabled>
              <TouchableOpacity
                style={[styles.teamOption, selectedTeamId === null && styles.teamOptionSelected]}
                onPress={() => setSelectedTeamId(null)}
              >
                <Text style={styles.teamOptionText}>No team (assign later)</Text>
              </TouchableOpacity>
              {teams.map((t) => (
                <TouchableOpacity
                  key={t.team_id}
                  style={[styles.teamOption, selectedTeamId === t.team_id && styles.teamOptionSelected]}
                  onPress={() => setSelectedTeamId(t.team_id)}
                >
                  <Text style={styles.teamOptionText}>{t.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={handleApprove}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.approveText}>Approve & Activate</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "85%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },
  userRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#f9fafb", borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: "#eee" },
  avatar: { width: 38, height: 38, borderRadius: 10, backgroundColor: "#eef2ff", alignItems: "center", justifyContent: "center", marginRight: 10 },
  avatarText: { color: "#4f46e5", fontWeight: "700", fontSize: 13 },
  userName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  userEmail: { fontSize: 12, color: "#9ca3af" },
  deptBadge: { backgroundColor: "#eef2ff", borderColor: "#c7d2fe", borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  deptBadgeText: { fontSize: 11, fontWeight: "600", color: "#4f46e5" },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 },
  noTeams: { backgroundColor: "#fffbeb", borderColor: "#fde68a", borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8 },
  noTeamsText: { fontSize: 12, color: "#b45309" },
  teamList: { maxHeight: 160, marginBottom: 8 },
  teamOption: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: "#eee", marginBottom: 6 },
  teamOptionSelected: { borderColor: "#4f46e5", backgroundColor: "#eef2ff" },
  teamOptionText: { fontSize: 13, color: "#374151", fontWeight: "500" },
  error: { color: "#dc2626", fontSize: 12, marginBottom: 8 },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  cancelButton: { flex: 1, paddingVertical: 13, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center" },
  cancelText: { color: "#6b7280", fontWeight: "600", fontSize: 13 },
  approveButton: { flex: 1, paddingVertical: 13, borderRadius: 10, backgroundColor: "#059669", alignItems: "center" },
  approveText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});