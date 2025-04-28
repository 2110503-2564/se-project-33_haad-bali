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
import applyPromotion from "@/libs/applyPromotion";
import router, { useRouter } from "next/router";
export default function Booking() {
  const urlParams = useSearchParams();
  const cid = urlParams.get('id');
  const name = urlParams.get('name');
  const [showPromotionPopup, setShowPromotionPopup] = useState(false);
  const [breakfastPrice, setBreakfastPrice] = useState<number>(0);

  const dispatch = useDispatch<AppDispatch>();
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionItem | null>(null);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [discountedPrice, setDiscountedPrice] = useState<number>(0);
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
    const handleApplyPromotion = (promo: PromotionItem) => {
      setSelectedPromotion(promo);
      setShowPromotionPopup(false);
      toast.success(`Promotion ${promo.promotionCode} applied!`);
    };
  
    const removePromotion = () => {
      setSelectedPromotion(null);
      toast.info("Promotion removed");
    };
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
  useEffect(() => {
    if (bookLocation && stayDuration > 0) {
      const selectedCampground = campgrounds.find(camp => camp.id === bookLocation);
      if (selectedCampground) {
        // Calculate base price
        const basePrice = selectedCampground.pricePerNight * stayDuration;
        setOriginalPrice(basePrice);
        
        // Calculate breakfast price if selected
        let breakfastTotal = 0;
        if (breakfast && selectedCampground.breakfastPrice) {
          breakfastTotal = selectedCampground.breakfastPrice * stayDuration;
        }
        setBreakfastPrice(breakfastTotal);
        
        // Apply promotion if selected
        if (selectedPromotion) {
          const discountAmount = basePrice * (selectedPromotion.discountPercentage / 100);
          setDiscountedPrice(basePrice - discountAmount + breakfastTotal);
        } else {
          setDiscountedPrice(basePrice + breakfastTotal);
        }
      }
    }
  }, [bookLocation, stayDuration, breakfast, selectedPromotion, campgrounds]);

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

    try {
      const session = await getSession();
      const token = (session?.user as any)?.token;

      if (token) {
        // Apply promotion at booking time
        let finalPrice = originalPrice + breakfastPrice;
        if (selectedPromotion) {
          const promotionResult = await applyPromotion(
            token,
            selectedPromotion.promotionCode,
            originalPrice
          );
          
          if (promotionResult) {
            finalPrice = promotionResult.discountedPrice + breakfastPrice;
          }
        }

        const bookingItem: BookingItem = {
          _id: "",
          CheckInDate: checkInDateISO,
          CheckOutDate: checkOutDateISO,
          tel: tel,
          campground: selectedCampground,
          breakfast: campgroundHasBreakfast ? breakfast : false,
          apptDate: new Date().toISOString(),
          user: "",
          totalPrice: finalPrice
        };

        dispatch(addBooking(bookingItem));

        const response = await createBooking(token, {
          nameLastname,
          tel,
          campground: selectedCampground.id,
          CheckInDate: checkInDateISO,
          CheckOutDate: checkOutDateISO,
          userId: (session?.user as any)?.id,
          breakfast: campgroundHasBreakfast ? breakfast : false,
          totalPrice: finalPrice
        });

        if (response.success) {
          console.log("Booking successful!");
          
        } else {
          toast.error(response.message || "Booking failed");
        }
        window.location.href = '/mybooking';
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
      
      {bookLocation && stayDuration > 0 && (
        <div className="bg-gray-100 p-6 rounded-lg mt-6">
          <h3 className="text-lg font-semibold mb-4">Price Summary</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{stayDuration} night{stayDuration !== 1 ? 's' : ''} × ${campgrounds.find(camp => camp.id === bookLocation)?.pricePerNight}</span>
              <span>${originalPrice.toFixed(2)}</span>
            </div>
            
            {breakfast && (
              <div className="flex justify-between">
                <span>Breakfast × {stayDuration}</span>
                <span>${breakfastPrice.toFixed(2)}</span>
              </div>
            )}
            
            {selectedPromotion && (
              <div className="flex justify-between text-green-600">
                <span>Promo: {selectedPromotion.promotionCode} ({selectedPromotion.discountPercentage}% off)</span>
                <span>-${(originalPrice * (selectedPromotion.discountPercentage / 100)).toFixed(2)}</span>
              </div>
            )}
            
            <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>${discountedPrice.toFixed(2)}</span>
            </div>
            
            {selectedPromotion && (
              <button 
                onClick={removePromotion}
                className="text-red-500 text-sm mt-2 hover:underline"
              >
                Remove promotion
              </button>
            )}
          </div>
        </div>
      )}
</div>

            
  
{showPromotionPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-md">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="bg-gradient-to-br from-white via-gray-100 to-gray-50 rounded-3xl shadow-2xl p-10 w-[90vw] max-w-5xl max-h-[90vh] overflow-y-auto relative"
    >
      {/* Elegant Close Button */}
      <button
        onClick={() => setShowPromotionPopup(false)}
        className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-300 shadow-sm"
        aria-label="Close"
      >
        <X className="w-6 h-6 text-gray-600" />
      </button>

      {/* Title */}
      <h3 className="text-3xl md:text-4xl font-extrabold mb-10 text-center text-gray-800 tracking-tight">
        🎁 Available Promotions
      </h3>

      {/* Promotions List */}
      <div className="grid grid-cols-1 gap-8">
        {promotions.length === 0 ? (
          <div className="text-center text-gray-500 text-lg font-medium py-20">
            No promotions available at the moment.
          </div>
        ) : (
          promotions.map((promo) => (
            <motion.div
              key={promo._id}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 bg-white rounded-2xl border border-dashed border-gray-400 shadow hover:shadow-xl transition-all relative"
            >
              {/* Left: Coupon Badge */}
              <div className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-gradient-to-br from-green-100 via-green-200 to-green-100 shadow-md">
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                  Save
                </span>
                <span className="text-4xl sm:text-5xl font-extrabold text-gray-800 leading-none">
                  {promo.discountPercentage}%
                </span>
                <span className="text-xs font-semibold text-green-600 mt-1">
                  OFF
                </span>
              </div>


              {/* Middle: Promo Code */}
              <div className="flex flex-col items-center justify-center mb-6 sm:mb-0">
                <span className="text-sm font-medium text-gray-500 mb-1">
                  Promo Code
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-widest">
                  {promo.promotionCode}
                </div>
              </div>

              {/* Right: Apply Button */}
              <motion.button
                onClick={() => handleApplyPromotion(promo)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-32 sm:w-36 py-3 text-sm font-bold uppercase bg-gradient-to-r from-black to-gray-800 text-white rounded-xl border-2 border-black hover:bg-white hover:text-black transition-all tracking-wider"
              >
                Apply
              </motion.button>

              {/* Valid Until - Underneath on mobile */}
              <div className="absolute bottom-3 left-6 text-xs sm:text-sm text-gray-400 sm:static sm:mt-4">
                Valid until {new Date(promo.expiredDate).toLocaleDateString('en-UK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
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


