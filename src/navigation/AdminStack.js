import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../screens/admin/DashboardScreen";
import ReportDetailScreen from "../screens/employee/ReportDetailScreen";
import DepartmentsScreen from "../screens/admin/DepartmentsScreen";
import CreateDepartmentScreen from "../screens/admin/CreateDepartmentScreen";
import TeamsScreen from "../screens/admin/TeamsScreen";
import CreateTeamScreen from "../screens/admin/CreateTeamScreen";
import RegisterEmployeeScreen from "../screens/admin/RegisterEmployeeScreen";
import UsersScreen from "../screens/admin/UsersScreen";
import UserDetailScreen from "../screens/admin/UserDetailScreen";

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} options={{ title: "Dashboard" }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: "Report Detail" }} />

      <Stack.Screen name="Departments" component={DepartmentsScreen} options={{ title: "Departments" }} />
      <Stack.Screen name="CreateDepartment" component={CreateDepartmentScreen} options={{ title: "New Department" }} />
      <Stack.Screen name="Teams" component={TeamsScreen} options={{ title: "Teams" }} />
      <Stack.Screen name="CreateTeam" component={CreateTeamScreen} options={{ title: "New Team" }} />

      <Stack.Screen name="RegisterEmployee" component={RegisterEmployeeScreen} options={{ title: "Register Employee" }} />
      <Stack.Screen name="Users" component={UsersScreen} options={{ title: "Users" }} />
      <Stack.Screen name="UserDetail" component={UserDetailScreen} options={{ title: "User Details" }} />
    </Stack.Navigator>
  );
}