'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { PromotionItem } from '../../interface';
import { getSession } from "next-auth/react";
import addPromotion from '@/libs/addPromotion';
import { updatePromotion } from '@/libs/updatePromotion';
import { deletePromotion } from '@/libs/deletePromotion';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function AdminPromotionManagement({ 
  promotions, 
  onPromotionsUpdated 
}: { 
  promotions: PromotionItem[], 
  onPromotionsUpdated: () => void 
}) {
  const [newPromotion, setNewPromotion] = useState({
    promotionCode: '',
    discountPercentage: 10,
    expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    minSpend: 0,
    maxUses: 100
  });
  
  const [editingPromotion, setEditingPromotion] = useState<{
    _id: string;
    promotionCode: string;
    discountPercentage: number;
    expiredDate: string | number | Date;
    minSpend?: number;
    maxUses?: number;
  } | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddPromotion = async () => {
    if (!newPromotion.promotionCode) {
      toast.error('Promotion code is required');
      return;
    }
    try {
      const session = await getSession();
      const token = (session?.user as any)?.token;
      
      await addPromotion(token, {
        promotionCode: newPromotion.promotionCode,
        discountPercentage: newPromotion.discountPercentage,
        expiredDate: new Date(newPromotion.expiredDate),
        minSpend: newPromotion.minSpend,
        maxUses: newPromotion.maxUses
      });
      
      toast.success('Promotion added successfully!');
      setNewPromotion({
        promotionCode: '',
        discountPercentage: 10,
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        minSpend: 0,
        maxUses: 100
      });
      setIsAdding(false);
      onPromotionsUpdated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add promotion');
    }
  };

  const handleUpdatePromotion = async () => {
    if (!editingPromotion) return;
    try {
      const session = await getSession();
      const token = (session?.user as any)?.token;
      
      await updatePromotion(token, editingPromotion._id, {
        promotionCode: editingPromotion.promotionCode,
        discountPercentage: editingPromotion.discountPercentage,
        expiredDate: new Date(editingPromotion.expiredDate),
        minSpend: editingPromotion.minSpend,
        maxUses: editingPromotion.maxUses
      });
      
      toast.success('Promotion updated successfully!');
      setEditingPromotion(null);
      onPromotionsUpdated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update promotion');
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        const session = await getSession();
        const token = (session?.user as any)?.token;
        
        await deletePromotion(id, token);
        toast.success('Promotion deleted successfully!');
        onPromotionsUpdated();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete promotion');
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="ml-10 p-6 bg-white rounded-lg shadow-md"
    >
      <h3 className="text-2xl font-bold mb-6 text-gray-800">Promotion Management</h3>
      
      {/* Add New Promotion Section */}
      <motion.div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-700">{!isAdding ? 'Promotion' : 'Adding New Promotion'}</h4>
          <motion.button
            onClick={() => setIsAdding(!isAdding)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-md ${isAdding ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
          >
            {isAdding ? 'Cancel' : 'Add New Promotion'}
          </motion.button>
        </div>

        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
          >
            <h4 className="font-semibold mb-4 text-gray-700">New Promotion Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <motion.div whileHover={{ scale: 1.01 }}>
                <label className="block text-sm font-medium mb-1 text-gray-600">Promo Code *</label>
                <input
                  type="text"
                  value={newPromotion.promotionCode}
                  onChange={(e) => setNewPromotion({...newPromotion, promotionCode: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. SUMMER20"
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }}>
                <label className="block text-sm font-medium mb-1 text-gray-600">Discount (%) *</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newPromotion.discountPercentage}
                    onChange={(e) => setNewPromotion({...newPromotion, discountPercentage: parseInt(e.target.value) || 0})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-gray-400">%</span>
                </div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }}>
                <label className="block text-sm font-medium mb-1 text-gray-600">Expiry Date *</label>
                <input
                  type="date"
                  value={newPromotion.expiredDate.split('T')[0]}
                  onChange={(e) => setNewPromotion({...newPromotion, expiredDate: new Date(e.target.value).toISOString()})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }}>
                <label className="block text-sm font-medium mb-1 text-gray-600">Minimum Spend ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">$</span>
                  <input
                    type="number"
                    min="0"
                    value={newPromotion.minSpend || 0}
                    onChange={(e) => setNewPromotion({...newPromotion, minSpend: parseInt(e.target.value) || 0})}
                    className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }}>
                <label className="block text-sm font-medium mb-1 text-gray-600">Maximum Uses</label>
                <input
                  type="number"
                  min="1"
                  value={newPromotion.maxUses || 100}
                  onChange={(e) => setNewPromotion({...newPromotion, maxUses: parseInt(e.target.value) || 100})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </motion.div>
            </div>
            <motion.button
              onClick={handleAddPromotion}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              disabled={!newPromotion.promotionCode}
            >
              Create Promotion
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Current Promotions List */}
      <div>
        <h4 className="text-lg font-semibold mb-4 text-gray-700">Active Promotions</h4>
        {promotions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200"
          >
            <p className="text-gray-500">No promotions available</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {promotions.map(promo => (
              <motion.div 
                key={promo._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {editingPromotion?._id === promo._id ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div whileHover={{ scale: 1.01 }}>
                        <label className="block text-sm font-medium mb-1 text-gray-600">Promo Code *</label>
                        <input
                          type="text"
                          value={editingPromotion.promotionCode}
                          onChange={(e) => setEditingPromotion({...editingPromotion, promotionCode: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.01 }}>
                        <label className="block text-sm font-medium mb-1 text-gray-600">Discount (%) *</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={editingPromotion.discountPercentage}
                            onChange={(e) => setEditingPromotion({...editingPromotion, discountPercentage: parseInt(e.target.value) || 0})}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="absolute right-3 top-2 text-gray-400">%</span>
                        </div>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.01 }}>
                        <label className="block text-sm font-medium mb-1 text-gray-600">Expiry Date *</label>
                        <input
                          type="date"
                          value={new Date(editingPromotion.expiredDate).toISOString().split('T')[0]}
                          onChange={(e) => setEditingPromotion({...editingPromotion, expiredDate: new Date(e.target.value).toISOString()})}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.01 }}>
                        <label className="block text-sm font-medium mb-1 text-gray-600">Minimum Spend ($)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-400">$</span>
                          <input
                            type="number"
                            min="0"
                            value={editingPromotion.minSpend || 0}
                            onChange={(e) => setEditingPromotion({...editingPromotion, minSpend: parseInt(e.target.value) || 0})}
                            className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.01 }}>
                        <label className="block text-sm font-medium mb-1 text-gray-600">Maximum Uses</label>
                        <input
                          type="number"
                          min="1"
                          value={editingPromotion.maxUses || 100}
                          onChange={(e) => setEditingPromotion({...editingPromotion, maxUses: parseInt(e.target.value) || 100})}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </motion.div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                      <motion.button
                        onClick={() => setEditingPromotion(null)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={handleUpdatePromotion}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Save Changes
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-3 md:mb-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-blue-600">{promo.promotionCode}</span>
                        <motion.span 
                          whileHover={{ scale: 1.1 }}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full"
                        >
                          {promo.discountPercentage}% OFF
                        </motion.span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Valid until:</span> {new Date(promo.expiredDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Requirements:</span> Min spend ${promo.minSpend?.toFixed(2) || '0'} | Max uses: {promo.maxUses || '∞'}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={() => setEditingPromotion({
                          _id: promo._id,
                          promotionCode: promo.promotionCode,
                          discountPercentage: promo.discountPercentage,
                          expiredDate: promo.expiredDate,
                          minSpend: promo.minSpend,
                          maxUses: promo.maxUses
                        })}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors text-sm font-medium"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeletePromotion(promo._id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}