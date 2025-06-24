"use client";
import React from "react";

const ConnectCalendarButton = () => {
  const handleConnect = () => {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email",
      access_type: "offline",
      prompt: "consent",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return (
    <button
      type="button"
      onClick={handleConnect}
      className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition-colors duration-200 text-lg mt-4"
    >
      Connect Google Calendar
    </button>
  );
};

export default ConnectCalendarButton; 