export async function updateBooking(token: string, bookingId: string, bookingData: any) {
    const response = await fetch(`http://localhost:5000/api/v1/bookings/${bookingId}`, {
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