import { CampgroundsJson } from "../../interface";

export default async function getCampgrounds(): Promise<CampgroundsJson> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const response = await fetch("http://localhost:5000/api/v1/campgrounds");

    if (!response.ok) {
      throw new Error("Failed to fetch venues");
    }

    const data: CampgroundsJson = await response.json();
    return data;

}
