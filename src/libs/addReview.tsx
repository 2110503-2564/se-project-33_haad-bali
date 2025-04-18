export default async function addReview(
    token: string,
    campgroundId: string,
    reviewData: { text: string; star: number; }
  ) {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/campgrounds/${campgroundId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData),
    });
  
    if (!response.ok) {
      throw new Error("Failed to add review");
    }
  
    return await response.json();
  }
  