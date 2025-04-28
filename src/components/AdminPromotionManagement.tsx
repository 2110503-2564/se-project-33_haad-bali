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
import dayjs from 'dayjs';

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
  
  const [editingPromotion, setEditingPromotion] = useState<PromotionItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAddPromotion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!newPromotion.promotionCode.trim()) {
      toast.error('Promotion code is required');
      return;
    }

    if (promotions.some(p => p.promotionCode.toLowerCase() === newPromotion.promotionCode.toLowerCase())) {
      toast.error('Promotion code already exists');
      return;
    }

    if (newPromotion.discountPercentage <= 0 || newPromotion.discountPercentage > 100) {
      toast.error('Discount must be between 1% and 100%');
      return;
    }

    const expirationDate = new Date(newPromotion.expiredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (expirationDate <= today) {
      toast.error('Expiration date must be in the future');
      return;
    }

    if (newPromotion.maxUses <= 0) {
      toast.error('Usage limit must be a positive number');
      return;
    }

    try {
      const session = await getSession();
      if (!session) {
        toast.error('You must be logged in');
        return;
      }

      const token = (session.user as any)?.token;
      await addPromotion(token, {
        promotionCode: newPromotion.promotionCode,
        discountPercentage: newPromotion.discountPercentage,
        expiredDate: new Date(newPromotion.expiredDate),
        minSpend: newPromotion.minSpend,
        maxUses: newPromotion.maxUses,
      });

      toast.success('Promotion added successfully!');
      setNewPromotion({
        promotionCode: '',
        discountPercentage: 10,
        expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        minSpend: 0,
        maxUses: 100,
      });
      setIsAdding(false);
      onPromotionsUpdated();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add promotion');
    }
  };

  const handleUpdatePromotion = async () => {
    if (!editingPromotion) return;
    
    if (!editingPromotion.promotionCode.trim()) {
      toast.error('Promotion code is required');
      return;
    }

    if (editingPromotion.discountPercentage <= 0 || editingPromotion.discountPercentage > 100) {
      toast.error('Discount must be between 1% and 100%');
      return;
    }

    const expirationDate = new Date(editingPromotion.expiredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (expirationDate <= today) {
      toast.error('Expiration date must be in the future');
      return;
    }

    if (editingPromotion.maxUses <= 0) {
      toast.error('Usage limit must be a positive number');
      return;
    }

    try {
      setIsUpdating(true);
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
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        const session = await getSession();
        const token = (session?.user as any)?.token;
        
        await deletePromotion(token, id);
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
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-600">
              <div className="col-span-3">Promo Code</div>
              <div className="col-span-2">Discount</div>
              <div className="col-span-3">Valid Until</div>
              <div className="col-span-2">Requirements</div>
              <div className="col-span-2">Actions</div>
            </div>
            
            {/* Scrollable content */}
            <div className="max-h-[500px] overflow-y-auto">
              {promotions.map((promo) => (
                <div key={promo._id}>
                  {editingPromotion?._id === promo._id ? (
                    // EDIT FORM
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-blue-50 border-b border-gray-200"
                    >
                      <h4 className="font-semibold mb-4 text-blue-800">Editing Promotion</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-600">Promo Code *</label>
                          <input
                            type="text"
                            value={editingPromotion.promotionCode}
                            onChange={(e) => setEditingPromotion({
                              ...editingPromotion,
                              promotionCode: e.target.value
                            })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-600">Discount (%) *</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={editingPromotion.discountPercentage}
                            onChange={(e) => setEditingPromotion({
                              ...editingPromotion,
                              discountPercentage: Number(e.target.value)
                            })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-600">Expiry Date *</label>
                          <input
                            type="date"
                            value={dayjs(editingPromotion.expiredDate).format('YYYY-MM-DD')}
                            onChange={(e) => setEditingPromotion({
                              ...editingPromotion,
                              expiredDate: new Date(e.target.value).toISOString()
                            })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-600">Minimum Spend ($)</label>
                          <input
                            type="number"
                            min="0"
                            value={editingPromotion.minSpend || 0}
                            onChange={(e) => setEditingPromotion({
                              ...editingPromotion,
                              minSpend: Number(e.target.value)
                            })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-600">Maximum Uses</label>
                          <input
                            type="number"
                            min="1"
                            value={editingPromotion.maxUses || 100}
                            onChange={(e) => setEditingPromotion({
                              ...editingPromotion,
                              maxUses: Number(e.target.value)
                            })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingPromotion(null)}
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md border border-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdatePromotion}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:bg-blue-400"
                        >
                          {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    // PROMOTION ITEM
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-12 gap-4 p-4 items-center border-b border-gray-100 hover:bg-gray-50"
                    >
                      <div className="col-span-3 font-medium text-blue-600">
                        {promo.promotionCode}
                      </div>
                      
                      <div className="col-span-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          {promo.discountPercentage}% OFF
                        </span>
                      </div>
                      
                      <div className="col-span-3 text-sm text-gray-600">
                        {dayjs(promo.expiredDate).format('MMM D, YYYY h:mm A')}
                      </div>
                      
                      <div className="col-span-2 text-sm text-gray-600">
                        <div>Min: ${promo.minSpend?.toFixed(2) || "0"}</div>
                        <div>Max: {promo.maxUses || "∞"}</div>
                      </div>
                      
                      <div className="col-span-2 flex space-x-2">
                        <motion.button
                          onClick={() => setEditingPromotion({
                            _id: promo._id,
                            promotionCode: promo.promotionCode,
                            discountPercentage: promo.discountPercentage,
                            expiredDate: promo.expiredDate,
                            minSpend: promo.minSpend,
                            maxUses: promo.maxUses,
                            usedCount: 0 
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
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}