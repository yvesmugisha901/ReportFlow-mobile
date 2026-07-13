import React, { useCallback, useState } from "react";
import { View, FlatList, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getMyReports } from "../../api/reports";
import ReportCard from "../../components/ReportCard";

export default function MyReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyReports();
      setReports(data);
    } catch (err) {
      console.warn("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports])
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.newButton}
        onPress={() => navigation.navigate("SubmitReport")}
      >
        <Text style={styles.newButtonText}>+ Submit New Report</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <ReportCard
              report={item}
              onPress={() => navigation.navigate("ReportDetail", { reportId: item.id })}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>No reports yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  newButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  newButtonText: { color: "#fff", fontWeight: "600" },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
});
