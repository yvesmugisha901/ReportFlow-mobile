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
      console.log("BADGE DEBUG — no user yet, skipping");
      return;
    }
    console.log("BADGE DEBUG — user.role:", JSON.stringify(user.role));

    try {
      const count = await getUnreadCount();
      console.log("BADGE DEBUG — unread count raw:", count);
      setUnreadNotifications(count);
    } catch (err) {
      console.warn("BADGE DEBUG — Failed to fetch unread notifications:", err.message);
    }

    if (user.role === ROLES.REVIEWER || user.role === ROLES.APPROVER) {
      try {
        const reviews = await getPendingReviews();
        console.log("BADGE DEBUG — pending reviews raw:", reviews, "length:", reviews?.length);
        setPendingApprovals(reviews.length);
      } catch (err) {
        console.warn("BADGE DEBUG — Failed to fetch pending approvals count:", err.message);
      }
    } else {
      console.log("BADGE DEBUG — role mismatch, got:", JSON.stringify(user.role), "expected one of:", ROLES.REVIEWER, ROLES.APPROVER);
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