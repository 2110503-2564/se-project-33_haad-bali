export async function updateReview(token: string, reviewId: string, reviewData: any) {
    console.log("review data",reviewData)
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
        throw new Error("Failed to update review");
    }

    return await response.json();
}