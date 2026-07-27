import React, { useCallback, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../api/notifications";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../constants/config";

const EVENT_META = {
  report_due: { icon: "alarm-outline", color: "#D97706" },
  submitted: { icon: "paper-plane-outline", color: "#2563EB" },
  reviewed: { icon: "eye-outline", color: "#7C3AED" },
  approved: { icon: "checkmark-circle-outline", color: "#059669" },
  rejected: { icon: "close-circle-outline", color: "#DC2626" },
};

function getEventMeta(eventType) {
  return EVENT_META[eventType] || { icon: "notifications-outline", color: "#6B7280" };
}

function timeAgo(dateString) {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export default function NotificationsScreen({ navigation }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await getMyNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.warn("Failed to load notifications", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // UPDATED: pass fromNotifications so the detail screen knows to route
  // its back button back to this screen instead of its own tab's stack.
  function goToReport(reportId) {
    if (!reportId) return;
    const params = { reportId, fromNotifications: true };

    if (user?.role === ROLES.REVIEWER || user?.role === ROLES.APPROVER) {
      navigation.navigate("Approvals", { screen: "ReviewDetail", params });
    } else if (user?.role === ROLES.ADMIN) {
      navigation.navigate("Dashboard", { screen: "ReportDetail", params });
    } else {
      // employee
      navigation.navigate("Reports", { screen: "ReportDetail", params });
    }
  }

  async function handlePress(item) {
    if (!item.is_read) {
      // optimistic update so the tap feels instant
      setNotifications((prev) =>
        prev.map((n) => (n.notif_id === item.notif_id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await markAsRead(item.notif_id);
      } catch (err) {
        console.warn("Failed to mark notification as read", err);
      }
    }
    goToReport(item.report_id);
  }

  function handleLongPress(item) {
    Alert.alert("Delete notification?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setNotifications((prev) => prev.filter((n) => n.notif_id !== item.notif_id));
          if (!item.is_read) setUnreadCount((prev) => Math.max(0, prev - 1));
          try {
            await deleteNotification(item.notif_id);
          } catch (err) {
            console.warn("Failed to delete notification", err);
          }
        },
      },
    ]);
  }

  async function handleMarkAllRead() {
    const previous = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await markAllAsRead();
    } catch (err) {
      console.warn("Failed to mark all as read", err);
      setNotifications(previous);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? "Loading…" : unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#2563EB" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.notif_id)}
          contentContainerStyle={{ padding: 16, paddingTop: 4, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#2563EB" />
          }
          renderItem={({ item }) => {
            const meta = getEventMeta(item.event_type);
            return (
              <TouchableOpacity
                style={[styles.row, !item.is_read && styles.unreadRow]}
                onPress={() => handlePress(item)}
                onLongPress={() => handleLongPress(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrap, { backgroundColor: meta.color + "1A" }]}>
                  <Ionicons name={meta.icon} size={17} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.message}>{item.message}</Text>
                  <Text style={styles.date}>{timeAgo(item.created_at)}</Text>
                </View>
                {!item.is_read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptySubtitle}>You'll see updates on your reports here.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F3",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
  headerSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  markAllText: { fontSize: 12.5, fontWeight: "700", color: "#2563EB" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 10,
  },
  unreadRow: { backgroundColor: "#EFF6FF", borderColor: "#DBEAFE" },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  message: { fontSize: 13.5, color: "#111827", lineHeight: 18 },
  date: { fontSize: 11, color: "#9CA3AF", marginTop: 3 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2563EB" },
  empty: { alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#374151", marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: "#9CA3AF", marginTop: 4, textAlign: "center" },
});