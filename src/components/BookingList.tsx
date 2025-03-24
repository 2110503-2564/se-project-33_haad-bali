"use client";
import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { removeBooking } from "@/redux/features/bookSlice";
import { getBooking } from "@/libs/getBooking";

export default function BookingList() {
  const dispatch = useAppDispatch();
  const { bookItems, loading, error } = useAppSelector((state) => state.bookSlice);

  // ใช้ custom hook สำหรับดึงข้อมูล
  const { loading: fetching } = getBooking();

  useEffect(() => {
    if (loading) {
      // ทำงานเมื่อข้อมูลการจองยังโหลดไม่เสร็จ
    }
  }, [loading]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-center mb-4 text-black">
        Your Campground Bookings
      </h2>

      {fetching && <p className="text-center text-gray-500">Loading bookings...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* ตรวจสอบว่า bookItems มีค่าหรือไม่ */}
      {bookItems && bookItems.length === 0 ? (
        <p className="text-center text-gray-500">No Campground Booking</p>
      ) : (
        <div className="space-y-4">
          {bookItems && bookItems.map((booking) => (
            <div key={booking._id} className="border p-4 rounded-lg shadow-md bg-white text-black">
              <p><strong>Name:</strong> {booking.nameLastname}</p>
              <p><strong>Phone:</strong> {booking.tel}</p>
              <p><strong>Campground:</strong> {booking.campground.name}</p>
              <p><strong>Check-in Date:</strong> {new Date(booking.bookDate).toLocaleDateString()}</p>

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
