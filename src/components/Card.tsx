'use client';

import React from "react";
import Image from "next/image";
import InteractiveCard from "./InteractiveCard";
import Rating from "@mui/material/Rating";
import { FiMapPin, FiStar, FiCalendar, FiImage } from "react-icons/fi";
import { Button } from "@mui/material";

interface CardProps {
  id: string; 
  campgroundName: string;
  imgSrc?: string;
  onRating?: (rating: number) => void;
  location?: {
    address?: string;
    district?: string;
    province?: string;
    postalcode?: string;
  };
  date?: string;
  rating?: number;
}

export default function Card({
  id,
  campgroundName,
  imgSrc,
  onRating,
  location,
  date,
  rating,
}: CardProps) {
  const [value, setValue] = React.useState<number | null>(rating || 0);

  const getLocationString = () => {
    if (!location) return null;

    const parts = [
      location.address,
      location.district,
      location.province,
      location.postalcode,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : null;
  };

  const locationString = getLocationString();

  return (
    <InteractiveCard contentName={campgroundName}>
      {/* Image or Alternative */}
      <div className="w-full h-[60%] relative rounded-t-lg overflow-hidden group bg-gray-100 flex items-center justify-center">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={campgroundName}
            fill={true}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <FiImage className="text-4xl mb-2" />
            <span className="text-sm">No image available</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="w-full h-[40%] p-4 flex flex-col">
        {locationString && (
          <div className="flex items-center gap-1 text-gray-500 mb-1">
            <FiMapPin className="text-sm" />
            <span className="text-xs line-clamp-1">{locationString}</span>
          </div>
        )}

        <h2 className="text-lg font-medium text-gray-800 line-clamp-1 mb-2">
          {campgroundName}
        </h2>

        {date && (
          <div className="flex items-center gap-1 text-gray-500 mb-3">
            <FiCalendar className="text-sm" />
            <span className="text-xs">{date}</span>
          </div>
        )}

        <div className="mt-auto">
          {onRating ? (
            <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
              <Rating
                value={value}
                onChange={(e, newValue) => {
                  setValue(newValue);
                  onRating(newValue ?? 0);
                }}
                precision={0.5}
                emptyIcon={<FiStar className="text-gray-300" fontSize="inherit" />}
                icon={<FiStar className="text-indigo-600" fontSize="inherit" />}
              />
              {value ? <span className="ml-2 text-sm text-gray-600">{value.toFixed(1)}</span> : null}
            </div>
          ) : (
            <div className="flex items-center text-gray-500" onClick={(e) => e.stopPropagation()}>
              <FiStar className="text-indigo-400 mr-1" />
              <Button className="text-sm" href={`/ratings/${id}`}>Rate this campground</Button> {/* Use `id` */}
            </div>
          )}
        </div>
      </div>
    </InteractiveCard>
  );
}
