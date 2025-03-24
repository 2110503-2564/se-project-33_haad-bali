import { METHODS } from "http";
import { CampgroundsJson } from "../../interface";
import { headers } from "next/headers";

export default async function getUserProfile(token: string) {
  // Endpoint for user profile
  const url = "http://localhost:5000/api/v1/auth/me";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json", // Set content-type if needed
      },
    });

    // If the response is not ok, throw an error
    if (!response.ok) {
      const errorDetails = await response.json(); // You might get more details here
      throw new Error(`Failed to fetch user profile: ${errorDetails.message || "Unknown error"}`);
    }

    // If response is ok, return the parsed JSON
    return await response.json();
  } catch (error) {
    // Log the error and rethrow it
    console.error("Error fetching user profile:", error);
    throw error;
  }
}
