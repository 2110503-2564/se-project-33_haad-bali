'use client';
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

export default function DatePickerComponent({
  label,
  value,
  onDateChange,
  minDate,
}: {
  label: string;
  value: Dayjs | null;
  onDateChange: Function;
  minDate?: Dayjs | null;
}) {
  return (
    <div className="w-fit space-y-4">
      <div className="text-md text-left text-gray-600">{label}</div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          className="bg-white"
          value={value}
          onChange={(newDate) => onDateChange(newDate)}
          minDate={minDate}
        />
      </LocalizationProvider>
    </div>
  );
}
