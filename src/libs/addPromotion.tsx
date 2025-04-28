export default async function addPromotion(
    token: string,
    promotionData: {
      promotionCode: string;
      discountPercentage: number;
      expiredDate: Date;
      minSpend?: number;
      usedCount?: number;
      maxUses?: number;
    }
  ) {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(promotionData),
    });
  
    if (!response.ok) {
      throw new Error("Failed to add promotion");
    }
  
    return await response.json();
  }