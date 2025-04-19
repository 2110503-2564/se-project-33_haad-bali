'use client';

import { useState, useEffect } from 'react';
import Card from "./Card";
import Link from "next/link";
import { CampgroundItem, CampgroundsJson } from "../../interface";
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'; // React icons for carousel navigation

export default function CampgroundCatalog({ campgroundsJson }: { campgroundsJson: Promise<CampgroundsJson> }) {
    // States to store data and current index for carousel
    const [campgroundJsonReady, setCampgroundJsonReady] = useState<CampgroundsJson | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fetch the campground data
    useEffect(() => {
        const fetchData = async () => {
            const data = await campgroundsJson; // Resolve the promise
            setCampgroundJsonReady(data); // Store the data in state
        };

        fetchData();
    }, [campgroundsJson]); // Dependency array to re-fetch if `campgroundsJson` changes

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
        return <div className="text-center text-lg text-gray-600">Loading...</div>; // Show a loading message until data is available
    }

    return (
        <div className="relative max-w-full px-4 bg-gray-100 py-10">
            <h2 className="text-2xl text-black font-semibold text-left mb-5">
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
                                            id={campgroundItem.id}                                        />
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

                {/* Carousel navigation buttons */}
                <button
                    onClick={handlePrev}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-3 rounded-full"
                    aria-label="Previous"
                >
                    <FiChevronLeft size={24} />
                </button>
                <button
                    onClick={handleNext}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-3 rounded-full"
                    aria-label="Next"
                >
                    <FiChevronRight size={24} />
                </button>
            </div>
        </div>
    );
}
