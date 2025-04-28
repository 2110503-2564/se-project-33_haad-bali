export async function updatePromotion(
    token: string,
    promotionId: string,
    updateData: {
      promotionCode?: string;
      discountPercentage?: number;
      expiredDate?: Date;
      minSpend?: number;
      usedCount?: number;
      maxUses?: number;
    }
  ) {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/promotions/${promotionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData),
    });
  
    if (!response.ok) {
      throw new Error("Failed to update promotion");
    }
  
    return await response.json();
  }