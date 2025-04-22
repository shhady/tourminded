"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth, useUser as useClerkUser } from "@clerk/nextjs";
import { useGuide } from "./GuideContext";

const UserContext = createContext({
  user: null,
  loading: true,
  upgradeToGuide: async () => false
});

export function UserProvider({ children }) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user: clerkUser, isLoaded: clerkLoaded } = useClerkUser();
  const { setGuideData } = useGuide();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncAttempted, setSyncAttempted] = useState(false);

  // Memoize the sync function to prevent recreation on each render
  const syncUser = useCallback(async () => {
    // Only proceed if we haven't already attempted a sync and auth is loaded
    if (syncAttempted || !authLoaded || !clerkLoaded) return;
    
    // Set sync attempted flag to prevent multiple attempts
    setSyncAttempted(true);
    
    try {
      if (isSignedIn && clerkUser?.id) {
        // First try the sync endpoint
        try {
          const response = await fetch("/api/users/sync");
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            // Update guide data in the GuideContext
            if (data.guide) {
              setGuideData(data.guide);
            }
            setLoading(false);
            return;
          }
        } catch (syncError) {
          console.error("Error syncing user:", syncError);
        }
        
        // If that fails, try to fetch by Clerk ID
        try {
          const clerkIdResponse = await fetch(`/api/users/clerk/${clerkUser.id}`);
          
          if (clerkIdResponse.ok) {
            const data = await clerkIdResponse.json();
            if (data.success) {
              setUser(data.user);
              // Update guide data in the GuideContext
              if (data.guide) {
                setGuideData(data.guide);
              }
              setLoading(false);
              return;
            }
          }
        } catch (clerkIdError) {
          console.error("Error fetching user by Clerk ID:", clerkIdError);
        }
        
        // If user doesn't exist in our DB yet, create them
        try {
          const createResponse = await fetch("/api/users/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          });
          
          if (createResponse.ok) {
            const data = await createResponse.json();
            setUser(data.user);
            // Update guide data in the GuideContext if available
            if (data.guide) {
              setGuideData(data.guide);
            }
          }
        } catch (createError) {
          console.error("Error creating user:", createError);
        }
      }
    } catch (error) {
      console.error("Error in user sync process:", error);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, clerkUser, authLoaded, clerkLoaded, setGuideData, syncAttempted]);

  // Only trigger the sync effect when auth status changes
  useEffect(() => {
    if (authLoaded && clerkLoaded) {
      // Reset the user when not signed in
      if (!isSignedIn) {
        setUser(null);
        setGuideData(null);
        setLoading(false);
        return;
      }
      
      syncUser();
    }
  }, [authLoaded, clerkLoaded, isSignedIn, syncUser, setGuideData]);

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