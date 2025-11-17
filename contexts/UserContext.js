"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useGuide } from "./GuideContext";

const UserContext = createContext({
  user: null,
  loading: true,
  upgradeToGuide: async () => false
});

export function UserProvider({ children }) {
  const { data: session, status } = useSession();
  const { setGuideData } = useGuide();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncAttempted, setSyncAttempted] = useState(false);

  // Memoize the sync function to prevent recreation on each render
  const syncUser = useCallback(async () => {
    // Only proceed if we haven't already attempted a sync and session is authenticated
    if (syncAttempted || status !== "authenticated") return;
    
    // Set sync attempted flag to prevent multiple attempts
    setSyncAttempted(true);
    
    try {
      if (status === "authenticated" && session?.user) {
        const response = await fetch("/api/users/sync", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user || null);
          if (data.guide) setGuideData(data.guide);
        } else {
          setUser(null);
          setGuideData(null);
        }
      }
    } catch (error) {
      console.error("Error in user sync process:", error);
    } finally {
      setLoading(false);
    }
  }, [status, session, setGuideData, syncAttempted]);

  // Only trigger the sync effect when auth status changes
  useEffect(() => {
    if (status === "unauthenticated") {
      setUser(null);
      setGuideData(null);
      setLoading(false);
      return;
    }
    if (status === "authenticated") {
      syncUser();
    }
  }, [status, syncUser, setGuideData]);

  // Function to update user to guide role
  const upgradeToGuide = async (guideData) => {
    try {
      const response = await fetch("/api/users/sync", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(guideData),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Update guide data in the GuideContext
        if (data.guide) {
          setGuideData(data.guide);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error upgrading to guide:", error);
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, upgradeToGuide }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
} 