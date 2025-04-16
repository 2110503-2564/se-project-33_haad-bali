'use client'
import { useState, useEffect, AwaitedReactNode, JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from 'react';
import getCampground from "@/libs/getCampground";
import Image from "next/image";
import Link from "next/link";
import { FiMapPin, FiPhone, FiHome } from "react-icons/fi";
import { FaCampground, FaTree, FaMountain } from "react-icons/fa";
import { GiWoodCabin } from "react-icons/gi";
import getACampgroundReviews from '@/libs/getACampgroundReviews';

function CampgroundLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col items-center justify-center">
      <div className="text-center">
        {/* Animated campsite icon */}
        <div className="relative h-32 w-32 mx-auto mb-8">
          <FaCampground className="absolute text-6xl text-green-600 animate-bounce" style={{ animationDelay: '0.1s' }} />
          <FaTree className="absolute text-4xl text-green-700 -left-2 -top-4 animate-pulse" style={{ animationDelay: '0.3s' }} />
          <FaTree className="absolute text-5xl text-green-800 -right-4 -top-6 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <GiWoodCabin className="absolute text-3xl text-amber-800 bottom-2 left-1/2 transform -translate-x-1/2" />
        </div>

        {/* Loading text with animated dots */}
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          Preparing your campsite
          <span className="inline-block">
            <span className="animate-[bounce_1s_infinite]" style={{ animationDelay: '0.1s' }}>.</span>
            <span className="animate-[bounce_1s_infinite]" style={{ animationDelay: '0.2s' }}>.</span>
            <span className="animate-[bounce_1s_infinite]" style={{ animationDelay: '0.3s' }}>.</span>
          </span>
        </h2>

        {/* Cute nature-themed loading message */}
        <p className="text-gray-500 max-w-md mx-auto">
          Gathering the campfire wood, fluffing the sleeping bags, and chasing away the raccoons...
        </p>

        {/* Animated progress bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mt-6 mx-auto">
          <div className="h-full bg-green-500 rounded-full animate-[progress_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );
}

export default function CampgroundDetailPage({ params }: { params: { cid: string } }) {
  const [campgroundDetail, setCampgroundDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCampground(params.cid);
        const review = await getACampgroundReviews(params.cid);
        setCampgroundDetail(data);
        setReviews(review);
      } catch (error) {
        console.error("Failed to fetch campground:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.cid]);

  if (loading || !campgroundDetail) {
    return <CampgroundLoading />;
  }

  // Construct location string from available data
  const getLocation = () => {
    const parts = [
      campgroundDetail.data.address,
      campgroundDetail.data.district,
      campgroundDetail.data.province,
      campgroundDetail.data.postalcode
    ].filter(Boolean); // Remove empty/null parts
    
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  return (
    <main className="text-left p-5 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-semibold text-gray-800 mb-4 ml-10">{campgroundDetail.data.name}</h1>

      <div className="flex flex-col lg:flex-row items-center justify-between my-5 bg-white shadow-lg rounded-xl p-6 max-w-6xl mx-auto">
        
        {/* Campground Image */}
        <div className="flex-1 w-full lg:w-1/2 mb-6 lg:mb-0 lg:mr-8">
          <Image 
            src={campgroundDetail.data.picture} 
            alt={`${campgroundDetail.data.name} Image`}
            width={600}
            height={400}
            className="rounded-xl w-full h-auto object-cover shadow-md"
            priority
          />
        </div>
        
        {/* Campground Details */}
        <div className="flex-1 w-full lg:w-1/2 text-gray-700">
          <div className="space-y-4">
            {/* Location with icon */}
            <div className="flex items-start space-x-2">
              <FiMapPin className="mt-1 text-indigo-600" />
              <div>
                <h2 className="font-medium text-gray-900 text-lg">Location</h2>
                <p className="text-gray-600">{getLocation()}</p>
              </div>
            </div>
            
            {/* Contact with icon */}
            {campgroundDetail.data.tel && (
              <div className="flex items-start space-x-2">
                <FiPhone className="mt-1 text-indigo-600" />
                <div>
                  <h2 className="font-medium text-gray-900 text-lg">Contact</h2>
                  <p className="text-gray-600">{campgroundDetail.data.tel}</p>
                </div>
              </div>
            )}
            
            {/* Facilities with icon */}
            <div className="flex items-start space-x-2">
              <FiHome className="mt-1 text-indigo-600" />
              <div>
                <h2 className="font-medium text-gray-900 text-lg">Facilities</h2>
                <p className="text-gray-600">Tents, Restrooms, Showers, Fire pits</p>
              </div>
            </div>
          </div>
          
          {/* Booking Button */}
          <Link 
            href={`/booking?id=${params.cid}&name=${encodeURIComponent(campgroundDetail.data.name)}`}
            className="block mt-8"
          >
            <button className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-300 transform hover:scale-[1.02] shadow-md">
              Book Your Stay
            </button>
          </Link>
          {/* Reviews Section */}
          <section className="max-w-4xl mx-auto mt-12 p-6 bg-white rounded-xl shadow-md">
  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Reviews</h2>

  {Array.isArray(reviews.data) && reviews.data.length > 0 ? (
  reviews.data.map((review: any) => (
    <div key={review._id} className="mb-4 p-4 bg-white shadow rounded-lg">
      <div className="flex justify-between items-center mb-1">
        <p className="text-gray-700 font-medium">
          {typeof review.user === 'object' ? review.user.name : `User: ${review.user}`}
        </p>
        <p className="text-yellow-500 text-lg">
          {'★'.repeat(review.star)}{'☆'.repeat(5 - review.star)}
        </p>
      </div>
      <p className="text-gray-600">{review.text}</p>
      <p className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
    </div>
  ))
) : (
  <p className="text-gray-500">No reviews yet.</p>
)}

  <Link 
            href={`/ratings/${params.cid}`}
            className="block mt-8"
          >
            <button className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-300 transform hover:scale-[1.02] shadow-md">
              Add your review
            </button>
          </Link>
</section>

        </div>
      </div>
    </main>
  );
}