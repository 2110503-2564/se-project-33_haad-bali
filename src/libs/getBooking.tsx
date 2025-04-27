import { BookingsJson } from "../../interface";

export default async function getBookings(
  token: string,
  page: number = 1,
  limit: number = 10
): Promise<BookingsJson> {
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/v1/bookings?page=${page}&limit=${limit}`,
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
  else {
    console.log(response)
  }
    
  return await response.json();
}