import { CampgroundsJson } from "../../interface";
export default async function getBookings(token: string): Promise<CampgroundsJson> {
    const response = await fetch(
      `http://localhost:5000/api/v1/bookings`, // เอา ?limit ออก
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch bookings");
    }
    
    return await response.json();
  }
  