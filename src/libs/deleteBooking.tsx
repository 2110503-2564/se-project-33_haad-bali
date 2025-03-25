export async function deleteBooking(token: string, bookingId: string) {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/bookings/${bookingId}`, {
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