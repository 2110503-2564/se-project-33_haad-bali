import React from 'react';

export default function Promotion() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-12">
        <h2 className="text-5xl font-bold text-center mb-2 tracking-wider">
          REDEEM
        </h2>
        <h1 className="text-8xl font-bold text-center mb-10 tracking-wider">
          YOUR PROMOTIONS
        </h1>
        
        <div className="flex flex-col items-center flex justify-center ">
          {/* 10% OFF Card */}
          <div className="w-64 h-80 border border-gray-200 rounded-lg shadow-sm flex flex-col items-center justify-center p-6 bg-white">
            <div className="text-4xl font-bold mb-8">10% OFF</div>
            <button className="w-full py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors">
              CLAIM
            </button>
          </div>
          
          {/* 30% OFF Card */}
          <div className="w-64 h-80 border border-gray-200 rounded-lg shadow-sm flex flex-col items-center justify-center p-6 bg-white">
            <div className="text-4xl font-bold mb-8">30% OFF</div>
            <button className="w-full py-3 bg-black text-white uppercase tracking-wider hover:bg-gray-800 transition-colors">
              CLAIM
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}