"use client";

import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import getUserProfile from "@/libs/getUserProfile"; // Function to fetch user profile
import { toast } from "react-toastify"; // Importing toastify for notifications

export default function Account() {
  // State to store user profile data
  const [user, setUser] = useState<{ name: string; username: string; email: string; tel: string; createdAt: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      const session = await getSession();
      const token = (session?.user as any)?.token;

      if (token) {
        try {
          const profile = await getUserProfile(token);
          setUser({
            name: profile.data.name,
            username: profile.data.username,
            email: profile.data.email,
            tel: profile.data.telephone,
            createdAt: profile.data.createdAt,
          });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast.error("Could not load user profile.");
        }
      } else {
        toast.error("User not authenticated.");
      }
      setIsLoading(false);
    };

    fetchUserProfile();
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Your Account</h1>

      {/* User Profile Display */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Profile Details</h2>
        {user ? (
          <div>
            <div className="mb-2"><strong>Name:</strong> {user.name}</div>
            <div className="mb-2"><strong>Email:</strong> {user.email}</div>
            <div className="mb-2"><strong>Username:</strong> {user.username}</div>
            <div className="mb-2"><strong>Telephone:</strong> {user.tel}</div>
            <div className="mb-2"><strong>Account Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</div>
          </div>
        ) : (
          <p>No user data available</p>
        )}
      </div>
    </div>
  );
}
