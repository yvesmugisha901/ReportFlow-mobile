import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../screens/admin/DashboardScreen";
import ReportDetailScreen from "../screens/employee/ReportDetailScreen";

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} options={{ title: "Dashboard" }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: "Report Detail" }} />
    </Stack.Navigator>
  );
}