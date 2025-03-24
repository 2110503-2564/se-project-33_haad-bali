'use client'
import { DatePicker } from "@mui/x-date-pickers"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { Select, MenuItem } from "@mui/material"
import { Dayjs } from "dayjs"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function DateReserve({ onDateChange, onLocationChange }: { onDateChange: Function, onLocationChange: Function }) {
    const urlParams = useSearchParams();
    const name = urlParams.get('name');

    // ตั้งค่า location จาก name ถ้ามีค่า, ถ้าไม่มีให้ใช้ค่าเริ่มต้น 'Bloom'
    const [location, setLocation] = useState<string>(name || 'Bloom');
    const [reserveDate, setReserveDate] = useState<Dayjs | null>(null);

    // อัปเดต location เมื่อ name เปลี่ยนแปลง
    useEffect(() => {
        if (name=="The Bloom Pavilion") {
            setLocation('Bloom');
        }
        if (name=="Spark Space") {
            setLocation('Spark');
        }
        if (name=="The Grand Table") {
            setLocation('GrandTable');
        }
    }, [name]);

    return (
        <div className="bg-slate-100 rounded-lg space-x-5 space-y-2 
        w-fit px-10 py-5 flex flex-row justify-center">

            {/* Date Picker */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    className="bg-white"
                    value={reserveDate}
                    onChange={(value) => { 
                        if (value) {
                            setReserveDate(value); 
                            onDateChange(value); 
                        }
                    }}
                />
            </LocalizationProvider>

            {/* Venue Selection */}
            <Select
                variant="standard"
                id="venue"
                value={location}
                onChange={(e) => { 
                    const newLocation = e.target.value;
                    setLocation(newLocation); 
                    onLocationChange(newLocation); 
                }}
                className="h-[2em] w-[200px]"
                sx={{ fontFamily: "serif" }}
            >
                <MenuItem className="font-serif" value="Bloom">The Bloom Pavilion</MenuItem>
                <MenuItem className="font-serif" value="Spark">Spark Space</MenuItem>
                <MenuItem className="font-serif" value="GrandTable">The Grand Table</MenuItem>
            </Select>
        </div>
    )
}
