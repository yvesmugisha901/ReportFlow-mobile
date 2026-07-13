import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getReportById } from "../../api/reports";
import { submitReviewDecision } from "../../api/reviews";
import StatusBadge from "../../components/StatusBadge";

export default function ReviewDetailScreen({ route, navigation }) {
  const { reportId } = route.params;
  const [report, setReport] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    getReportById(reportId)
      .then(setReport)
      .catch((err) => console.warn("Failed to load report", err))
      .finally(() => setLoading(false));
  }, [reportId]);

  async function handleDecision(action) {
    setActing(true);
    try {
      await submitReviewDecision(reportId, { action, comment });
      Alert.alert("Done", `Report ${action.replace("_", " ")}.`);
      navigation.goBack();
    } catch (err) {
      Alert.alert("Action failed", err?.response?.data?.message || "Please try again.");
    } finally {
      setActing(false);
    }
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!report) return <Text style={styles.error}>Report not found.</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{report.title || report.type}</Text>
        <StatusBadge status={report.status} />
      </View>
      <Text style={styles.meta}>Submitted by: {report.submittedBy?.name}</Text>
      <Text style={styles.meta}>Department: {report.department}</Text>
      {report.notes ? <Text style={styles.notes}>{report.notes}</Text> : null}

      <Text style={styles.label}>Comment (optional)</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={4}
        placeholder="Add a comment for the employee..."
        value={comment}
        onChangeText={setComment}
      />

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approve]}
          onPress={() => handleDecision("approve")}
          disabled={acting}
        >
          <Text style={styles.actionText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.changes]}
          onPress={() => handleDecision("request_changes")}
          disabled={acting}
        >
          <Text style={styles.actionText}>Request Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.reject]}
          onPress={() => handleDecision("reject")}
          disabled={acting}
        >
          <Text style={styles.actionText}>Reject</Text>
        </TouchableOpacity>
      </View>
      {acting && <ActivityIndicator style={{ marginTop: 12 }} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "700", flex: 1, marginRight: 8 },
  meta: { fontSize: 13, color: "#666", marginBottom: 4 },
  notes: { marginTop: 12, fontSize: 14, color: "#333", lineHeight: 20 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 20, marginBottom: 6 },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  actionsRow: { flexDirection: "row", gap: 8, justifyContent: "space-between" },
  actionButton: { flex: 1, borderRadius: 8, padding: 12, alignItems: "center" },
  approve: { backgroundColor: "#16a34a" },
  changes: { backgroundColor: "#d97706" },
  reject: { backgroundColor: "#dc2626" },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  error: { textAlign: "center", marginTop: 40, color: "#999" },
});
