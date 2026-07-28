import React, { createContext, useState, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import { login as apiLogin, getCurrentUser } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (token) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
    } catch (err) {
      // Token invalid or expired - clear it
      await SecureStore.deleteItemAsync("authToken");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email, password) {
    const { token } = await apiLogin(email, password);
    await SecureStore.setItemAsync("authToken", token);
    // Always source the user object from /auth/me, the same call
    // restoreSession() uses. This guarantees `user` has an identical
    // shape (and a correctly-populated `role`) whether it came from a
    // fresh login or a restored session, so RoleBasedTabs never sees
    // a mismatched/missing role right after login.
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }

  async function logout() {
    await SecureStore.deleteItemAsync("authToken");
    setUser(null);
  }

  // Merge updated fields (e.g. after editing profile) into the cached user
  function updateUser(updatedFields) {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}