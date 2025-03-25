'use client'
import { useState, useEffect } from 'react';
import BookingList from "@/components/BookingList";
import { FiCalendar, FiLoader } from 'react-icons/fi';

function BookingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center">
      <div className="text-center space-y-4">
        {/* Animated calendar icon */}
        <div className="animate-bounce-slow text-indigo-500">
          <FiCalendar className="text-5xl mx-auto" />
        </div>

        {/* Loading text */}
        <h2 className="text-xl font-medium text-gray-700">
          Fetching your bookings
        </h2>

        {/* Minimalist loading dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    </div>
  );
}

export default function MyBooking() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <BookingLoading />
        ) : (
          <>
            <BookingList />
          </>
        )}
      </div>
    </main>
  );
}