import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  getUserById,
  getAllDepartments,
  getTeams,
  updateUser,
  activateUser,
  deactivateUser,
} from "../../api/admin";
import SelectField from "../../components/SelectField";
import { initials } from "../../utils/reportUtils";

const ROLE_OPTIONS = [
  { label: "Employee", value: "employee" },
  { label: "Department Reviewer", value: "reviewer" },
  { label: "Final Approver", value: "approver" },
  { label: "Admin", value: "admin" },
];

export default function UserDetailScreen({ route, navigation }) {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [role, setRole] = useState(null);
  const [deptId, setDeptId] = useState(null);
  const [teamId, setTeamId] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, deptData] = await Promise.all([getUserById(userId), getAllDepartments()]);
      setUser(userData);
      setRole(userData.role);
      setDeptId(userData.dept_id ?? null);
      setTeamId(userData.team_id ?? null);
      setDepartments(deptData || []);
    } catch (err) {
      console.warn("Failed to load user", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Load teams for the currently-selected department; keep the user's
  // existing team selected on first load if it belongs to that department.
  useEffect(() => {
    if (!deptId) {
      setTeams([]);
      return;
    }
    setLoadingTeams(true);
    getTeams(deptId)
      .then((data) => {
        setTeams(data || []);
        // If switching to a department that doesn't contain the currently
        // selected team, clear it rather than silently keeping a mismatch.
        setTeamId((prev) => (data.some((t) => t.team_id === prev) ? prev : null));
      })
      .catch((err) => console.warn("Failed to load teams", err))
      .finally(() => setLoadingTeams(false));
  }, [deptId]);

  const departmentOptions = departments.map((d) => ({ label: d.name, value: d.dept_id }));
  const teamOptions = teams.map((t) => ({ label: t.name, value: t.team_id }));

  const isDirty =
    user && (role !== user.role || deptId !== (user.dept_id ?? null) || teamId !== (user.team_id ?? null));

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateUser(userId, { role, dept_id: deptId, team_id: teamId });
      setUser(updated);
      Alert.alert("Saved", "This user's assignment has been updated.");
    } catch (err) {
      const message = err?.response?.data?.error || "Could not save changes. Please try again.";
      Alert.alert("Save failed", message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus() {
    const action = user.is_active ? "deactivate" : "activate";
    Alert.alert(
      user.is_active ? "Deactivate user?" : "Activate user?",
      user.is_active
        ? `${user.full_name} will no longer be able to log in.`
        : `${user.full_name} will be able to log in again.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: user.is_active ? "Deactivate" : "Activate",
          style: user.is_active ? "destructive" : "default",
          onPress: async () => {
            setTogglingStatus(true);
            try {
              if (user.is_active) await deactivateUser(userId);
              else await activateUser(userId);
              await load();
            } catch (err) {
              Alert.alert("Action failed", `Could not ${action} this user. Please try again.`);
            } finally {
              setTogglingStatus(false);
            }
          },
        },
      ]
    );
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} color="#2563EB" />;
  if (!user) return <Text style={styles.error}>User not found.</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(user.full_name)}</Text>
        </View>
        <Text style={styles.name}>{user.full_name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={[styles.statusPill, { backgroundColor: user.is_active ? "#ECFDF5" : "#FEF2F2" }]}>
          <Ionicons
            name={user.is_active ? "checkmark-circle" : "close-circle"}
            size={13}
            color={user.is_active ? "#059669" : "#DC2626"}
          />
          <Text style={[styles.statusPillText, { color: user.is_active ? "#059669" : "#DC2626" }]}>
            {user.is_active ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Role &amp; Assignment</Text>

        <SelectField label="Role" value={role} options={ROLE_OPTIONS} onChange={setRole} />

        <SelectField
          label="Department"
          placeholder="No department"
          value={deptId}
          options={departmentOptions}
          onChange={setDeptId}
        />

        <SelectField
          label="Team"
          placeholder={!deptId ? "Select a department first" : loadingTeams ? "Loading…" : "No team"}
          value={teamId}
          options={teamOptions}
          onChange={setTeamId}
          disabled={!deptId || loadingTeams}
        />

        <TouchableOpacity
          style={[styles.saveButton, (!isDirty || saving) && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={!isDirty || saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Status</Text>
        <TouchableOpacity
          style={[styles.statusButton, { backgroundColor: user.is_active ? "#FEF2F2" : "#ECFDF5" }]}
          onPress={handleToggleStatus}
          disabled={togglingStatus}
        >
          {togglingStatus ? (
            <ActivityIndicator color={user.is_active ? "#DC2626" : "#059669"} size="small" />
          ) : (
            <>
              <Ionicons
                name={user.is_active ? "close-circle-outline" : "checkmark-circle-outline"}
                size={17}
                color={user.is_active ? "#DC2626" : "#059669"}
              />
              <Text
                style={[
                  styles.statusButtonText,
                  { color: user.is_active ? "#DC2626" : "#059669" },
                ]}
              >
                {user.is_active ? "Deactivate User" : "Activate User"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  headerCard: {
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 24,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F3",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: { color: "#4F46E5", fontWeight: "700", fontSize: 20 },
  name: { fontSize: 17, fontWeight: "800", color: "#111827" },
  email: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  statusPillText: { fontSize: 11.5, fontWeight: "700" },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 14,
  },
  saveButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 13,
    gap: 8,
  },
  statusButtonText: { fontWeight: "700", fontSize: 14 },
  error: { textAlign: "center", marginTop: 40, color: "#999" },
});