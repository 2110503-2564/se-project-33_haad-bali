export async function deleteBooking(token: string, bookingId: string) {
    const response = await fetch(`http://campgrounds.us-east-1.elasticbeanstalk.com/api/v1/bookings/${bookingId}`, {
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