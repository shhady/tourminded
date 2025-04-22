"use client";

import { createContext, useContext, useState, useEffect } from "react";

const GuideContext = createContext();

export function GuideProvider({ children }) {
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to update guide profile
  const updateGuideProfile = async (guideData, guideId) => {
    if (!guideId) return false;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/guides/${guideId}`, {
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

  // Update guide data when it changes
  const setGuideData = (guideData) => {
    setGuide(guideData);
  };

  return (
    <GuideContext.Provider value={{ guide, loading, updateGuideProfile, setGuideData }}>
      {children}
    </GuideContext.Provider>
  );
}

export function useGuide() {
  return useContext(GuideContext);
} 