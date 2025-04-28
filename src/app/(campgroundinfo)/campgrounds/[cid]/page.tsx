'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import getCampground from "@/libs/getCampground";
import Image from "next/image";
import Link from "next/link";
import { FiMapPin, FiPhone, FiHome, FiEdit, FiTrash2, FiStar, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { getSession } from 'next-auth/react';
import getACampgroundReviews from '@/libs/getACampgroundReviews';
import { updateReview } from "@/libs/updateReview";
import { deleteReview } from "@/libs/deleteReview";
import { FaCampground, FaTree, FaMountain } from "react-icons/fa";
import { GiWoodCabin } from "react-icons/gi";
import getUserProfile from '@/libs/getUserProfile';
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
  const [isEditing, setIsEditing] = useState(false);
  const [currentReview, setCurrentReview] = useState<any>(null);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewStars, setNewReviewStars] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [user, setUser] = useState<{ name: string; username: string; email: string; tel: string; createdAt: string ; role: string;_id:string} | null>(null);

    useEffect(() => {
      const fetchUserProfile = async () => {
        const session = await getSession();
        const token = (session?.user as any)?.token;
  
        if (token) {
          try {
            const profile = await getUserProfile(token);
            setUser({
              name: profile.data.name,
              username: profile.data.username,
              email: profile.data.email,
              tel: profile.data.telephone,
              createdAt: profile.data.createdAt,
              role: profile.data.role,
              _id: profile.data._id
            });
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        } else {
        }
      };
  
      fetchUserProfile();
    }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCampground(params.cid);
        const review = await getACampgroundReviews(params.cid);
        setCampgroundDetail(data);
        setReviews(review);
      } catch (error) {
        console.error("Failed to fetch campground:", error);
        showNotification('error', 'Failed to load campground data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.cid]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEditReview = (review: any) => {
    setIsEditing(true);
    setCurrentReview(review);
    setNewReviewText(review.text);
    setNewReviewStars(review.star);
  };

  const handleDeleteReview = (reviewId: string) => {
    setIsConfirmingDelete(true);
    setCurrentReview({ ...currentReview, id: reviewId });
  };

  const confirmDeleteReview = async () => {
    const session = await getSession();
    const token = (session?.user as any)?.token;
    try {
      await deleteReview(token, currentReview.id);
      const updatedReviews = await getACampgroundReviews(params.cid);
      setReviews(updatedReviews);
      setIsConfirmingDelete(false);
      showNotification('success', 'Review deleted successfully');
    } catch (error) {
      console.error("Failed to delete review:", error);
      showNotification('error', 'Failed to delete review');
      setIsConfirmingDelete(false);
    }
  };

  const handleUpdateReview = async () => {
    const session = await getSession();
    const token = (session?.user as any)?.token;
    if (currentReview && newReviewText && newReviewStars > 0) {
      try {
        await updateReview(token, currentReview._id, { 
          text: newReviewText,
          star: newReviewStars 
        });
        const updatedReviews = await getACampgroundReviews(params.cid);
        setReviews(updatedReviews);
        setIsEditing(false);
        showNotification('success', 'Review updated successfully');
      } catch (error) {
        console.error("Failed to update review:", error);
        showNotification('error', 'Failed to update review');
      }
    }
  };

  if (loading || !campgroundDetail) {
    return <CampgroundLoading />;
  }

  const getLocation = () => {
    const parts = [
      campgroundDetail.data.address,
      campgroundDetail.data.district,
      campgroundDetail.data.province,
      campgroundDetail.data.postalcode
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  return (
    <main className="text-left p-5 font-sans bg-gray-50 min-h-screen relative">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            {notification.type === 'success' ? (
              <FiCheckCircle className="mr-2 text-xl" />
            ) : (
              <FiXCircle className="mr-2 text-xl" />
            )}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-semibold text-gray-800 mb-4 ml-10"
      >
        {campgroundDetail.data.name}
      </motion.h1>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col lg:flex-row items-center justify-between my-5 bg-white shadow-lg rounded-xl p-6 max-w-6xl mx-auto"
      >
        {/* Campground Image */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex-1 w-full lg:w-1/2 mb-6 lg:mb-0 lg:mr-8"
        >
          <Image 
            src={campgroundDetail.data.picture} 
            alt={`${campgroundDetail.data.name} Image`}
            width={600}
            height={400}
            className="rounded-xl w-full h-auto object-cover shadow-md"
            priority
          />
        </motion.div>
        
        {/* Campground Details */}
        <div className="flex-1 w-full lg:w-1/2 text-gray-700">
          <div className="space-y-4">
            <motion.div 
              whileHover={{ x: 5 }}
              className="flex items-start space-x-2"
            >
              <FiMapPin className="mt-1 text-indigo-600" />
              <div>
                <h2 className="font-medium text-gray-900 text-lg">Location</h2>
                <p className="text-gray-600">{getLocation()}</p>
              </div>
            </motion.div>
            
            {campgroundDetail.data.tel && (
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-start space-x-2"
              >
                <FiPhone className="mt-1 text-indigo-600" />
                <div>
                  <h2 className="font-medium text-gray-900 text-lg">Contact</h2>
                  <p className="text-gray-600">{campgroundDetail.data.tel}</p>
                </div>
              </motion.div>
            )}
            
            <motion.div 
              whileHover={{ x: 5 }}
              className="flex items-start space-x-2"
            >
              <FiHome className="mt-1 text-indigo-600" />
              <div>
                <h2 className="font-medium text-gray-900 text-lg">Facilities</h2>
                <p className="text-gray-600">Tents, Restrooms, Showers, Fire pits</p>
              </div>
            </motion.div>
          </div>
          
          <Link 
            href={`/booking?id=${params.cid}&name=${encodeURIComponent(campgroundDetail.data.name)}`}
            className="block mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md"
            >
              Book Your Stay
            </motion.button>
          </Link>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto mt-12 p-6 bg-white rounded-xl shadow-md"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Reviews</h2>
            {Array.isArray(reviews.data) && reviews.data.length > 0 ? (
              <AnimatePresence>
                {reviews.data.map((review: any) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4 p-4 bg-white shadow rounded-lg"
                  >
                    
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
                 { (user?.role === "admin" || user?._id === review.user._id)  && (
                    <div className="flex space-x-4 mt-2">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditReview(review)}
                      >
                        <FiEdit className="text-blue-600" />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteReview(review._id)}
                      >
                        <FiTrash2 className="text-red-600" />
                      </motion.button>  
                    </div>
                      )}
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <p className="text-gray-500">No reviews yet.</p>
            )}

            <Link href={`/ratings/${params.cid}`} className="block mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md"
              >
                Add your review
              </motion.button>
            </Link>
          </motion.section>
        </div>
      </motion.div>

      {/* Edit Review Popup */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-lg shadow-lg w-1/3"
            >
              <h3 className="text-xl font-semibold mb-4">Edit Review</h3>
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(0)}
                    onClick={() => setNewReviewStars(star)}
                    className="text-2xl focus:outline-none"
                  >
                    <FiStar
                      className={`${(hoverStar || newReviewStars) >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    />
                  </motion.button>
                ))}
              </div>
              <textarea
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                className="w-full p-4 border rounded-lg mb-4"
                rows={4}
              />
              <div className="flex space-x-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpdateReview} 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                  disabled={ newReviewStars === 0}
                >
                  Save Changes
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(false)} 
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Popup */}
      <AnimatePresence>
        {isConfirmingDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-lg shadow-lg w-1/3"
            >
              <h3 className="text-xl font-semibold mb-4">Are you sure you want to delete this review?</h3>
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmDeleteReview}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Delete
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}