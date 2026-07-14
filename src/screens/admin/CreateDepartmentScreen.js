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
import { createDepartment } from "../../api/admin";

export default function CreateDepartmentScreen({ navigation }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      Alert.alert("Missing information", "Department name is required.");
      return;
    }

    setSubmitting(true);
    try {
      await createDepartment({ name: name.trim(), description: description.trim() || null });
      Alert.alert("Department created", `"${name.trim()}" has been added.`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const message = err?.response?.data?.error || "Could not create this department. Please try again.";
      Alert.alert("Creation failed", message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.heading}>New Department</Text>

      <Text style={styles.fieldLabel}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Finance"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.fieldLabel}>Description (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="What does this department do?"
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={4}
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
            <Ionicons name="business-outline" size={17} color="#fff" />
            <Text style={styles.submitText}>Create Department</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  heading: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 20 },
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
  textArea: { textAlignVertical: "top", minHeight: 90 },
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