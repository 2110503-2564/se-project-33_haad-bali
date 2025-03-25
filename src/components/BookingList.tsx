"use client";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { addBooking, removeBooking, resetBookings } from "@/redux/features/bookSlice";
import { useEffect, useState } from "react";
import getBookings from "@/libs/getBooking";
import { getSession, useSession } from "next-auth/react";
import { FiCalendar, FiUser, FiPhone, FiMapPin, FiX, FiCoffee } from "react-icons/fi";
import { updateBooking } from "@/libs/updateBooking"; 
import { deleteBooking } from "@/libs/deleteBooking";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import getUserProfile from "@/libs/getUserProfile";

interface User {
  _id: string;
  username: string;
  name: string;
  telephone: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface BookingItem {
  _id: string;
  user: User | string;
  campground: {
    _id: string;
    name: string;
    address: string;
    tel: string;
    price: number;
    __v: number;
  };
  checkInDate: string;
  checkOutDate: string;
  breakfast: boolean;
  tel: string;
  createdAt: string;
}

export default function BookingList() {
    const { data: session, status } = useSession();
    const dispatch = useAppDispatch();
    const bookItems = useAppSelector((state) => state.bookSlice.bookItems) as BookingItem[];
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [editingBooking, setEditingBooking] = useState<BookingItem | null>(null);
    const [editFormData, setEditFormData] = useState({
        checkInDate: null as Date | null,
        checkOutDate: null as Date | null,
        breakfast: false
    });
    const [stayDuration, setStayDuration] = useState<number>(0);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                const session = await getSession();
                const token = (session?.user as any)?.token;
                if (token) {
                    const profile = await getUserProfile(token);
                    setCurrentUser(profile.data);
                }
            } catch (error) {
                toast.error("Could not load user data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleDelete = async (bookingId: string) => {
        if (status === "authenticated" && session?.user) {
            try {
                const token = (session?.user as any)?.token;
                await deleteBooking(token, bookingId);
                dispatch(removeBooking({ _id: bookingId }));
                setError("");
                toast.success("Booking deleted successfully");
            } catch (error) {
                console.error("Delete failed:", error);
                setError("Failed to delete booking");
                toast.error("Failed to delete booking");
            }
        } else {
            setError("User not authenticated.");
            toast.error("Please login to manage bookings");
        }
    };

    const handleEditClick = (booking: BookingItem) => {
        setEditingBooking(booking);
        const checkIn = booking.checkInDate ? new Date(booking.checkInDate) : new Date();
        const checkOut = booking.checkOutDate ? new Date(booking.checkOutDate) : new Date(new Date().setDate(checkIn.getDate() + 1));
        
        setEditFormData({
            checkInDate: checkIn,
            checkOutDate: checkOut,
            breakfast: booking.breakfast || false
        });

        if (checkIn && checkOut) {
            const timeDiff = checkOut.getTime() - checkIn.getTime();
            setStayDuration(Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
        }
    };

    const handleCheckInChange = (date: Date | null) => {
        if (date) {
            setEditFormData(prev => {
                const newState = {...prev, checkInDate: date};
                
                if (newState.checkOutDate && date > newState.checkOutDate) {
                    const newCheckOut = new Date(date);
                    newCheckOut.setDate(newCheckOut.getDate() + 1);
                    newState.checkOutDate = newCheckOut;
                    toast.info("Check-out date adjusted to next day");
                }
                
                if (newState.checkOutDate) {
                    const timeDiff = newState.checkOutDate.getTime() - date.getTime();
                    setStayDuration(Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
                }
                
                return newState;
            });
            setError("");
        }
    };

    const handleCheckoutDateChange = (date: Date | null) => {
        if (date && editFormData.checkInDate) {
            const start = new Date(editFormData.checkInDate);
            const end = new Date(date);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            
            const timeDiff = end.getTime() - start.getTime();
            const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            
            if (nights > 3) {
                const correctedCheckoutDate = new Date(start);
                correctedCheckoutDate.setDate(correctedCheckoutDate.getDate() + 3);
                setEditFormData({...editFormData, checkOutDate: correctedCheckoutDate});
                setStayDuration(3);
                
                toast.warning(
                    <div>
                        <p className="font-medium">Maximum stay duration is 3 nights</p>
                        <p className="text-sm">Check-out date adjusted to {correctedCheckoutDate.toLocaleDateString()}</p>
                    </div>,
                    { autoClose: 5000 }
                );
            } else {
                setEditFormData({...editFormData, checkOutDate: date});
                setStayDuration(nights);
                setError("");
                
                if (nights === 2) {
                    toast.info("You can add 1 more night (maximum 3 nights)");
                }
            }
        } else {
            setEditFormData({...editFormData, checkOutDate: date});
            setStayDuration(0);
        }
    };

    const handleUpdate = async () => {
        if (!editingBooking || !editFormData.checkInDate || !editFormData.checkOutDate || status !== "authenticated" || !session?.user) {
            setError("Please select valid check-in and check-out dates");
            toast.error("Please fill all required fields");
            return;
        }

        if (editFormData.checkOutDate <= editFormData.checkInDate) {
            setError("Check-out date must be after check-in date");
            toast.error("Invalid date range");
            return;
        }

        try {
            const token = (session?.user as any)?.token;
            const updatedData = {
                ...editingBooking,
                checkInDate: editFormData.checkInDate.toISOString().split('T')[0],
                checkOutDate: editFormData.checkOutDate.toISOString().split('T')[0],
                breakfast: editFormData.breakfast
            };

            const response = await updateBooking(token, editingBooking._id, updatedData);
            
            if (response.success) {
                dispatch(removeBooking({ _id: editingBooking._id }));
                dispatch(addBooking(response.data));
                setError("");
                setEditingBooking(null);
                toast.success("Booking updated successfully!");
            } else {
                setError(response.message || "Failed to update booking");
                toast.error(response.message || "Failed to update booking");
            }
        } catch (error) {
            console.error("Update failed:", error);
            setError("Failed to update booking");
            toast.error("Failed to update booking");
        }
    };

    const fetchBookings = async () => {
        if (status === "authenticated" && session?.user) {
            try {
                const token = (session?.user as any)?.token;
                if (token) {
                    setIsLoading(true);
                    setError("");
                    const bookingsResponse = await getBookings(token);
                    
                    if (Array.isArray(bookingsResponse.data)) {
                        dispatch(resetBookings());
                        bookingsResponse.data.forEach((booking: BookingItem) => dispatch(addBooking(booking)));
                    } else {
                        setError("Bookings data is not an array.");
                    }
                } else {
                    setError("No token found in session.");
                }
            } catch (error: any) {
                console.error("Failed to load bookings:", error);
                setError("Failed to load bookings");
            } finally {
                setIsLoading(false);
            }
        } else {
            setError("User not authenticated or session expired.");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [session, status]);
    const getUserDisplay = (user: User | string | undefined, currentUser: User | null) => {
        // If no user data is available
        if (!user) return { 
            name: "N/A", 
            username: "N/A", 
            telephone: "N/A",
            displayName: "N/A",
            isCurrentUser: false
        };
    
        // If `user` is a string (user ID), check if it matches the current user
        if (typeof user === 'string') {
            const isCurrentUser = user === currentUser?._id;
            return {
                name: isCurrentUser ? currentUser?.name || "User" : "Unknown User",
                username: isCurrentUser ? currentUser?.username || "Unknown" : user, // Show the ID for unknown users
                telephone: isCurrentUser ? currentUser?.telephone || "N/A" : "N/A",
                displayName: isCurrentUser ? currentUser?.name || "User" : "Unknown",
                isCurrentUser
            };
        }
    
        // If `user` is an object, use its properties
        return {
            name: user.name,
            username: user.username,
            telephone: user.telephone,
            displayName: user.name,
            isCurrentUser: user._id === currentUser?._id
        };
    };
    

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Bookings</h1>
                <p className="text-gray-600">
                    {bookItems.length === 0 
                        ? "You don't have any bookings yet" 
                        : `Showing ${bookItems.length} ${bookItems.length === 1 ? 'booking' : 'bookings'}`}
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <FiX className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {bookItems.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                        <FiCalendar className="w-full h-full" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings yet</h3>
                    <p className="text-gray-500">Your upcoming bookings will appear here</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {bookItems.map((booking, index) => {
                        const userInfo = getUserDisplay(booking.user, currentUser);
                        return (
                            <div key={index} className="bg-white overflow-hidden shadow rounded-lg transition-all duration-200 hover:shadow-md">
                                <div className="px-6 py-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                                <FiMapPin className="mr-2 text-blue-500" />
                                                {booking.campground?.name || "Unknown Campground"}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">Booking #{index + 1}</p>
                                        </div>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Confirmed
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center">
                                            <FiUser className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-500">User</p>
                                                <div>
                                                    <p className="text-sm text-gray-900">{userInfo.name}</p>
                                                    <p className="text-xs text-gray-500">@{userInfo.username}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <FiPhone className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                                <p className="text-sm text-gray-900">{booking.campground?.tel}</p>
                                            </div>
                                        </div>
                                        {booking.checkInDate && (
                                            <div className="flex items-center">
                                                <FiCalendar className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-500">Check-in Date</p>
                                                    <p className="text-sm text-gray-900">{booking.checkInDate}</p>
                                                </div>
                                            </div>
                                        )}
                                        {booking.checkOutDate && (
                                            <div className="flex items-center">
                                                <FiCalendar className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-500">Check-out Date</p>
                                                    <p className="text-sm text-gray-900">{booking.checkOutDate}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center">
                                            <FiCoffee className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-500">Breakfast</p>
                                                <p className="text-sm text-gray-900">
                                                    {booking.breakfast ? "Included (+฿200)" : "Not included"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-3 flex justify-end">
                                    <button
                                        onClick={() => handleDelete(booking._id)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                                    >
                                        Cancel Booking
                                    </button>
                                    <button
                                        onClick={() => handleEditClick(booking)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ml-2"
                                    >
                                        Edit Booking
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

{editingBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Edit Booking</h3>
                            <button 
                                onClick={() => setEditingBooking(null)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <FiX className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Campground
                                </label>
                                <p className="text-gray-900">{editingBooking.campground?.name || "Unknown"}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Check-in Date
                                </label>
                                <DatePicker
                                    selected={editFormData.checkInDate}
                                    onChange={handleCheckInChange}
                                    minDate={new Date()}
                                    className="w-full p-3 border border-gray-300 rounded-md text-gray-900"
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="Select check-in date"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Check-out Date
                                </label>
                                <DatePicker
                                    selected={editFormData.checkOutDate}
                                    onChange={handleCheckoutDateChange}
                                    minDate={editFormData.checkInDate ? 
                                        new Date(new Date(editFormData.checkInDate).setDate(editFormData.checkInDate.getDate() + 1)) : 
                                        new Date(new Date().setDate(new Date().getDate() + 1))}
                                    className="w-full p-3 border border-gray-300 rounded-md text-gray-900"
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="Select check-out date"
                                />
                            </div>

                            {stayDuration > 0 && (
                                <div className={`p-3 rounded-lg ${stayDuration === 3 ? 'bg-amber-100' : 'bg-blue-100'}`}>
                                    <p className={`text-sm font-medium ${stayDuration === 3 ? 'text-amber-800' : 'text-blue-800'}`}>
                                        Stay Duration: <span className="font-semibold">{stayDuration} night{stayDuration !== 1 ? 's' : ''}</span>
                                        {stayDuration === 3 && <span className="text-amber-600 ml-2">(Maximum stay)</span>}
                                    </p>
                                </div>
                            )}
                            
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="breakfast"
                                    checked={editFormData.breakfast}
                                    onChange={(e) => setEditFormData({...editFormData, breakfast: e.target.checked})}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="breakfast" className="ml-2 block text-sm text-gray-900 flex items-center">
                                    <FiCoffee className="mr-1" /> Include Breakfast (+฿200)
                                </label>
                            </div>
                            
                            {error && (
                                <div className="text-red-500 text-sm">{error}</div>
                            )}
                            
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => setEditingBooking(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}