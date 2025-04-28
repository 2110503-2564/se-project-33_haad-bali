export async function deletePromotion(
    token: string,
    promotionId: string
  ) {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/promotions/${promotionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
  
    if (!response.ok) {
      throw new Error("Failed to delete promotion");
    }
  
    return await response.json();
  }