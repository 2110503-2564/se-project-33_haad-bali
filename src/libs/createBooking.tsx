export default async function createBooking(
    token: string,
    bookingData: { nameLastname: string; tel: string; campground: string; CheckInDate: string;CheckOutDate:string; userId: string ;breakfast:boolean;totalPrice: number;}
) {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/bookings/${bookingData.campground}`, {
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
