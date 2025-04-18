export async function deleteReview(token: string, reviewId: string) {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to delete review");
    }

    return await response.json();
}