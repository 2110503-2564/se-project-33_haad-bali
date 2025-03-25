// DateReserve Component Update
'use client';
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Select, MenuItem } from "@mui/material";
import { Dayjs } from "dayjs";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function DateReserve({
  onDateChange,
  onLocationChange,
  minDate,
  location
}: {
  onDateChange: Function,
  onLocationChange: Function,
  minDate?: Dayjs | null,
  location?: string
}) {
  // Additional logic for fetching campgrounds if necessary
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    // You can fetch campgrounds or locations if needed
    // setLocations(fetchedLocations);
  }, []);

  return (
    <div className="bg-slate-100 rounded-lg space-x-5 space-y-2 w-fit px-10 py-5 flex flex-row justify-center">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          className="bg-white"
          value={minDate} // Add your selected date here
          onChange={(value) => {
            if (value) {
              onDateChange(value);
            }
          }}
          minDate={minDate??undefined}
        />
      </LocalizationProvider>

      {location && (
        <Select
          variant="standard"
          id="venue"
          value={location} // Location should be the same for both check-in and check-out
          onChange={(e) => onLocationChange(e.target.value)}
          className="h-[2em] w-[200px]"
          sx={{ fontFamily: "serif" }}
        >
          {locations.map((campgroundName, index) => (
            <MenuItem key={index} value={campgroundName}>
              {campgroundName}
            </MenuItem>
          ))}
        </Select>
      )}
    </div>
  );
}
