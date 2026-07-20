import React, { useCallback, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getMyReportsPaged } from "../../api/reports";
import ReportCard from "../../components/ReportCard";
import { normalizeReport } from "../../utils/reportUtils";

const PAGE_SIZE = 10;

export default function AllReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const data = await getMyReportsPaged({ page: pageNum, limit: PAGE_SIZE });
      setReports(data.reports);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.warn("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(page);
    }, [load, page])
  );

  const normalized = reports.map(normalizeReport);

  function goPrev() {
    if (page > 1) setPage((p) => p - 1);
  }

  function goNext() {
    if (page < totalPages) setPage((p) => p + 1);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Reports</Text>
        <Text style={styles.headerSubtitle}>Page {page} of {totalPages}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#2563eb" />
      ) : (
        <FlatList
          data={normalized}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingTop: 4, flexGrow: 1 }}
          renderItem={({ item }) => (
            <ReportCard
              report={item}
              onPress={() => navigation.navigate("ReportDetail", { reportId: item.id })}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>No reports found.</Text>}
        />
      )}

      <View style={styles.pagerRow}>
        <TouchableOpacity
          style={[styles.pagerButton, page <= 1 && styles.pagerButtonDisabled]}
          onPress={goPrev}
          disabled={page <= 1}
        >
          <Ionicons name="chevron-back" size={18} color={page <= 1 ? "#9CA3AF" : "#2563eb"} />
          <Text style={[styles.pagerButtonText, page <= 1 && styles.pagerButtonTextDisabled]}>Prev</Text>
        </TouchableOpacity>

        <Text style={styles.pagerIndicator}>{page} / {totalPages}</Text>

        <TouchableOpacity
          style={[styles.pagerButton, page >= totalPages && styles.pagerButtonDisabled]}
          onPress={goNext}
          disabled={page >= totalPages}
        >
          <Text style={[styles.pagerButtonText, page >= totalPages && styles.pagerButtonTextDisabled]}>Next</Text>
          <Ionicons name="chevron-forward" size={18} color={page >= totalPages ? "#9CA3AF" : "#2563eb"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F3",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
  headerSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
  pagerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F0F1F3",
  },
  pagerButton: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 6, paddingHorizontal: 10 },
  pagerButtonDisabled: { opacity: 0.5 },
  pagerButtonText: { color: "#2563eb", fontWeight: "700", fontSize: 13.5 },
  pagerButtonTextDisabled: { color: "#9CA3AF" },
  pagerIndicator: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
});