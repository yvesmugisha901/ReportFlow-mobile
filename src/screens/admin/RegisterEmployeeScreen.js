import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getAllDepartments, getTeams, registerUser } from "../../api/admin";
import SelectField from "../../components/SelectField";

const ROLE_OPTIONS = [
  { label: "Employee", value: "employee" },
  { label: "Department Reviewer", value: "reviewer" },
  { label: "Final Approver", value: "approver" },
  { label: "Admin", value: "admin" },
];

export default function RegisterEmployeeScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [deptId, setDeptId] = useState(null);
  const [teamId, setTeamId] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getAllDepartments()
        .then(setDepartments)
        .catch((err) => console.warn("Failed to load departments", err))
        .finally(() => setLoadingDepts(false));
    }, [])
  );

  // Reload teams whenever the selected department changes; clear any
  // previously chosen team since it likely doesn't belong to the new dept.
  useEffect(() => {
    if (!deptId) {
      setTeams([]);
      setTeamId(null);
      return;
    }
    setLoadingTeams(true);
    setTeamId(null);
    getTeams(deptId)
      .then(setTeams)
      .catch((err) => console.warn("Failed to load teams", err))
      .finally(() => setLoadingTeams(false));
  }, [deptId]);

  const departmentOptions = departments.map((d) => ({ label: d.name, value: d.dept_id }));
  const teamOptions = teams.map((t) => ({ label: t.name, value: t.team_id }));

  function validate() {
    if (!fullName.trim()) return "Full name is required.";
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) return "A valid email is required.";
    return null;
  }

  function openEmailPreview(url) {
    Linking.openURL(url).catch(() =>
      Alert.alert("Could not open link", "Copy and open this URL manually:\n\n" + url)
    );
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      Alert.alert("Missing information", validationError);
      return;
    }

    setSubmitting(true);
    try {
      const result = await registerUser({
        full_name: fullName.trim(),
        email: email.trim(),
        role,
        dept_id: deptId,
        team_id: teamId,
      });

      if (result.emailError) {
        // Email failed to send — surface the password directly since there's
        // no sent email for the admin to view.
        Alert.alert(
          "Account created — email failed",
          `${result.emailError}\n\nTemporary password: ${result.plainPassword}`,
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else if (result.emailPreview) {
        // Email was "sent" — let the admin open it to see exactly what the
        // new user received, including their temporary password.
        Alert.alert(
          "Employee registered",
          `${fullName.trim()} has been registered. A welcome email with login credentials was sent to ${email.trim()}.`,
          [
            { text: "View Sent Email", onPress: () => openEmailPreview(result.emailPreview) },
            { text: "Done", style: "cancel", onPress: () => navigation.goBack() },
          ]
        );
      } else {
        Alert.alert(
          "Employee registered",
          `${fullName.trim()} has been registered and a welcome email with login credentials has been sent.`,
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } catch (err) {
      const message = err?.response?.data?.error || "Could not register this employee. Please try again.";
      Alert.alert("Registration failed", message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.heading}>Register Employee</Text>
      <Text style={styles.subheading}>
        A temporary password will be generated and emailed automatically.
      </Text>

      <Text style={styles.fieldLabel}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="e.g. Jane Uwimana"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.fieldLabel}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="e.g. jane@company.com"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <SelectField label="Role" value={role} options={ROLE_OPTIONS} onChange={setRole} />

      <SelectField
        label="Department"
        placeholder={loadingDepts ? "Loading…" : "Select a department"}
        value={deptId}
        options={departmentOptions}
        onChange={setDeptId}
        disabled={loadingDepts}
      />

      <SelectField
        label="Team (optional)"
        placeholder={!deptId ? "Select a department first" : loadingTeams ? "Loading…" : "Select a team"}
        value={teamId}
        options={teamOptions}
        onChange={setTeamId}
        disabled={!deptId || loadingTeams}
      />

      <TouchableOpacity
        style={[styles.submitButton, submitting && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="person-add-outline" size={17} color="#fff" />
            <Text style={styles.submitText}>Register Employee</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  heading: { fontSize: 20, fontWeight: "800", color: "#111827" },
  subheading: { fontSize: 13, color: "#6B7280", marginTop: 4, marginBottom: 20, lineHeight: 18 },
  fieldLabel: { fontSize: 12.5, fontWeight: "600", color: "#6B7280", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 14.5 },
});
