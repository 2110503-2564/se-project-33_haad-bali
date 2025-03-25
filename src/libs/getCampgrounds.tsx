import { CampgroundsJson } from "../../interface";

export default async function getCampgrounds(): Promise<CampgroundsJson> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const response = await fetch("http://campgrounds.us-east-1.elasticbeanstalk.com/api/v1/campgrounds");

    if (!response.ok) {
      throw new Error("Failed to fetch venues");
    }

    const data: CampgroundsJson = await response.json();
    return data;

}
