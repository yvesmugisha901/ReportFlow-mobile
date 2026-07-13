import React, { useCallback, useState } from "react";
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getPendingReviews } from "../../api/reviews";
import ReportCard from "../../components/ReportCard";

export default function PendingApprovalsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPendingReviews();
      setReports(data);
    } catch (err) {
      console.warn("Failed to load pending reviews", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
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
              onPress={() => navigation.navigate("ReviewDetail", { reportId: item.id })}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>No pending approvals.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
});
