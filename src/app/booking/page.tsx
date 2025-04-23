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
  const [editingBooking, setEditingBooking] = useState< null>(null);

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
  const handleEditClick = () => {
    setEditingBooking(null);
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
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
      <h3 className="text-lg font-semibold mb-4">Available Promotions</h3>
      <div className="flex flex-col items-center justify-center gap-8">
          {promotions.map((promo) => (
            <div key={promo._id} className="w-full max-w-3xl h-40 border border-gray-200 rounded-lg shadow-sm flex flex-row items-center justify-center p-6 bg-white">
              <div className="text-3xl font-bold mb-2 mr-auto">code : {promo.promotionCode}</div>
              <div className="text-3xl font-bold mb-2 mr-auto">{promo.discountPercentage}% OFF
                <div className="text-lg font-normal mb-2 mt-1">valid until : {new Date(promo.expiredDate).toLocaleDateString
  ('en-UK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} </div>
              </div>
              <button className="w-24 py-3 font-bold bg-black text-white uppercase tracking-wider hover:bg-white hover:text-black transition-colors">
                APPLY
              </button>
            </div>
          ))}
        </div>
      <div className="mt-4 text-right">
        <button
          onClick={() => setShowPromotionPopup(false)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}