'use client';

import { useState, useEffect } from 'react';
import Card from "./Card";
import Link from "next/link";
import { CampgroundItem, CammpgroundsJson } from "../../interface";

export default function CamgroundCatalog({ cammpgroundsJson }: { cammpgroundsJson: Promise<CammpgroundsJson> }) {
    // States to store data and current index for carousel
    const [campgroundJsonReady, setCampgroundJsonReady] = useState<CammpgroundsJson | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fetch the campground data
    useEffect(() => {
        const fetchData = async () => {
            const data = await cammpgroundsJson; // Resolve the promise
            setCampgroundJsonReady(data); // Store the data in state
        };

        fetchData();
    }, [cammpgroundsJson]); // Dependency array to re-fetch if `cammpgroundsJson` changes

    // Handle next and previous button click
    const handleNext = () => {
        if (campgroundJsonReady) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex < Math.ceil(campgroundJsonReady.data.length / 4) ? nextIndex : 0);
        }
    };

    const handlePrev = () => {
        if (campgroundJsonReady) {
            const prevIndex = currentIndex - 1;
            setCurrentIndex(prevIndex >= 0 ? prevIndex : Math.ceil(campgroundJsonReady.data.length / 4) - 1);
        }
    };

    if (!campgroundJsonReady) {
        return <div>Loading...</div>; // Show a loading message until data is available
    }

    return (
        <div className="relative max-w-full px-4">
            <h2 className="text-xl text-black text-left my-4">
                Explore {campgroundJsonReady.count} campgrounds in our campground catalog
            </h2>

            <div className="relative">
                <div className="flex overflow-hidden">
                    <div
                        className="flex transition-all duration-500"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {/* Group cards into sets of 4 */}
                        {Array.from({ length: Math.ceil(campgroundJsonReady.data.length / 4) }).map((_, setIndex) => (
                            <div key={setIndex} className="flex w-full min-w-full justify-between">
                                {campgroundJsonReady.data.slice(setIndex * 4, setIndex * 4 + 4).map((campgroundItem: CampgroundItem) => (
                                    <Link
                                        href={`/campgrounds/${campgroundItem.id}`}
                                        className="w-1/4 px-2" // Each card takes up 1/4 of the container
                                        key={campgroundItem.id}
                                    >
                                        <Card
                                            campgroundName={campgroundItem.name}
                                            imgSrc={campgroundItem.picture}
                                        />
                                    </Link>
                                ))}
                                {/* Add empty placeholders if needed to maintain 4 items per row */}
                                {setIndex === Math.ceil(campgroundJsonReady.data.length / 4) - 1 && 
                                 campgroundJsonReady.data.length % 4 !== 0 && 
                                 Array.from({ length: 4 - (campgroundJsonReady.data.length % 4) }).map((_, i) => (
                                    <div key={`empty-${i}`} className="w-1/4 px-2"></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handlePrev}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
                    aria-label="Previous"
                >
                    &#8592;
                </button>
                <button
                    onClick={handleNext}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
                    aria-label="Next"
                >
                    &#8594;
                </button>
            </div>
        </div>
    );
}