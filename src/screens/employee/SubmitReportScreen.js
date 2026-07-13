import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { submitReport } from "../../api/reports";
import { formatFrequency, periodLabel } from "../../utils/scheduleUtils";

export default function SubmitReportScreen({ route, navigation }) {
  const scheduleId = route.params?.scheduleId;
  const schedule = route.params?.schedule; // passed from SelectScheduleScreen

  const [title, setTitle] = useState(schedule?.title || "");
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
      const message = err?.response?.data?.error || "Please try again.";
      // Duplicate-period conflict from backend (409)
      if (err?.response?.status === 409) {
        Alert.alert("Already submitted", message);
      } else {
        Alert.alert("Submission failed", message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {schedule && (
        <View style={styles.scheduleInfo}>
          <View style={styles.scheduleRow}>
            <Ionicons name="repeat-outline" size={16} color="#2563EB" />
            <Text style={styles.scheduleLabel}>{formatFrequency(schedule.frequency)}</Text>
          </View>
          <Text style={styles.schedulePeriod}>{periodLabel(schedule)}</Text>
        </View>
      )}

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  scheduleInfo: {
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },
  scheduleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  scheduleLabel: { fontSize: 13.5, fontWeight: "700", color: "#2563EB", marginLeft: 6 },
  schedulePeriod: { fontSize: 12, color: "#4B5563", marginTop: 4 },
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