import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { getReportById } from "../../api/reports";
import StatusBadge from "../../components/StatusBadge";

export default function ReportDetailScreen({ route }) {
  const { reportId } = route.params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReportById(reportId)
      .then(setReport)
      .catch((err) => console.warn("Failed to load report", err))
      .finally(() => setLoading(false));
  }, [reportId]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!report) return <Text style={styles.error}>Report not found.</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{report.title || report.type}</Text>
        <StatusBadge status={report.status} />
      </View>
      <Text style={styles.meta}>Department: {report.department}</Text>
      <Text style={styles.meta}>
        Submitted: {new Date(report.submittedAt || report.createdAt).toLocaleString()}
      </Text>
      {report.notes ? <Text style={styles.notes}>{report.notes}</Text> : null}

      {report.statusHistory && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionTitle}>Status History</Text>
          {report.statusHistory.map((h, i) => (
            <View key={i} style={styles.historyRow}>
              <Text style={styles.historyStatus}>{h.status}</Text>
              <Text style={styles.historyDate}>{new Date(h.date).toLocaleString()}</Text>
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
  notes: { marginTop: 12, fontSize: 14, color: "#333", lineHeight: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  historyRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  historyStatus: { fontSize: 13, fontWeight: "500" },
  historyDate: { fontSize: 12, color: "#999" },
  error: { textAlign: "center", marginTop: 40, color: "#999" },
});
