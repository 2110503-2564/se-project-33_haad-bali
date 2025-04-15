'use client';

import React, { useEffect, useState } from 'react';
import Rating from '@mui/material/Rating';
import { TextareaAutosize } from '@mui/material';
import Image from 'next/image';
import getCampground from '@/libs/getCampground';

export default function RatingPage({ params }: { params: { cid: string } }) {

        const [campgroundDetail, setCampgroundDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Fetched data:", params.cid);
    const fetchData = async () => {
      try {
        const data = await getCampground(params.cid);
        setCampgroundDetail(data);
      } catch (error) {
        console.error("Failed to fetch campground:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.cid]);

  const [value, setValue] = useState<number | null>(0);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (value && reviewText.trim().length > 0) {
      // Submit to API or handle data here
      setSubmitted(true);
      console.log('Rating:', value);
      console.log('Review:', reviewText);
    } else {
      alert('Please add a rating and a review.');
    }
  };

  return (
    
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white">
      {/* Left Image Section */}
      <div className="flex flex-col lg:flex-row bg-gray-50 rounded-xl shadow-xl overflow-hidden w-full max-w-4xl">
        <div className="lg:w-1/2 bg-white flex items-center justify-center p-6">
          {!loading && campgroundDetail?.data?.picture && (
           <div className="flex items-center justify-center" style={{ width: 320, height: 320 }}>
           <Image
             src={campgroundDetail.data.picture}
             alt="beach"
             width={320}
             height={320}
           />
         </div>
         
)}
        </div>

        {/* Review Form Section */}
        <div className="lg:w-1/2 p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Bali Beach</h2>
            <p className="text-sm text-gray-500">
              Haad Baad Li Hxx Baad Laad Description or a Little Motto
            </p>
          </div>

          <div className="flex justify-center">
            <Rating
              value={value}
              onChange={(e, newValue) => setValue(newValue)}
              size="large"
            />
          </div>

          <TextareaAutosize
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            minRows={4}
            placeholder="Tell others about your experiences"
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />

          <button
            onClick={handleSubmit}
            className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition duration-300 text-sm font-medium"
          >
            Post
          </button>

          {submitted && (
            <p className="text-green-600 text-sm text-center">Thank you for your review!</p>
          )}
        </div>
      </div>
    </div>
  );
}