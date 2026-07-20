import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { getReportById, resubmitReport } from "../../api/reports";
import { SERVER_ORIGIN } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import { normalizeReport } from "../../utils/reportUtils";

const RESUBMITTABLE_STATUSES = ["Rejected", "Changes Requested"];

export default function ReportDetailScreen({ route, navigation }) {
  const { reportId } = route.params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [resubmitting, setResubmitting] = useState(false);

  function load() {
    setLoading(true);
    getReportById(reportId)
      .then((r) => setReport(r))
      .catch((err) => console.warn("Failed to load report", err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [reportId]);

  async function handleDownload() {
    if (!report?.file_url) return;
    setDownloading(true);
    try {
      const remoteUrl = `${SERVER_ORIGIN}${report.file_url}`;
      const localUri = FileSystem.documentDirectory + report.file_name;

      const { uri } = await FileSystem.downloadAsync(remoteUrl, localUri);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Downloaded", `Saved to ${uri}`);
      }
    } catch (err) {
      console.warn("Download failed", err);
      Alert.alert("Download failed", "Could not download the attachment. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  function startEditing() {
    setTitle(report.title || "");
    setNotes(report.content || "");
    setNewFile(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  async function handlePickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (result.canceled) return;
      setNewFile(result.assets[0]);
    } catch (err) {
      console.warn("File pick failed", err);
    }
  }

  async function handleResubmit() {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a title before resubmitting.");
      return;
    }
    setResubmitting(true);
    try {
      const updated = await resubmitReport(reportId, { title, notes, file: newFile });
      setReport(updated);
      setEditing(false);
      Alert.alert("Resubmitted", "Your report has been sent back for review.");
    } catch (err) {
      Alert.alert(
        "Resubmit failed",
        err?.response?.data?.error || "Could not resubmit this report. Please try again."
      );
    } finally {
      setResubmitting(false);
    }
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!report) return <Text style={styles.error}>Report not found.</Text>;

  const normalized = normalizeReport(report);
  const reviewLogs = report.reviewLogs || [];
  const canResubmit = RESUBMITTABLE_STATUSES.includes(normalized.status);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{normalized.title}</Text>
        <StatusBadge status={normalized.status} />
      </View>
      <Text style={styles.meta}>Department: {normalized.department}</Text>
      <Text style={styles.meta}>
        Submitted: {normalized.submittedAt ? new Date(normalized.submittedAt).toLocaleString() : "—"}
      </Text>
      {report.is_late ? <Text style={styles.lateTag}>Submitted late</Text> : null}

      {!editing && report.content ? <Text style={styles.notes}>{report.content}</Text> : null}

      {!editing && report.file_name ? (
        <TouchableOpacity style={styles.fileRow} onPress={handleDownload} disabled={downloading}>
          <Ionicons name="document-attach-outline" size={18} color="#2563eb" />
          <Text style={styles.fileTag} numberOfLines={1}>{report.file_name}</Text>
          {downloading ? (
            <ActivityIndicator size="small" color="#2563eb" style={{ marginLeft: 8 }} />
          ) : (
            <Ionicons name="download-outline" size={18} color="#2563eb" style={{ marginLeft: 8 }} />
          )}
        </TouchableOpacity>
      ) : null}

      {canResubmit && !editing && (
        <TouchableOpacity style={styles.resubmitButton} onPress={startEditing}>
          <Ionicons name="refresh-outline" size={17} color="#fff" />
          <Text style={styles.resubmitButtonText}>Edit &amp; Resubmit</Text>
        </TouchableOpacity>
      )}

      {editing && (
        <View style={styles.editSection}>
          <Text style={styles.sectionTitle}>Edit Report</Text>

          <Text style={styles.fieldLabel}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Report title"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.fieldLabel}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Notes / content"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.filePickRow} onPress={handlePickFile}>
            <Ionicons name="attach-outline" size={18} color="#2563eb" />
            <Text style={styles.filePickText} numberOfLines={1}>
              {newFile ? newFile.name : report.file_name ? `Keep: ${report.file_name}` : "Attach a file (optional)"}
            </Text>
          </TouchableOpacity>

          <View style={styles.editActionsRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelEditing} disabled={resubmitting}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, resubmitting && { opacity: 0.6 }]}
              onPress={handleResubmit}
              disabled={resubmitting}
            >
              {resubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Resubmit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {reviewLogs.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionTitle}>Review History</Text>
          {reviewLogs.map((log) => (
            <View key={log.log_id} style={styles.historyRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyStatus}>
                  {log.action?.replace(/_/g, " ")} by {log.reviewer?.full_name || "Reviewer"} ({log.stage})
                </Text>
                {log.comment ? <Text style={styles.historyComment}>{log.comment}</Text> : null}
              </View>
              <Text style={styles.historyDate}>
                {log.created_at ? new Date(log.created_at).toLocaleDateString() : ""}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "700", flex: 1, marginRight: 8 },
  meta: { fontSize: 13, color: "#666", marginBottom: 4 },
  lateTag: { fontSize: 12, color: "#dc2626", fontWeight: "600", marginTop: 4 },
  notes: { marginTop: 12, fontSize: 14, color: "#333", lineHeight: 20 },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    padding: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    gap: 6,
  },
  fileTag: { fontSize: 13, color: "#2563eb", flex: 1 },
  resubmitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#D97706",
    borderRadius: 10,
    padding: 13,
    marginTop: 16,
  },
  resubmitButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  editSection: {
    marginTop: 18,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginTop: 10, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fff",
  },
  textArea: { textAlignVertical: "top", minHeight: 90 },
  filePickRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    padding: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
  },
  filePickText: { fontSize: 13, color: "#374151", flex: 1 },
  editActionsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: { color: "#374151", fontWeight: "700", fontSize: 14 },
  submitButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#2563eb",
  },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  historyRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  historyStatus: { fontSize: 13, fontWeight: "500", textTransform: "capitalize" },
  historyComment: { fontSize: 12, color: "#666", marginTop: 2 },
  historyDate: { fontSize: 11, color: "#999", marginLeft: 8 },
  error: { textAlign: "center", marginTop: 40, color: "#999" },
});