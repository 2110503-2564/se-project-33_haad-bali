export default async function  getCampground(id:string) {
  
  await new Promise((resolve) => setTimeout(resolve, 500));

  const response = await fetch(`http://localhost:5000/api/v1/campgrounds/${id}`);

  if (!response.ok) {
      console.error("Error fetching venue:", response.status);
      throw new Error("Failed to fetch venue");
  }

  return await response.json();
}