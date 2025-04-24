'use client';
import { TextField, Checkbox, FormControlLabel, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addBooking } from "@/redux/features/bookSlice";
import { BookingItem, CampgroundItem, PromotionItem, PromotionJson } from "../../../interface";
import { getSession } from "next-auth/react";
import getUserProfile from "@/libs/getUserProfile";
import getCampgrounds from "@/libs/getCampgrounds";
import { toast } from "react-toastify";
import DatePickerComponent from "@/components/DatePickerComponent";
import createBooking from "@/libs/createBooking";
import getPromotions from "@/libs/getPromotions";
import { motion } from "framer-motion";
import { X } from "lucide-react"; 
export default function Booking() {
  const urlParams = useSearchParams();
  const cid = urlParams.get('id');
  const name = urlParams.get('name');
  const [showPromotionPopup, setShowPromotionPopup] = useState(false);

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
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchPromotions = async () => {
        try {
          const pro: PromotionJson = await getPromotions();
          setPromotions(pro.data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch promotions');
        } finally {
          setLoading(false);
        }
      };
  
      fetchPromotions();
    }, []);

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
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-black">Book Your Stay</h1>
          <p className="mt-2 text-lg text-gray-600">
            {name ? `Reserving at ${name}` : "Select your perfect campground"}
          </p>
        </div>

        <div className="bg-gray-50 shadow-xl rounded-2xl overflow-hidden">
          {/* User Info Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-black mb-4">Your Information</h2>
            {user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium text-black">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-black">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-black">{user.tel || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-black">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Booking Form Section */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-black mb-6">Booking Details</h2>
            
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
                  InputLabelProps={{ className: "text-gray-600" }}
                  InputProps={{ className: "text-black" }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#d1d5db" },
                      "&:hover fieldset": { borderColor: "#9ca3af" },
                      "&.Mui-focused fieldset": { borderColor: "#6366f1" }
                    },
                    "& .MuiInputLabel-root": { color: "#6b7280" },
                    "& .MuiInputBase-input": { color: "black" }
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
                  InputLabelProps={{ className: "text-gray-600" }}
                  InputProps={{ className: "text-black" }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#d1d5db" },
                      "&:hover fieldset": { borderColor: "#9ca3af" },
                      "&.Mui-focused fieldset": { borderColor: "#6366f1" }
                    },
                    "& .MuiInputLabel-root": { color: "#6b7280" },
                    "& .MuiInputBase-input": { color: "black" }
                  }}
                />
              </div>

              {/* Date Pickers - You'll need to customize your DatePickerComponent for light mode */}
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
                    darkMode={false}
                  />
                  {checkInError && <p className="text-red-400 text-sm mt-1">{checkInError}</p>}
                </div>
                <div>
                  <DatePickerComponent
                    label="Check-out Date"
                    value={checkOutDate}
                    onDateChange={handleCheckoutDateChange}
                    minDate={checkInDate}
                    darkMode={false}
                  />
                  {checkOutError && <p className="text-red-400 text-sm mt-1">{checkOutError}</p>}
                </div>
              </div>

              {/* Duration Info */}
              {stayDuration > 0 && (
                <div className={`p-3 rounded-lg ${stayDuration === 3 ? 'bg-yellow-200' : 'bg-blue-200'}`}>
                  <p className="text-sm font-medium text-black">
                    Stay Duration: <span className="font-semibold">{stayDuration} night{stayDuration !== 1 ? 's' : ''}</span>
                    {stayDuration === 3 && <span className="text-yellow-500 ml-2">(Maximum stay)</span>}
                  </p>
                </div>
              )}

              {/* Campground Selector */}
              <div>
                <FormControl fullWidth error={!!locationError}>
                  <InputLabel 
                    id="campground-select-label"
                    className="text-gray-600"
                  >
                    Campground
                  </InputLabel>
                  <Select
                    labelId="campground-select-label"
                    label="Campground"
                    value={bookLocation}
                    onChange={(e) => handleLocationChange(e.target.value as string)}
                    required
                    className="text-black"
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#d1d5db"
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#9ca3af"
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#333"
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {campgrounds.map((campground) => (
                      <MenuItem key={campground.id} value={campground.id}>
                        {campground.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {locationError && <p className="text-red-400 text-sm mt-1">{locationError}</p>}
                </FormControl>
              </div>

              {/* Breakfast Option */}
              {campgroundHasBreakfast && (
                <div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={breakfast}
                        onChange={(e) => setBreakfast(e.target.checked)}
                        sx={{
                          color: '#6366f1',
                          '&.Mui-checked': { color: '#6366f1' }
                        }}
                      />
                    }
                    label="Add Breakfast"
                    sx={{ color: 'black' }}
                  />
                </div>
              )}

              {/* Book Button */}
              <div className="text-center flex col">
                
                <button 
                onClick={() => setShowPromotionPopup(true)}
                className="w-1/5 bg-black text-white p-3 rounded-md disabled:opacity-50 active:bg-gray-800 focus:bg-black focus:outline-none mr-2">
                  Promotion
                </button>
                <button
                  onClick={makeBooking}
                  disabled={isLoading}
                  className="w-4/5 bg-black text-white p-3 rounded-md disabled:opacity-50 active:bg-gray-800 focus:bg-black focus:outline-none"
                >
                  {isLoading ? 'Processing...' : 'Book Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showPromotionPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-2xl p-8 w-[90vw] max-w-6xl max-h-[90vh] overflow-y-auto relative"
    >
      {/* Close X button */}
      <button
        onClick={() => setShowPromotionPopup(false)}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Close"
      >
        <X className="w-10 h-10 text-red-500" />
      </button>

      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-center">
  Available Promotions
</h3>

<div className="grid grid-cols-1 gap-6">
  {promotions.length === 0 ? (
    <div className="text-center text-gray-500 text-base sm:text-lg md:text-xl font-medium py-12">
      No promotions available at the moment.
    </div>
  ) : (
    promotions.map((promo) => (
      <motion.div
  key={promo._id}
  whileHover={{ scale: 1.02 }}
  transition={{ type: "spring", stiffness: 300 }}
  className="w-full h-48 border-2 border-gray-100 rounded-xl shadow-md flex items-center justify-between p-8 bg-gradient-to-r from-gray-50 to-white"
>
  {/* Left side: Promo Code */}
  <div className="flex flex-col items-start pr-6"> {/* tighter padding */}
    <span className="text-xs sm:text-sm font-semibold text-gray-500 mb-1">PROMO CODE</span>
    <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800">
      {promo.promotionCode}
    </div>
  </div>

  {/* Vertical Divider - moved closer to black text */}
  <div className="h-24 w-px bg-gray-300 mx-2"></div>

  {/* Discount Info - shifted left using ml-4 instead of px */}
  <div className="flex flex-col items-center ml-4">
    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-600">
      {promo.discountPercentage}% OFF
    </span>
    <div className="text-sm sm:text-base md:text-lg font-medium text-gray-500 mt-2 text-center">
      Valid until: {new Date(promo.expiredDate).toLocaleDateString('en-UK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </div>
  </div>

  {/* Apply Button */}
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="w-28 sm:w-32 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-bold bg-black text-white uppercase tracking-wider rounded-lg hover:bg-white hover:text-black border-2 border-black transition-all"
  >
    APPLY
  </motion.button>
</motion.div>

    ))
  )}
</div>

    </motion.div>
  </div>
)}
    </div>
  );
}