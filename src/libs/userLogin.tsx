import { METHODS } from "http";
import {CampgroundsJson  } from "../../interface";
import { headers } from "next/headers";

export default async function userLogin(userEmail:string,userPassword:string){
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/login`,{
    method:"POST",
    headers:{
        "Content-Type":"application/json",
    },
    body:JSON.stringify({
        email: userEmail,
        password: userPassword,
    }),
})
    if (!response.ok) {
      throw new Error("Failed to fetch venues");
    }
    return await response.json();

}
