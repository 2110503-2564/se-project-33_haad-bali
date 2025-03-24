'use client'
import React from "react";
import Image from "next/image";
import InteractiveCard from "./InteractiveCard";
import Rating from "@mui/material/Rating";

export default function Card({ campgroundName, imgSrc, onRating }: { campgroundName: string; imgSrc: string; onRating?: (rating: number) => void }) {
    const [value, setValue] = React.useState<number | null>(0);

    function onCampgroundSelected() {
        alert("You Select " + campgroundName);
    }

    return (
        <InteractiveCard contentName={campgroundName}>
            <div className="w-full h-[70%] relative rounded-t-lg">
                <Image
                    src={imgSrc}
                    alt="Product Picture"
                    fill={true}
                    className="object-cover rounded-t-lg"
                />
            </div>
            <div className="w-full h-[30%] p-[10px]">
                <h2 className="mt-2 text-lg font-semibold text-black">{campgroundName}</h2>
                {
                    onRating? <div onClick={(e) => {e.stopPropagation(); e.preventDefault() }}>
                    <Rating
                        id={`${campgroundName} Rating`}
                        name={`${campgroundName} Rating`}
                        data-testid={`${campgroundName} Rating`}
                        value={value}
                        onChange={(e, newValue) => {
                            setValue(newValue);
                            onRating?.(newValue ?? 0);
                        }}
                    /></div> : ''
                }
                
            </div>
        </InteractiveCard>
    );
}
