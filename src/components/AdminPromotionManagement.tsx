"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { PromotionItem } from "../../interface";
import { getSession } from "next-auth/react";
import addPromotion from "@/libs/addPromotion";
import { updatePromotion } from "@/libs/updatePromotion";
import { deletePromotion } from "@/libs/deletePromotion";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function AdminPromotionManagement({
  promotions,
  onPromotionsUpdated,
}: {
  promotions: PromotionItem[];
  onPromotionsUpdated: () => void;
}) {
  const [newPromotion, setNewPromotion] = useState({
    promotionCode: "",
    discountPercentage: 10,
    expiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    minSpend: 0,
    maxUses: 100,
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

  const handleAddPromotion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Immediate validation toasts
    if (!newPromotion.promotionCode.trim()) {
      toast.error("Promotion code is required", {
        toastId: "promo-code-required",
      });
      return;
    }

    if (
      promotions.some(
        (p) =>
          p.promotionCode.toLowerCase() ===
          newPromotion.promotionCode.toLowerCase()
      )
    ) {
      toast.error("Promotion code already exists", {
        toastId: "promo-code-exists",
      });
      return;
    }

    if (
      newPromotion.discountPercentage <= 0 ||
      newPromotion.discountPercentage > 100
    ) {
      toast.error("Discount must be 1-100%", { toastId: "discount-range" });
      return;
    }

    const expirationDate = new Date(newPromotion.expiredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expirationDate <= today) {
      toast.error("Expiration date must be future", { toastId: "future-date" });
      return;
    }

    if (newPromotion.maxUses <= 0) {
      toast.error("Usage limit must be positive", { toastId: "positive-uses" });
      return;
    }

    try {
      const session = await getSession();
      if (!session) {
        toast.error("Login required", { toastId: "login-required" });
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

      // Success toast with slight delay
      setTimeout(() => {
        toast.success("Promotion added!", {
          toastId: "promo-added",
          autoClose: 2000,
        });
      }, 100);

      setNewPromotion({
        promotionCode: "",
        discountPercentage: 10,
        expiredDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        minSpend: 100,
        maxUses: 100,
      });
      setIsAdding(false);
      onPromotionsUpdated();
    } catch (error: any) {
      console.error("Add promotion error:", error);
      setTimeout(() => {
        toast.error(error.message || "Failed to add promotion", {
          toastId: "add-promo-error",
        });
      }, 0);
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
        maxUses: editingPromotion.maxUses,
      });

      toast.success("Promotion updated successfully!");
      setEditingPromotion(null);
      onPromotionsUpdated();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update promotion"
      );
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this promotion?")) {
      try {
        const session = await getSession();
        const token = (session?.user as any)?.token;

        await deletePromotion(token, id);
        toast.success("Promotion deleted successfully!");
        onPromotionsUpdated();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete promotion"
        );
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
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
        Promotion Management
      </h3>

      {/* Add New Promotion Section */}
      <motion.div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-700">
            {!isAdding ? "Promotion" : "Adding New Promotion"}
          </h4>
          <motion.button
            onClick={() => setIsAdding(!isAdding)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-md ${
              isAdding
                ? "bg-gray-500 hover:bg-gray-600"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white transition-colors`}
          >
            {isAdding ? "Cancel" : "Add New Promotion"}
          </motion.button>
        </div>

        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
          >
            <h4 className="font-semibold mb-4 text-gray-700">
              New Promotion Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <motion.div whileHover={{ scale: 1.01 }}>
                <label className="block text-sm font-medium mb-1 text-gray-600">
                  Promo Code *
                </label>
                <input
                  type="text"
                  value={newPromotion.promotionCode}
                  onChange={(e) =>
                    setNewPromotion({
                      ...newPromotion,
                      promotionCode: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. SUMMER20"
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }}>
                <label className="block text-sm font-medium mb-1 text-gray-600">
                  Discount (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newPromotion.discountPercentage}
                    onChange={(e) =>
                      setNewPromotion({
                        ...newPromotion,
                        discountPercentage: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-gray-400">
                    %
                  </span>
                </div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }}>
                <label className="block text-sm font-medium mb-1 text-gray-600">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  value={newPromotion.expiredDate.split("T")[0]}
                  onChange={(e) =>
                    setNewPromotion({
                      ...newPromotion,
                      expiredDate: new Date(e.target.value).toISOString(),
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={new Date().toISOString().split("T")[0]}
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }}>
                <label className="block text-sm font-medium mb-1 text-gray-600">
                  Minimum Spend ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">$</span>
                  <input
                    type="number"
                    min="0"
                    value={newPromotion.minSpend || 0}
                    onChange={(e) =>
                      setNewPromotion({
                        ...newPromotion,
                        minSpend: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }}>
                <label className="block text-sm font-medium mb-1 text-gray-600">
                  Maximum Uses
                </label>
                <input
                  type="number"
                  min="1"
                  value={newPromotion.maxUses || 100}
                  onChange={(e) =>
                    setNewPromotion({
                      ...newPromotion,
                      maxUses: parseInt(e.target.value) || 100,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </motion.div>
            </div>
            <form onSubmit={handleAddPromotion}>
              {/* your form fields */}
              <motion.button
                type="submit" // Important
                onClick={(e) => {
                  if (!newPromotion.promotionCode) {
                    e.preventDefault();
                    toast.error("Promotion code is required");
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Create Promotion
              </motion.button>
            </form>
          </motion.div>
        )}
      </motion.div>

      {/* Current Promotions List */}

<div className="mb-8">
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
      <div className="max-h-[500px] overflow-y-auto scrollable-promotions">
        {promotions.map((promo) => (
          <motion.div
            key={promo._id}
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
              {new Date(promo.expiredDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
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
        ))}
      </div>
    </div>
  )}
</div>
    </motion.div>
  );
}
