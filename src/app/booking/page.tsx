'use client';
import { TextField, Checkbox, FormControlLabel } from "@mui/material";
import { Dayjs } from "dayjs";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addBooking } from "@/redux/features/bookSlice";
import { BookingItem } from "../../../interface";
import { getSession } from "next-auth/react";
import getUserProfile from "@/libs/getUserProfile";
import { toast } from "react-toastify"; // Importing toastify for notifications
import DatePickerComponent from "@/components/DatePickerComponent"; // Import the DatePickerComponent
import LocationSelectorComponent from "@/components/LocationSelectorComponent"; // Import the LocationSelectorComponent
import dayjs from "dayjs"; // Make sure to import dayjs for date manipulation

export default function Booking() {
  const urlParams = useSearchParams();
  const vid = urlParams.get('id');
  const name = urlParams.get('name');

  const dispatch = useDispatch<AppDispatch>();

  // State for storing booking details
  const [bookLocation, setBookLocation] = useState<string>('');
  const [nameLastname, setNameLastname] = useState<string>('');
  const [tel, setTel] = useState<string>('');
  const [user, setUser] = useState<{ name: string; username: string; email: string; tel: string; createdAt: string } | null>(null);
  const [checkInDate, setCheckInDate] = useState<Dayjs | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Dayjs | null>(null);
  const [breakfast, setBreakfast] = useState<boolean>(false); // For breakfast checkbox

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      const session = await getSession();
      const token = (session?.user as any)?.token;

      if (token) {
        const profile = await getUserProfile(token);
        setUser({
          name: profile.data.name,
          username: profile.data.username,
          email: profile.data.email,
          tel: profile.data.telephone,
          createdAt: profile.data.createdAt,
        });

        // Set default values for Name and Tel
        setNameLastname(profile.data.name);
        setTel(profile.data.tel);
      }
    };
    fetchUserProfile();
  }, []);

  // Function to calculate the number of nights
  const calculateNights = (checkInDate: Dayjs | null, checkOutDate: Dayjs | null): number => {
    if (checkInDate && checkOutDate) {
      return checkOutDate.diff(checkInDate, 'day');
    }
    return 0;
  };

  // Function to make the booking
  const makeBooking = async () => {
    const nights = calculateNights(checkInDate, checkOutDate);

    if (nights > 3) {
      toast.error("You can only book up to 3 nights.");
      return; // Stop the booking if the night difference is more than 3
    }

    if (bookLocation && checkInDate && checkOutDate && nameLastname && tel) {
      const items: BookingItem = {
        nameLastname: nameLastname,
        tel: tel,
        campground: bookLocation,
        checkInDate: checkInDate.format("YYYY-MM-DD"),
        checkOutDate: checkOutDate.format("YYYY-MM-DD"),
        breakfast: breakfast,
      };

      // Dispatching the booking details
      dispatch(addBooking(items));

      // Send booking request to backend
      try {
        const response = await fetch(`/api/bookings/${vid}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(items),
        });
        const data = await response.json();

        if (data.success) {
          toast.success(data.message || "Booking successful!");
        } else {
          toast.error(data.message || "Booking failed!");
        }
      } catch (error) {
        toast.error("An error occurred while making the booking.");
      }
    } else {
      toast.error("Please fill in all fields.");
    }
  };

  return (
    <main className="w-[100%] flex flex-col items-center space-y-6 font-serif text-black">
      <div className="text-2xl font-serif mt-6 text-black">Campground Booking</div>
      <div className="text-2xl font-serif mt-6 text-black">Booking {name}</div>

      {user && (
        <table className="table-auto border-separate border-spacing-2">
          <tbody>
            <tr>
              <td className="font-semibold">Name</td>
              <td>{user.name}</td>
            </tr>
            <tr>
              <td className="font-semibold">Username</td>
              <td>{user.username}</td>
            </tr>
            <tr>
              <td className="font-semibold">Email</td>
              <td>{user.email}</td>
            </tr>
            <tr>
              <td className="font-semibold">Tel.</td>
              <td>{user.tel}</td>
            </tr>
            <tr>
              <td className="font-semibold">Member Since</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Name and Telephone */}
      <div className="w-fit">
        <div className="text-md text-left text-gray-600">Name</div>
        <TextField
          name="Name-Lastname"
          label="Name-Lastname"
          variant="standard"
          className="w-[550px] rounded-lg bg-white"
          value={nameLastname}
          onChange={(e) => setNameLastname(e.target.value)}
        />
      </div>

      <div className="w-fit">
        <div className="text-md text-left text-gray-600">Telephone</div>
        <TextField
          name="Contact-Number"
          label="Contact-Number"
          variant="standard"
          className="w-[550px] rounded-lg bg-white"
          value={tel}
          onChange={(e) => setTel(e.target.value)}
        />
      </div>

      {/* Date Picker for Check-in and Check-out */}
      <DatePickerComponent
        label="Check-in Date"
        value={checkInDate}
        onDateChange={setCheckInDate}
        minDate={dayjs()} // Set minimum date to today's date for Check-in
      />

      <DatePickerComponent
        label="Check-out Date"
        value={checkOutDate}
        onDateChange={setCheckOutDate}
        minDate={checkInDate} // Enforce Check-out date restriction
      />

      {/* Location Selector */}
      <LocationSelectorComponent
        location={bookLocation}
        onLocationChange={setBookLocation}
      />

      {/* Breakfast Checkbox */}
      <div className="w-fit">
        <FormControlLabel
          control={<Checkbox checked={breakfast} onChange={() => setBreakfast(!breakfast)} />}
          label="Add Breakfast"
        />
      </div>

      <button
        className="block rounded-md bg-[#501717] hover:bg-[#731f1f] px-3 py-2 text-white shadow-sm"
        name="Book Venue"
        onClick={makeBooking}
      >
        Book Venue
      </button>
    </main>
  );
}
