'use client';
import { TextField, Checkbox, FormControlLabel } from "@mui/material";
import { Dayjs } from "dayjs";
import dayjs from "dayjs"; // Import dayjs directly for date calculations
import { useSearchParams } from "next/navigation";
import { useState, useEffect, SetStateAction } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addBooking } from "@/redux/features/bookSlice";
import { BookingItem, CampgroundItem } from "../../../interface"; // Import CampgroundItem type
import { getSession, useSession } from "next-auth/react";
import getUserProfile from "@/libs/getUserProfile";
import getCampgrounds from "@/libs/getCampgrounds"; // Import function to get campground data
import { toast } from "react-toastify"; // Importing toastify for notifications
import DatePickerComponent from "@/components/DatePickerComponent"; // Import the DatePickerComponent

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
  const [stayDuration, setStayDuration] = useState<number>(0); // Track duration of stay
  const [campgroundHasBreakfast, setCampgroundHasBreakfast] = useState<boolean>(false); // Track if selected campground has breakfast
  const [campgrounds, setCampgrounds] = useState<CampgroundItem[]>([]); // Use the correct CampgroundItem type
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Add validation states for each required field
  const [nameError, setNameError] = useState<string>('');
  const [telError, setTelError] = useState<string>('');
  const [checkInError, setCheckInError] = useState<string>('');
  const [checkOutError, setCheckOutError] = useState<string>('');
  const [locationError, setLocationError] = useState<string>('');
  const { data: session } = useSession();
  // Fetch campgrounds data
  useEffect(() => {
    const fetchCampgrounds = async () => {
      try {
        setIsLoading(true);
        const campgroundsData = await getCampgrounds();
        if (campgroundsData && campgroundsData.data) {
          setCampgrounds(campgroundsData.data);
        }
      } catch (error) {
        console.error("Error fetching campgrounds:", error);
        toast.error("Could not load campground data.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCampgrounds();
  }, []);

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

  // Calculate stay duration when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const start = checkInDate.startOf('day');
      const end = checkOutDate.startOf('day');
      const nights = end.diff(start, 'day');
      setStayDuration(nights);
      
      // If stay is more than 3 nights, reset checkout date and show warning
      if (nights > 3) {
        toast.warning("Maximum stay duration is 3 nights. Please adjust your checkout date.");
        // Set checkout date to check-in date + 3 days
        setCheckOutDate(checkInDate.add(3, 'day'));
      }
      
      // Clear any previous date errors once valid dates are selected
      setCheckInError('');
      setCheckOutError('');
    } else {
      setStayDuration(0);
    }
  }, [checkInDate, checkOutDate]);

  // Handle location change and check if breakfast is available
  const handleLocationChange = (locationId: string) => {
    setBookLocation(locationId);
    setBreakfast(false); // Reset breakfast choice when location changes
    
    if (locationId) {
      // Find the selected campground in our loaded data
      const selectedCampground = campgrounds.find(camp => camp.id === locationId);
      if (selectedCampground) {
        setCampgroundHasBreakfast(selectedCampground.breakfast === true);
        // Clear location error when valid selection is made
        setLocationError('');
      } else {
        setCampgroundHasBreakfast(false);
      }
    } else {
      setCampgroundHasBreakfast(false);
    }
  };

  // Handle checkout date change with validation
  const handleCheckoutDateChange = (date: Dayjs | null) => {
    if (date && checkInDate) {
      const start = checkInDate.startOf('day');
      const end = date.startOf('day');
      const nights = end.diff(start, 'day');
      
      if (nights > 3) {
        // Set to maximum allowed (check-in date + 3 days)
        setCheckOutDate(checkInDate.add(3, 'day'));
        toast.warning("Maximum stay duration is 3 nights.");
      } else {
        setCheckOutDate(date);
        setCheckOutError(''); // Clear error when valid date selected
      }
    } else {
      setCheckOutDate(date);
    }
  };

  // Validate all form fields
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Check name
    if (!nameLastname.trim()) {
      setNameError('Name is required');
      toast.error('Please enter your name');
      isValid = false;
    } else {
      setNameError('');
    }
    
    // Check telephone
    if (!tel.trim()) {
      setTelError('Telephone number is required');
      toast.error('Please enter a telephone number');
      isValid = false;
    } else {
      setTelError('');
    }
    
    // Check check-in date
    if (!checkInDate) {
      setCheckInError('Check-in date is required');
      toast.error('Please select a check-in date');
      isValid = false;
    } else {
      setCheckInError('');
    }
    
    // Check check-out date
    if (!checkOutDate) {
      setCheckOutError('Check-out date is required');
      toast.error('Please select a check-out date');
      isValid = false;
    } else {
      setCheckOutError('');
    }
    
    // Check location
    if (!bookLocation) {
      setLocationError('Please select a campground');
      toast.error('Please select a campground location');
      isValid = false;
    } else {
      const selectedCampground = campgrounds.find(camp => camp.id === bookLocation);
      if (!selectedCampground) {
        setLocationError('Please select a valid campground');
        toast.error('Invalid campground selection');
        isValid = false;
      } else {
        setLocationError('');
      }
    }
    
    return isValid;
  };

  const makeBooking = async () => {
    // Validate all fields before proceeding
    if (!validateForm()) {
      return;
    }
    
    // Final validation before booking
    const nights = checkOutDate!.diff(checkInDate!, 'day');
    if (nights > 3) {
      toast.error("Booking failed. Maximum stay is 3 nights.");
      return;
    }
    
    // Find the selected campground
    const selectedCampground = campgrounds.find(camp => camp.id === bookLocation);
    if (!selectedCampground) {
      toast.error("Invalid campground selection.");
      return;
    }
    
    const items: BookingItem = {
      nameLastname: nameLastname,
      _id: "unique-id-placeholder", // Ensure you generate an actual ID for your booking
      tel: tel,
      campground: selectedCampground, // Use the whole campground object, not just the name
      checkInDate: checkInDate!.format("YYYY-MM-DD"),
      checkOutDate: checkOutDate!.format("YYYY-MM-DD"),
      breakfast: selectedCampground.breakfast && campgroundHasBreakfast ? breakfast : false, // Only include breakfast if available
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
  };
  const token = ''
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
          onChange={(e) => {
            setNameLastname(e.target.value);
            if (e.target.value.trim()) setNameError('');
          }}
          error={!!nameError}
          helperText={nameError}
          required
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
          onChange={(e) => {
            setTel(e.target.value);
            if (e.target.value.trim()) setTelError('');
          }}
          error={!!telError}
          helperText={telError}
          required
        />
      </div>

      {/* Date Picker for Check-in and Check-out */}
      <div className="w-fit">
        <DatePickerComponent
          label="Check-in Date"
          value={checkInDate}
          onDateChange={(date: SetStateAction<Dayjs | null>) => {
            setCheckInDate(date);
            if (date) setCheckInError('');
          }}
          minDate={dayjs()} // Set minimum date to today's date for Check-in
          required
        />
        {checkInError && <div className="text-red-500 text-sm">{checkInError}</div>}
      </div>

      <div className="w-fit">
        <DatePickerComponent
          label="Check-out Date"
          value={checkOutDate}
          onDateChange={handleCheckoutDateChange}
          minDate={checkInDate} // Enforce Check-out date restriction
          required
        />
        {checkOutError && <div className="text-red-500 text-sm">{checkOutError}</div>}
      </div>

      {/* Stay Duration Information */}
      {checkInDate && checkOutDate && (
        <div className="text-md p-2 bg-gray-100 rounded-lg">
          <span className="font-semibold">Stay Duration:</span> {stayDuration} night{stayDuration !== 1 ? 's' : ''} 
          {stayDuration === 3 && <span className="text-orange-600 ml-2">(Maximum stay reached)</span>}
        </div>
      )}

      {/* Dynamic Campground Selector using data from backend */}
      <div className="w-fit">
        <div className="text-md text-left text-gray-600">Campground Location</div>
        {isLoading ? (
          <div className="w-[550px] h-10 flex items-center justify-center">Loading campgrounds...</div>
        ) : (
          <div className="w-[550px]">
            <select
              className={`w-full h-10 border rounded-lg bg-white px-2 ${locationError ? 'border-red-500' : ''}`}
              value={bookLocation}
              onChange={(e) => handleLocationChange(e.target.value)}
              required
            >
              <option value="">Select Campground</option>
              {campgrounds.map((camp) => (
                <option key={camp.id} value={camp.id}>
                  {camp.name}
                </option>
              ))}
            </select>
            {locationError && <div className="text-red-500 text-sm">{locationError}</div>}
          </div>
        )}
      </div>

      {/* Breakfast Checkbox - Only shown if campground has breakfast */}
      {campgroundHasBreakfast && (
        <div className="w-fit">
          <FormControlLabel
            control={<Checkbox checked={breakfast} onChange={() => setBreakfast(!breakfast)} />}
            label="Add Breakfast"
          />
        </div>
      )}

      <button
        className="block rounded-md bg-[#501717] hover:bg-[#731f1f] px-3 py-2 text-white shadow-sm"
        name="Book Campground"
        onClick={makeBooking}
        disabled={stayDuration > 3 || isLoading}
      >
        Book Campground
      </button>
    </main>
  );
}