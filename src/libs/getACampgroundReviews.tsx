export default async function getACampgroundReviews(id:string) {
  const response = await fetch(`${process.env.BACKEND_URL}/api/v1/campgrounds/${id}/reviews`);

  if (!response.ok) { 
    throw new Error('Failed to fetch reviews');
  }

  return response.json(); // { success, count, data: [...] }
}
