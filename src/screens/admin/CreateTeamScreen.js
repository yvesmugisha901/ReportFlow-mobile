import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createTeam } from "../../api/admin";

export default function CreateTeamScreen({ route, navigation }) {
  const { deptId, deptName } = route.params;
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      Alert.alert("Missing information", "Team name is required.");
      return;
    }

    setSubmitting(true);
    try {
      await createTeam({ name: name.trim(), dept_id: deptId });
      Alert.alert("Team created", `"${name.trim()}" has been added to ${deptName}.`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const message = err?.response?.data?.error || "Could not create this team. Please try again.";
      Alert.alert("Creation failed", message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.heading}>New Team</Text>
      <Text style={styles.subheading}>in {deptName}</Text>

      <Text style={styles.fieldLabel}>Team Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Accounts Payable"
        placeholderTextColor="#9CA3AF"
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
            <Ionicons name="people-outline" size={17} color="#fff" />
            <Text style={styles.submitText}>Create Team</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  heading: { fontSize: 20, fontWeight: "800", color: "#111827" },
  subheading: { fontSize: 13, color: "#6B7280", marginTop: 2, marginBottom: 20 },
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