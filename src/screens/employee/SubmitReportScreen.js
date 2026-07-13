import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { submitReport } from "../../api/reports";

export default function SubmitReportScreen({ route, navigation }) {
  const scheduleId = route.params?.scheduleId; // passed in if submitting against a specific schedule
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function pickFile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
    });
    if (result.canceled) return;
    setFile(result.assets[0]);
  }

  async function handleSubmit() {
    if (!title.trim()) {
      Alert.alert("Title required", "Please give this report a title.");
      return;
    }
    if (!notes.trim() && !file) {
      Alert.alert("Content required", "Add some notes or attach a file before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      await submitReport({ scheduleId, title: title.trim(), notes, file });
      Alert.alert("Success", "Report submitted.");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Submission failed", err?.response?.data?.error || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Monthly Sales Report - July"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Content / Notes</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={5}
        placeholder="Write your report content here..."
        value={notes}
        onChangeText={setNotes}
      />

      <Text style={styles.label}>Attachment (PDF, Word, Excel)</Text>
      <TouchableOpacity style={styles.fileButton} onPress={pickFile}>
        <Text style={styles.fileButtonText}>
          {file ? file.name : "Attach File (optional)"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Report</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  fileButton: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  fileButtonText: { color: "#2563eb", fontWeight: "600" },
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  submitButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});