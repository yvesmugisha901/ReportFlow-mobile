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
import { Ionicons } from "@expo/vector-icons";
import { getReportById } from "../../api/reports";
import { submitReviewDecision } from "../../api/reviews";
import StatusBadge from "../../components/StatusBadge";
import { timeAgo, initials } from "../../utils/timeAgo";

export default function ReviewDetailScreen({ route, navigation }) {
  const { reportId } = route.params; // role no longer needed — backend infers it from req.user
  const [report, setReport] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null); // holds which action is in-flight

  useEffect(() => {
    getReportById(reportId)
      .then((r) => setReport(r.report ?? r))
      .catch((err) => console.warn("Failed to load report", err))
      .finally(() => setLoading(false));
  }, [reportId]);

  async function handleDecision(action) {
    // action: "approve" | "changes" | "reject"
    if (action === "reject" && !comment.trim()) {
      Alert.alert("Comment required", "A comment is required when rejecting a report.");
      return;
    }
    setActing(action);
    try {
      await submitReviewDecision(reportId, { action, comment });
      const doneLabel = action === "changes" ? "sent back for changes" : `${action}d`;
      Alert.alert("Done", `Report ${doneLabel}.`);
      navigation.goBack();
    } catch (err) {
      Alert.alert("Action failed", err?.response?.data?.error || "Please try again.");
    } finally {
      setActing(null);
    }
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} color="#2563EB" />;
  if (!report) return <Text style={styles.error}>Report not found.</Text>;

  const submitter = report.submittedBy || report.employee || {};
  const reviewLogs = report.reviewLogs || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <Text style={styles.title}>{report.title || report.type}</Text>
          <StatusBadge status={report.status} />
        </View>

        <View style={styles.submitterRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(submitter.name || submitter.full_name)}</Text>
          </View>
          <View>
            <Text style={styles.submitterName}>{submitter.name || submitter.full_name || "Unknown"}</Text>
            <Text style={styles.submitterMeta}>
              {report.department || "—"} · {timeAgo(report.submittedAt || report.created_at)}
            </Text>
          </View>
        </View>

        {report.is_late ? (
          <View style={styles.lateBanner}>
            <Ionicons name="alert-circle" size={14} color="#DC2626" />
            <Text style={styles.lateBannerText}>Submitted after the deadline</Text>
          </View>
        ) : null}
      </View>

      {/* Content */}
      {report.content ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content</Text>
          <Text style={styles.contentText}>{report.content}</Text>
        </View>
      ) : null}

      {report.file_name ? (
        <View style={styles.attachmentRow}>
          <Ionicons name="document-attach-outline" size={18} color="#2563EB" />
          <Text style={styles.attachmentText} numberOfLines={1}>
            {report.file_name}
          </Text>
        </View>
      ) : null}

      {/* Review history */}
      {reviewLogs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Review History</Text>
          {reviewLogs.map((log) => (
            <View key={log.log_id} style={styles.historyRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyStatus}>
                  {log.action?.replace(/_/g, " ")} · {log.reviewer?.full_name || "Reviewer"} ({log.stage})
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

      {/* Decision */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Decision</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          placeholder="Add a comment for the employee (required when rejecting)..."
          placeholderTextColor="#9CA3AF"
          value={comment}
          onChangeText={setComment}
        />

        <View style={styles.actionsRow}>
          <ActionButton
            label="Approve"
            icon="checkmark-circle"
            color="#16A34A"
            loading={acting === "approve"}
            disabled={!!acting}
            onPress={() => handleDecision("approve")}
          />
          <ActionButton
            label="Changes"
            icon="create-outline"
            color="#D97706"
            loading={acting === "changes"}
            disabled={!!acting}
            onPress={() => handleDecision("changes")}
          />
          <ActionButton
            label="Reject"
            icon="close-circle"
            color="#DC2626"
            loading={acting === "reject"}
            disabled={!!acting}
            onPress={() => handleDecision("reject")}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function ActionButton({ label, icon, color, loading, disabled, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: color, opacity: disabled && !loading ? 0.5 : 1 }]}
      onPress={onPress}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <Ionicons name={icon} size={16} color="#fff" />
          <Text style={styles.actionText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  headerCard: {
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 19, fontWeight: "800", color: "#111827", flex: 1, marginRight: 8 },
  submitterRow: { flexDirection: "row", alignItems: "center", marginTop: 14 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  submitterName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  submitterMeta: { fontSize: 12, color: "#6B7280", marginTop: 1 },
  lateBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 8,
    marginTop: 14,
    gap: 6,
  },
  lateBannerText: { color: "#DC2626", fontSize: 12.5, fontWeight: "600", marginLeft: 4 },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 18,
  },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 },
  contentText: { fontSize: 14.5, color: "#1F2937", lineHeight: 21 },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  attachmentText: { color: "#2563EB", fontSize: 13, fontWeight: "600", marginLeft: 6, flexShrink: 1 },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  historyStatus: { fontSize: 13, fontWeight: "600", color: "#111827", textTransform: "capitalize" },
  historyComment: { fontSize: 12.5, color: "#6B7280", marginTop: 3 },
  historyDate: { fontSize: 11, color: "#9CA3AF", marginLeft: 8 },
  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 14,
    fontSize: 14,
    color: "#111827",
  },
  actionsRow: { flexDirection: "row", gap: 10, justifyContent: "space-between" },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  actionText: { color: "#fff", fontWeight: "700", fontSize: 12.5, marginLeft: 4 },
  error: { textAlign: "center", marginTop: 40, color: "#999" },
});