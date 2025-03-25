export default async function createBooking(
    token: string,
    bookingData: { nameLastname: string; tel: string; campground: string; bookDate: string; userId: string }
) {
    const response = await fetch(`http://localhost:5000/api/v1/bookings/${bookingData.campground}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
        throw new Error("Failed to create booking");
    }

    return await response.json();
}
