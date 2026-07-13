import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { getReportById } from "../../api/reports";
import { SERVER_ORIGIN } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import { normalizeReport } from "../../utils/reportUtils";

export default function ReportDetailScreen({ route }) {
  const { reportId } = route.params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getReportById(reportId)
      .then(setReport)
      .catch((err) => console.warn("Failed to load report", err))
      .finally(() => setLoading(false));
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

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!report) return <Text style={styles.error}>Report not found.</Text>;

  const normalized = normalizeReport(report);
  const reviewLogs = report.reviewLogs || [];

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
      {report.content ? <Text style={styles.notes}>{report.content}</Text> : null}

      {report.file_name ? (
        <TouchableOpacity
          style={styles.fileRow}
          onPress={handleDownload}
          disabled={downloading}
        >
          <Ionicons name="document-attach-outline" size={18} color="#2563eb" />
          <Text style={styles.fileTag} numberOfLines={1}>{report.file_name}</Text>
          {downloading ? (
            <ActivityIndicator size="small" color="#2563eb" style={{ marginLeft: 8 }} />
          ) : (
            <Ionicons name="download-outline" size={18} color="#2563eb" style={{ marginLeft: 8 }} />
          )}
        </TouchableOpacity>
      ) : null}

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
  sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  historyRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  historyStatus: { fontSize: 13, fontWeight: "500", textTransform: "capitalize" },
  historyComment: { fontSize: 12, color: "#666", marginTop: 2 },
  historyDate: { fontSize: 11, color: "#999", marginLeft: 8 },
  error: { textAlign: "center", marginTop: 40, color: "#999" },
});