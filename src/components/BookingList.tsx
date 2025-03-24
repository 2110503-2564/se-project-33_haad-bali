"use client"
import { useAppSelector } from "@/redux/store"
import { removeBooking } from "@/redux/features/bookSlice"
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";

export default function BookingList() {
    const bookItems = useAppSelector((state) => state.bookSlice.bookItems);
    const dispatch = useDispatch<AppDispatch>();
    
    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <h2 className="text-2xl font-bold text-center mb-4 text-black">Your Campground Bookings</h2>

            {bookItems.length === 0 ? (
                <p className="text-center text-gray-500">No Campground Booking</p>
            ) : (
                <div className="space-y-4">
                    {bookItems.map((booking, index) => (
                        <div key={index} className="border p-4 rounded-lg shadow-md bg-white text-black">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="font-semibold">Name:</div>
                                <div>{booking.nameLastname}</div>
                                
                                <div className="font-semibold">Telephone:</div>
                                <div>{booking.tel}</div>
                                
                                <div className="font-semibold">Campground:</div>
                                <div>{booking.campground}</div>
                                
                                {booking.checkInDate && (
                                    <>
                                        <div className="font-semibold">Check-in Date:</div>
                                        <div>{booking.checkInDate}</div>
                                    </>
                                )}
                                
                                {booking.checkOutDate && (
                                    <>
                                        <div className="font-semibold">Check-out Date:</div>
                                        <div>{booking.checkOutDate}</div>
                                    </>
                                )}
                                
                                
                                {booking.breakfast !== undefined && (
                                    <>
                                        <div className="font-semibold">Breakfast:</div>
                                        <div>{booking.breakfast ? 'Yes' : 'No'}</div>
                                    </>
                                )}
                            </div>
                  
                            <button
                                onClick={() => dispatch(removeBooking(booking))}  
                                className="mt-4 w-full text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded"
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
