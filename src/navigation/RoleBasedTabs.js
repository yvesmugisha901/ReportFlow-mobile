import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CommonActions } from "@react-navigation/native";
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

// Whenever a tab that wraps a nested stack loses focus (blur), reset
// that nested stack's navigation STATE back to its first/home screen -
// not just its rendered view. This clears leftover screens like a
// report detail pushed there by a notification tap.
function resetOnBlur({ navigation, route }) {
  return {
    blur: () => {
      const tabState = navigation.getState();
      const thisTabRoute = tabState.routes.find((r) => r.name === route.name);
      const nestedState = thisTabRoute?.state;

      if (nestedState && nestedState.routes && nestedState.routes.length > 1) {
        const homeRouteName = nestedState.routes[0].name;
        navigation.dispatch({
          ...CommonActions.reset({
            index: 0,
            routes: [{ name: homeRouteName }],
          }),
          target: nestedState.key,
        });
      }
    },
  };
}

export default function RoleBasedTabs() {
  const { user } = useAuth();
  const { unreadNotifications, pendingApprovals } = useBadgeCounts();

  // Employees land on "Reports" (it functions as their dashboard).
  // Reviewers, Approvers, and Admins land on "Dashboard".
  const initialRoute = user?.role === ROLES.EMPLOYEE ? "Reports" : "Dashboard";

  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
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
        <Tab.Screen
          name="Reports"
          component={EmployeeStack}
          listeners={resetOnBlur}
        />
      )}

      {(user?.role === ROLES.REVIEWER || user?.role === ROLES.APPROVER) && (
        <Tab.Screen
          name="Dashboard"
          component={ReviewerDashboardStack}
          listeners={resetOnBlur}
        />
      )}
      {(user?.role === ROLES.REVIEWER || user?.role === ROLES.APPROVER) && (
        <Tab.Screen
          name="Approvals"
          component={ReviewerStack}
          listeners={resetOnBlur}
          options={{
            tabBarBadge: pendingApprovals > 0 ? pendingApprovals : undefined,
          }}
        />
      )}

      {user?.role === ROLES.ADMIN && (
        <Tab.Screen
          name="Dashboard"
          component={AdminStack}
          listeners={resetOnBlur}
        />
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