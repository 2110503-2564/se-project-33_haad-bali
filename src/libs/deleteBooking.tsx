export async function deleteBooking(token: string, bookingId: string) {
    const response = await fetch(`http://localhost:5000/api/v1/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to delete booking");
    }

    return await response.json();
}