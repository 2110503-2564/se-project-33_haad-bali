export async function updateBooking(token: string, bookingId: string, bookingData: any) {
    console.log("booking data",bookingData)
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
        throw new Error("Failed to update booking");
    }

    return await response.json();
}