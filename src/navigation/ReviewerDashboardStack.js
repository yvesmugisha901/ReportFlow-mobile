import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ReviewerDashboardScreen from "../screens/reviewer/ReviewerDashboardScreen";
import PendingApprovalsScreen from "../screens/reviewer/PendingApprovalsScreen";
import ReviewDetailScreen from "../screens/reviewer/ReviewDetailScreen";

const Stack = createNativeStackNavigator();

export default function ReviewerDashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ReviewerDashboardHome"
        component={ReviewerDashboardScreen}
        options={{ title: "Dashboard" }}
      />
      <Stack.Screen
        name="PendingApprovals"
        component={PendingApprovalsScreen}
        options={{ title: "Pending Approvals" }}
      />
      <Stack.Screen
        name="ReviewDetail"
        component={ReviewDetailScreen}
        options={{ title: "Review Report" }}
      />
    </Stack.Navigator>
  );
}