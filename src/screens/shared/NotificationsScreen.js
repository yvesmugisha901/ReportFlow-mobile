import React, { useCallback, useState } from "react";
import { View, FlatList, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getMyNotifications, markNotificationRead } from "../../api/notifications";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (err) {
      console.warn("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handlePress(item) {
    if (!item.read) {
      await markNotificationRead(item.id);
      load();
    }
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <FlatList
      style={styles.container}
      data={notifications}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.row, !item.read && styles.unread]}
          onPress={() => handlePress(item)}
        >
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No notifications.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  row: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  unread: { backgroundColor: "#eff6ff" },
  message: { fontSize: 14, marginBottom: 4 },
  date: { fontSize: 12, color: "#999" },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
});
