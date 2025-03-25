// libs/addUser.ts
import axios from "axios";

export const addUser = async (userData: {
  username: string;
  name: string;
  telephone: string;
  email: string;
  password: string;
}) => {
  try {
    const response = await axios.post(
      "http://campgrounds.us-east-1.elasticbeanstalk.com/api/v1/auth/register", // Backend API for registration
      userData
    );
    return response.data; // Returns success or failure message
  } catch (error) {
    console.error("Error registering user:", error);
    throw error; // Rethrow the error to be handled in the frontend
  }
};
