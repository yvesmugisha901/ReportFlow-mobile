import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useAuth } from "./AuthContext";
import { getUnreadCount } from "../api/notifications";
import { getPendingReviews } from "../api/reviews";
import { ROLES } from "../constants/config";

const BadgeCountsContext = createContext({
  unreadNotifications: 0,
  pendingApprovals: 0,
  refreshBadges: () => {},
});

const POLL_INTERVAL = 30000;

export function BadgeCountsProvider({ children }) {
  const { user } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const intervalRef = useRef(null);

  const refreshBadges = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const count = await getUnreadCount();
      setUnreadNotifications(count);
    } catch (err) {
      console.warn("Failed to fetch unread notifications:", err.message);
    }

    if (user.role === ROLES.REVIEWER || user.role === ROLES.APPROVER) {
      try {
        const reviews = await getPendingReviews();
        setPendingApprovals(reviews.length);
      } catch (err) {
        console.warn("Failed to fetch pending approvals count:", err.message);
      }
    }
  }, [user]);

  useEffect(() => {
    refreshBadges();
    intervalRef.current = setInterval(refreshBadges, POLL_INTERVAL);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshBadges();
    });
    return () => {
      clearInterval(intervalRef.current);
      sub.remove();
    };
  }, [refreshBadges]);

  return (
    <BadgeCountsContext.Provider value={{ unreadNotifications, pendingApprovals, refreshBadges }}>
      {children}
    </BadgeCountsContext.Provider>
  );
}

export function useBadgeCounts() {
  return useContext(BadgeCountsContext);
}