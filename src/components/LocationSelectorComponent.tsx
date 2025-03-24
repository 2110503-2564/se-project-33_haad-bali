// LocationSelect.tsx
'use client';
import { Select, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Import the getCampgrounds function
import getCampgrounds from "@/libs/getCampgrounds";

interface LocationSelectProps {
  onLocationChange: (value: string) => void;
  location: string;
}

export default function LocationSelectorComponent({ onLocationChange, location }: LocationSelectProps) {
  const [locations, setLocations] = useState<string[]>([]);

  // Fetch campground data using getCampgrounds function
  useEffect(() => {
    const fetchCampgrounds = async () => {
      try {
        const data = await getCampgrounds();

        if (data.success) {
          const campgroundNames = data.data.map((campground: { name: string }) => campground.name);
          setLocations(campgroundNames);
        } else {
          toast.error('Failed to load campground names.');
        }
      } catch (error) {
        toast.error('Error fetching campground data.');
      }
    };

    fetchCampgrounds();
  }, []);

  return (
    <Select
      variant="standard"
      id="venue"
      value={location}
      onChange={(e) => {
        const newLocation = e.target.value;
        onLocationChange(newLocation);
      }}
      className="h-[2em] w-[200px]"
      sx={{ fontFamily: "serif" }}
    >
      {locations.map((campgroundName, index) => (
        <MenuItem key={index} className="font-serif" value={campgroundName}>
          {campgroundName}
        </MenuItem>
      ))}
    </Select>
  );
}
