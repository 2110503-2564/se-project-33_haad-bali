'use client'
import React, { useEffect, useState } from 'react';
import { PromotionItem , PromotionJson } from '../../../interface';
import getPromotions from '@/libs/getPromotions';

export default function Promotion() {
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const pro: PromotionJson = await getPromotions();
        setPromotions(pro.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch promotions');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-12">
        <h2 className="text-5xl font-bold text-center mb-2 tracking-wider">
          REDEEM
        </h2>
        <h1 className="text-8xl font-bold text-center mb-10 tracking-wider">
          YOUR PROMOTIONS
        </h1>
        
        <div className="flex flex-col items-center justify-center gap-8">
          {promotions.map((promo) => (
            <div key={promo._id} className="w-full max-w-3xl h-40 border border-gray-200 rounded-lg shadow-sm flex flex-row items-center justify-center p-6 bg-white">
              <div className="text-3xl font-bold mb-2 mr-auto">code : {promo.promotionCode}</div>
              <div className="text-3xl font-bold mb-2 mr-auto">{promo.discountPercentage}% OFF
                <div className="text-xl font-normal mb-2 mt-5">valid until : {new Date(promo.expiredDate).toLocaleDateString
  ('en-UK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} </div>
              </div>
              <button className="w-24 py-3 font-bold bg-black text-white uppercase tracking-wider hover:bg-white hover:text-black transition-colors">
                APPLY
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
