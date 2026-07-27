import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import AuthStack from "./AuthStack";
import RoleBasedTabs from "./RoleBasedTabs";

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  // Wait for the auth check AND for the user object to actually have
  // a role before mounting the tab navigator. RoleBasedTabs decides
  // its initialRouteName only once, on first mount - if user.role is
  // still undefined at that exact moment (e.g. right after a fresh
  // login response), it locks onto the wrong tab permanently.
  const userReady = user && user.role;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        userReady ? (
          // key forces a full, fresh remount of the tab navigator on
          // every distinct login, so initialRouteName is always
          // re-evaluated against a fully-populated user object.
          <RoleBasedTabs key={user.user_id ?? user.email ?? user.role} />
        ) : (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
          </View>
        )
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}