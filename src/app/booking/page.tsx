'use client'
import DateReserve from "@/components/DateReserve"
import { TextField } from "@mui/material"
import { Dayjs } from "dayjs"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/redux/store"
import { addBooking } from "@/redux/features/bookSlice"
import { BookingItem } from "../../../interface"
import { getSession } from "next-auth/react"
import getUserProfile from "@/libs/getUserProfile"
import createBooking from "@/libs/createBooking"

export default function Booking() {
    const urlParams = useSearchParams();
    const vid = urlParams.get('id');
    const name = urlParams.get('name');

    const dispatch = useDispatch<AppDispatch>();

    // State สำหรับเก็บค่า
    const [bookDate, setBookDate] = useState<Dayjs | null>(null);
    const [bookLocation, setBookLocation] = useState<string>("");
    const [nameLastname, setNameLastname] = useState<string>(""); 
    const [tel, setTel] = useState<string>("");  
    const [user, setUser] = useState<{ name: string; username:string; email: string; tel: string; createdAt: string } | null>(null);


    // ดึงข้อมูลผู้ใช้
    useEffect(() => {
        const fetchUserProfile = async () => {
            const session = await getSession();
            console.log("Session:", session);
            const token = (session?.user as any)?.token; // ใช้ Type Assertion เพื่อหลีกเลี่ยง TS Error
            console.log("Session:", token);
            if (token) {
                const profile = await getUserProfile(token);
                setUser({
                    name: profile.data.name,
                    username:profile.data.username,
                    email: profile.data.email,
                    tel: profile.data.telephone,
                    createdAt: profile.data.createdAt,
                });

                // กำหนดค่าเริ่มต้นให้ Name และ Tel อัตโนมัติ
                setNameLastname(profile.data.name);
                setTel(profile.data.tel);
            }
        };
        fetchUserProfile();
    }, []);

    const makeBooking = async () => {
        if (!bookLocation || !bookDate || !nameLastname || !tel) {
            console.log("Please fill in all fields.");
            return;
        }
    
        const session = await getSession();
        const token = (session?.user as any)?.token;
        if (!token || !user) {
            console.log("User not authenticated");
            return;
        }
    
        const bookingData = {
            nameLastname: nameLastname,
            tel: tel,
            campground: bookLocation,
            bookDate: bookDate.format("YYYY-MM-DD"),
            userId: user.email,
        };
    
        try {
            const response = await createBooking(token, bookingData);
            console.log("Booking successful:", response);
        } catch (error) {
            console.error("Booking failed:", error);
        }
    };

    return (
        <main className="w-[100%] flex flex-col items-center space-y-6 font-serif text-black">
            <div className="text-2xl font-serif mt-6 text-black">Campground Booking</div>
            <div className="text-2xl font-serif mt-6 text-black">Booking {name}</div>

            {user && (
                <table className="table-auto border-separate border-spacing-2">
                    <tbody>
                    <tr>
                            <td className="font-semibold">Name</td>
                            <td>{user.name}</td>
                        </tr>
                        <tr>
                            <td className="font-semibold">Username</td>
                            <td>{user.username}</td>
                        </tr>
                        <tr>
                            <td className="font-semibold">Email</td>
                            <td>{user.email}</td>
                        </tr>
                        <tr>
                            <td className="font-semibold">Tel.</td>
                            <td>{user.tel}</td>
                        </tr>
                        <tr>
                            <td className="font-semibold">Member Since</td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                    </tbody>
                </table>
            )}

            <div className="w-fit">
                <div className="text-md text-left text-gray-600">Name</div>
                <TextField 
                    name="Name-Lastname"
                    label="Name-Lastname"
                    variant="standard"
                    className="w-[550px] rounded-lg bg-white"
                    value={nameLastname}
                    onChange={(e) => setNameLastname(e.target.value)} 
                />
            </div>

            <div className="w-fit">
                <div className="text-md text-left text-gray-600">Telephone</div>
                <TextField 
                    name="Contact-Number"
                    label="Contact-Number"
                    variant="standard"
                    className="w-[550px] rounded-lg bg-white"
                    value={tel}
                    onChange={(e) => setTel(e.target.value)}
                />
            </div>

            <div className="w-fit space-y-4">
                <div className="text-md text-left text-gray-600">Pickup Date and Location</div>
                <DateReserve 
                    onDateChange={(value: Dayjs) => { setBookDate(value) }} 
                    onLocationChange={(value: string) => setBookLocation(value)} 
                />
            </div>

            <button 
                className="block rounded-md bg-[#501717] hover:bg-[#731f1f] 
                px-3 py-2 text-white shadow-sm" 
                name="Book Campground"
                onClick={makeBooking}
            >
                Book Campground
            </button>
        </main>
    );
}
