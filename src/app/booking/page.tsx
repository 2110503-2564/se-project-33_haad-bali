'use client';
import { TextField, Checkbox, FormControlLabel, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addBooking } from "@/redux/features/bookSlice";
import { BookingItem, CampgroundItem } from "../../../interface";
import { getSession } from "next-auth/react";
import getUserProfile from "@/libs/getUserProfile";
import getCampgrounds from "@/libs/getCampgrounds";
import { toast } from "react-toastify";
import DatePickerComponent from "@/components/DatePickerComponent";
import createBooking from "@/libs/createBooking";

export default function Booking() {
  const urlParams = useSearchParams();
  const cid = urlParams.get('id');
  const name = urlParams.get('name');

  const dispatch = useDispatch<AppDispatch>();

  // State management
  const [bookLocation, setBookLocation] = useState<string>('');
  const [nameLastname, setNameLastname] = useState<string>('');
  const [tel, setTel] = useState<string>('');
  const [user, setUser] = useState<{ name: string; username: string; email: string; tel: string; createdAt: string } | null>(null);
  const [checkInDate, setCheckInDate] = useState<Dayjs | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Dayjs | null>(null);
  const [breakfast, setBreakfast] = useState<boolean>(false);
  const [stayDuration, setStayDuration] = useState<number>(0);
  const [campgroundHasBreakfast, setCampgroundHasBreakfast] = useState<boolean>(false);
  const [campgrounds, setCampgrounds] = useState<CampgroundItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validation states
  const [nameError, setNameError] = useState<string>('');
  const [telError, setTelError] = useState<string>('');
  const [checkInError, setCheckInError] = useState<string>('');
  const [checkOutError, setCheckOutError] = useState<string>('');
  const [locationError, setLocationError] = useState<string>('');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch campgrounds
        const campgroundsData = await getCampgrounds();
        if (campgroundsData?.data) {
          setCampgrounds(campgroundsData.data);
        }
        
        // Fetch user profile
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
          setNameLastname(profile.data.name);
          setTel(profile.data.telephone);
        }
      } catch (error) {
        toast.error("Could not load data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate stay duration
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const nights = checkOutDate.diff(checkInDate, 'day');
      setStayDuration(nights);
      
      if (nights > 3) {
        toast.warning("Maximum stay is 3 nights");
        setCheckOutDate(checkInDate.add(3, 'day'));
      }
      
      setCheckInError('');
      setCheckOutError('');
    } else {
      setStayDuration(0);
    }
  }, [checkInDate, checkOutDate]);

  const handleLocationChange = (locationId: string) => {
    setBookLocation(locationId);
    setBreakfast(false);
    
    if (locationId) {
      const selectedCampground = campgrounds.find(camp => camp.id === locationId);
      setCampgroundHasBreakfast(selectedCampground?.breakfast === true);
      setLocationError('');
    } else {
      setCampgroundHasBreakfast(false);
    }
  };
  const handleCheckoutDateChange = (date: Dayjs | null) => {
    if (date && checkInDate) {
      const start = checkInDate.startOf('day');
      const end = date.startOf('day');
      const nights = end.diff(start, 'day');
      
      if (nights > 3) {
        // Auto-correct check-out date to 3 nights after check-in date
        const correctedCheckoutDate = checkInDate.add(3, 'day');
        setCheckOutDate(correctedCheckoutDate);
        toast.warning("Maximum stay duration is 3 nights.");
      } else {
        setCheckOutDate(date);
        setCheckOutError('');
      }
    } else {
      setCheckOutDate(date);
    }
  
    // Convert check-in and check-out dates to ISO format when storing them
    const checkInDateISO = checkInDate ? checkInDate.toISOString() : null;
    const checkOutDateISO = date ? date.toISOString() : null;
  
    console.log("Check-in Date (ISO):", checkInDateISO);
    console.log("Check-out Date (ISO):", checkOutDateISO);
  };
  const validateForm = (): boolean => {
    let isValid = true;
    
    if (!nameLastname.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    if (!tel.trim()) {
      setTelError('Telephone is required');
      isValid = false;
    } else {
      setTelError('');
    }
    
    if (!checkInDate) {
      setCheckInError('Check-in date is required');
      isValid = false;
    } else {
      setCheckInError('');
    }
    
    if (!checkOutDate) {
      setCheckOutError('Check-out date is required');
      isValid = false;
    } else {
      setCheckOutError('');
    }
    
    if (!bookLocation) {
      setLocationError('Campground is required');
      isValid = false;
    } else {
      setLocationError('');
    }
    
    return isValid;
  };

  const makeBooking = async () => {
    if (!validateForm()) return;
    if (!checkInDate || !checkOutDate) return;

    const checkInDateISO = checkInDate.toISOString();
    const checkOutDateISO = checkOutDate.toISOString();

    const selectedCampground = campgrounds.find(camp => camp.id === bookLocation);
    if (!selectedCampground) {
      toast.error("Invalid campground selection");
      return;
    }

    const bookingItem: BookingItem = {
      _id: "",
      CheckInDate: checkInDateISO,
      CheckOutDate: checkOutDateISO,
      tel: tel,
      campground: selectedCampground,
      breakfast: campgroundHasBreakfast ? breakfast : false,
      apptDate: new Date().toISOString(),
      user: ""
    };

    dispatch(addBooking(bookingItem));

    try {
      const session = await getSession();
      const token = (session?.user as any)?.token;

      if (token) {
        const response = await createBooking(token, {
          nameLastname,
          tel,
          campground: selectedCampground.id,
          CheckInDate: checkInDateISO,
          CheckOutDate: checkOutDateISO,
          userId: (session?.user as any)?.id,
          breakfast: campgroundHasBreakfast ? breakfast:false
        });

        if (response.success) {
          toast.success("Booking successful!");
        } else {
          toast.error(response.message || "Booking failed");
        }
      }
    } catch (error) {
      toast.error("Booking error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white">Book Your Stay</h1>
          <p className="mt-2 text-lg text-gray-300">
            {name ? `Reserving at ${name}` : "Select your perfect campground"}
          </p>
        </div>

        <div className="bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
          {/* User Info Section */}
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Your Information</h2>
            {user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Username</p>
                  <p className="font-medium text-white">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium text-white">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="font-medium text-white">{user.tel || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Member Since</p>
                  <p className="font-medium text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Booking Form Section */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Booking Details</h2>
            
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <TextField
                  label="Full Name"
                  variant="outlined"
                  fullWidth
                  value={nameLastname}
                  onChange={(e) => {
                    setNameLastname(e.target.value);
                    if (e.target.value.trim()) setNameError('');
                  }}
                  error={!!nameError}
                  helperText={nameError}
                  required
                  InputLabelProps={{ className: "text-gray-400" }}
                  InputProps={{ className: "text-white" }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#4B5563" },
                      "&:hover fieldset": { borderColor: "#9CA3AF" },
                      "&.Mui-focused fieldset": { borderColor: "#6366F1" }
                    },
                    "& .MuiInputLabel-root": { color: "#9CA3AF" },
                    "& .MuiInputBase-input": { color: "white" }
                  }}
                />
              </div>

              {/* Phone Field */}
              <div>
                <TextField
                  label="Phone Number"
                  variant="outlined"
                  fullWidth
                  value={tel}
                  onChange={(e) => {
                    setTel(e.target.value);
                    if (e.target.value.trim()) setTelError('');
                  }}
                  error={!!telError}
                  helperText={telError}
                  required
                  InputLabelProps={{ className: "text-gray-400" }}
                  InputProps={{ className: "text-white" }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#4B5563" },
                      "&:hover fieldset": { borderColor: "#9CA3AF" },
                      "&.Mui-focused fieldset": { borderColor: "#6366F1" }
                    },
                    "& .MuiInputLabel-root": { color: "#9CA3AF" },
                    "& .MuiInputBase-input": { color: "white" }
                  }}
                />
              </div>

              {/* Date Pickers - You'll need to customize your DatePickerComponent for dark mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <DatePickerComponent
                    label="Check-in Date"
                    value={checkInDate}
                    onDateChange={(date) => {
                      setCheckInDate(date);
                      if (date) setCheckInError('');
                    }}
                    minDate={dayjs()}
                    darkMode
                  />
                  {checkInError && <p className="text-red-400 text-sm mt-1">{checkInError}</p>}
                </div>
                <div>
                  <DatePickerComponent
                    label="Check-out Date"
                    value={checkOutDate}
                    onDateChange={handleCheckoutDateChange}
                    minDate={checkInDate}
                    darkMode
                  />
                  {checkOutError && <p className="text-red-400 text-sm mt-1">{checkOutError}</p>}
                </div>
              </div>

              {/* Duration Info */}
              {stayDuration > 0 && (
                <div className={`p-3 rounded-lg ${stayDuration === 3 ? 'bg-amber-900/30' : 'bg-blue-900/30'}`}>
                  <p className="text-sm font-medium text-white">
                    Stay Duration: <span className="font-semibold">{stayDuration} night{stayDuration !== 1 ? 's' : ''}</span>
                    {stayDuration === 3 && <span className="text-amber-300 ml-2">(Maximum stay)</span>}
                  </p>
                </div>
              )}

              {/* Campground Selector */}
              <div>
                <FormControl fullWidth error={!!locationError}>
                  <InputLabel 
                    id="campground-select-label"
                    className="text-gray-400"
                  >
                    Campground
                  </InputLabel>
                  <Select
                    labelId="campground-select-label"
                    label="Campground"
                    value={bookLocation}
                    onChange={(e) => handleLocationChange(e.target.value as string)}
                    required
                    className="text-white"
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#4B5563"
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#9CA3AF"
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6366F1"
                      },
                      "& .MuiSvgIcon-root": {
                        color: "#9CA3AF"
                      }
                    }}
                  >
                    <MenuItem value="" className="text-gray-400"><em>Select a campground</em></MenuItem>
                    {campgrounds.map((camp) => (
                      <MenuItem 
                        key={camp.id} 
                        value={camp.id}
                        className="text-white hover:bg-gray-700"
                      >
                        {camp.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {locationError && <p className="text-red-400 text-sm mt-1">{locationError}</p>}
                </FormControl>
              </div>

              {/* Breakfast Option */}
              {campgroundHasBreakfast && (
                <div className="pt-2">
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={breakfast} 
                        onChange={() => setBreakfast(!breakfast)}
                        color="primary"
                        sx={{
                          color: "#9CA3AF",
                          "&.Mui-checked": {
                            color: "#6366F1"
                          }
                        }}
                      />
                    }
                    label={<span className="text-gray-300">Include Breakfast (+$15/night)</span>}
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={makeBooking}
                  disabled={stayDuration > 3 || isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="hidden lg:block lg:absolute lg:top-32 lg:right-8 lg:w-80">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h3 className="font-bold text-lg text-white mb-4">Booking Summary</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex justify-between">
                <span>Nights:</span>
                <span className="text-white">{stayDuration || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="text-right text-white">
                  {campgrounds.find(c => c.id === bookLocation)?.name || 'Not selected'}
                </span>
              </div>
              {breakfast && (
                <div className="flex justify-between">
                  <span>Breakfast:</span>
                  <span className="text-green-400">Included</span>
                </div>
              )}
              <div className="border-t border-gray-700 my-2"></div>
              <div className="flex justify-between font-semibold text-white">
                <span>Estimated Total:</span>
                <span>
                  ${stayDuration ? (stayDuration * 50 + (breakfast ? stayDuration * 15 : 0)) : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}