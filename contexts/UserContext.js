"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth, useUser as useClerkUser } from "@clerk/nextjs";

const UserContext = createContext();

export function UserProvider({ children }) {
  const { isSignedIn } = useAuth();
  const { user: clerkUser, isLoaded: clerkLoaded } = useClerkUser();
  const [user, setUser] = useState(null);
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function syncUser() {
      if (isSignedIn && clerkUser?.id && clerkLoaded) {
        try {
          // First try the sync endpoint
          const response = await fetch("/api/users/sync");
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setGuide(data.guide);
          } else {
            // If that fails, try to fetch by Clerk ID
            const clerkIdResponse = await fetch(`/api/users/clerk/${clerkUser.id}`);
            
            if (clerkIdResponse.ok) {
              const data = await clerkIdResponse.json();
              if (data.success) {
                setUser(data.user);
                setGuide(data.guide);
              } else {
                // If user doesn't exist in our DB yet, create them
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
                }
              }
            }
          }
        } catch (error) {
          console.error("Error syncing user:", error);
        } finally {
          setLoading(false);
        }
      } else if (clerkLoaded) {
        setUser(null);
        setGuide(null);
        setLoading(false);
      }
    }

    syncUser();
  }, [isSignedIn, clerkUser, clerkLoaded]);

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
        setGuide(data.guide);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error upgrading to guide:", error);
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ user, guide, loading, upgradeToGuide }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
} 