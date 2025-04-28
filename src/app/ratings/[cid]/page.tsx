'use client';

import React, { useEffect, useState } from 'react';
import Rating from '@mui/material/Rating';
import { TextareaAutosize } from '@mui/material';
import Image from 'next/image';
import { getSession } from 'next-auth/react';
import addReview from '@/libs/addReview';
import getCampground from '@/libs/getCampground';
import { useRouter } from 'next/navigation';

export default function RatingPage({ params }: { params: { cid: string } }) {
  const router = useRouter();
  const [campgroundDetail, setCampgroundDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

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

  const handleSubmit = async () => {
    const session = await getSession();
    const token = (session?.user as any)?.token;

    if (value && reviewText.trim().length <500 && token) {
      try {
        const response = await addReview(token, params.cid, { text: reviewText, star: value });
        if (response.success) {
          setShowSuccessPopup(true);
          console.log('Review submitted successfully:', response.data);
        } else {
          alert('Failed to submit the review. Please try again.');
        }
      } catch (error) {
        console.error('Error submitting review:', error);
        alert('Error submitting review.');
      }
    } else {
      alert('Please add a rating and a review.');
    }
  };

  const closePopup = () => {
    setShowSuccessPopup(false);
    router.push(`/campgrounds/${params.cid}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg animate-popIn">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Image 
                  src="/img/campfire.png" 
                  alt="Success" 
                  width={80} 
                  height={80} 
                  className='animate-bounce'
                />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Review Submitted!</h3>
              <p className="text-gray-600 mb-4">Thank you for sharing your camping experience!</p>
              <button
                onClick={closePopup}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                Back to Campground
              </button>
            </div>
          </div>
        </div>
      )}

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
            <h2 className="text-2xl font-bold text-gray-800">{campgroundDetail?.data?.name || 'Campground Name'}</h2>
            <p className="text-sm text-gray-500">{campgroundDetail?.data?.description || 'Campground Description'}</p>
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
        </div>
      </div>
    </div>
  );
}