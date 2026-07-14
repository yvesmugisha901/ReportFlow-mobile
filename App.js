import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/context/AuthContext";
import { BadgeCountsProvider } from "./src/context/BadgeCountsContext";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <AuthProvider>
      <BadgeCountsProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </BadgeCountsProvider>
    </AuthProvider>
  );
}