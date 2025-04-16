export default async function  getCampground(id:string) {
  
 // await new Promise((resolve) => setTimeout(resolve, 500));

  const response = await fetch(`${process.env.BACKEND_URL}/api/v1/campgrounds/${id}`);

  if (!response.ok) {
      console.error("Error fetching Campground:", response.status);
      throw new Error("Failed to fetch Campground");
  }

  return await response.json();
}