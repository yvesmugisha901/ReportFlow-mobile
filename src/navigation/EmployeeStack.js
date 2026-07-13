import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyReportsScreen from "../screens/employee/MyReportsScreen";
import SubmitReportScreen from "../screens/employee/SubmitReportScreen";
import ReportDetailScreen from "../screens/employee/ReportDetailScreen";

const Stack = createNativeStackNavigator();

export default function EmployeeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MyReports" component={MyReportsScreen} options={{ title: "My Reports" }} />
      <Stack.Screen name="SubmitReport" component={SubmitReportScreen} options={{ title: "Submit Report" }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: "Report Detail" }} />
    </Stack.Navigator>
  );
}
