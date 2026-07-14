import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useBadgeCounts } from "../context/BadgeCountsContext";
import { ROLES } from "../constants/config";
import EmployeeStack from "./EmployeeStack";
import ReviewerStack from "./ReviewerStack";
import ReviewerDashboardStack from "./ReviewerDashboardStack";
import AdminStack from "./AdminStack";
import NotificationsScreen from "../screens/shared/NotificationsScreen";
import ProfileScreen from "../screens/shared/ProfileScreen";

const Tab = createBottomTabNavigator();

const ICONS = {
  Reports: "document-text-outline",
  Approvals: "checkmark-done-outline",
  Dashboard: "grid-outline",
  Notifications: "notifications-outline",
  Profile: "person-outline",
};

export default function RoleBasedTabs() {
  const { user } = useAuth();
  const { unreadNotifications, pendingApprovals } = useBadgeCounts();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name] || "ellipse-outline"} size={size} color={color} />
        ),
      })}
    >
      {user?.role === ROLES.EMPLOYEE && (
        <Tab.Screen name="Reports" component={EmployeeStack} />
      )}

      {(user?.role === ROLES.REVIEWER || user?.role === ROLES.APPROVER) && (
        <Tab.Screen name="Dashboard" component={ReviewerDashboardStack} />
      )}
      {(user?.role === ROLES.REVIEWER || user?.role === ROLES.APPROVER) && (
        <Tab.Screen
          name="Approvals"
          component={ReviewerStack}
          options={{
            tabBarBadge: pendingApprovals > 0 ? pendingApprovals : undefined,
          }}
        />
      )}

      {user?.role === ROLES.ADMIN && (
        <Tab.Screen name="Dashboard" component={AdminStack} />
      )}

      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarBadge: unreadNotifications > 0 ? unreadNotifications : undefined,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}