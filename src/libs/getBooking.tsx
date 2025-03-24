"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addBooking } from "@/redux/features/bookSlice";
import { BookingItem } from "../../interface";

// Custom hook สำหรับดึงข้อมูลการจอง
export const getBooking = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/v1/bookings", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const data = await res.json();
                if (data.success) {
                    data.data.forEach((booking: BookingItem) => dispatch(addBooking(booking)));
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [dispatch]);

    return { loading };
};
