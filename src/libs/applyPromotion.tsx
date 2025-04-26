export default async function applyPromotion(token: string, promoCode:string, cartTotal:number) {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/v1/promotions/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: promoCode,
          cartTotal: cartTotal,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Promo applied:', data);
        return data;
      } else {
        console.error('Error applying promo:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
  