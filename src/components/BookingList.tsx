"use client"
import { useAppSelector } from "@/redux/store"
import { removeBooking } from "@/redux/features/bookSlice"
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
export default function BookingList() {
    const bookItems = useAppSelector((state) => state.bookSlice.bookItems);
    const dispatch = useDispatch<AppDispatch>()
    console.log(bookItems)
    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <h2 className="text-2xl font-bold text-center mb-4 text-black">Your Campground Bookings</h2>

            {bookItems.length === 0 ? (
                <p className="text-center text-gray-500">No Campground Booking</p>
            ) : (
                <div className="space-y-4">
                    {bookItems.map((booking) => (
                        <div key={booking.campground} className="border p-4 rounded-lg shadow-md bg-white text-black">
                            <p> {booking.nameLastname}</p>
                            <p>{booking.tel}</p>
                            <p> {booking.campground}</p>
                            <p> {booking.bookDate}</p>

                  
                            <button
                                onClick={() => dispatch(removeBooking(booking))}  
                                className="mt-2 text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded"
                            >
                                Cancel Booking
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
