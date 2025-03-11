"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";

const GuideContext = createContext();

export function GuideProvider({ children }) {
  const { user, guide: initialGuide } = useUser();
  const [guide, setGuide] = useState(initialGuide);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setGuide(initialGuide);
  }, [initialGuide]);

  // Function to update guide profile
  const updateGuideProfile = async (guideData) => {
    if (!user || user.role !== "guide") return false;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/guides/${guide._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(guideData),
      });
      
      if (response.ok) {
        const updatedGuide = await response.json();
        setGuide(updatedGuide);
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (error) {
      console.error("Error updating guide profile:", error);
      setLoading(false);
      return false;
    }
  };

  return (
    <GuideContext.Provider value={{ guide, loading, updateGuideProfile }}>
      {children}
    </GuideContext.Provider>
  );
}

export function useGuide() {
  return useContext(GuideContext);
} 