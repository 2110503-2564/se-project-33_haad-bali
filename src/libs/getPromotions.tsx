import { PromotionJson } from "../../interface";
export default async function getPromotions(): Promise<PromotionJson> {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/promotions`,
    );
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch promotion");
    }
    
    return await response.json();
  }
  