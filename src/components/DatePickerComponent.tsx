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
  required = false, // Default to false if not provided
}: {
  label: string;
  value: Dayjs | null;
  onDateChange: Function;
  minDate?: Dayjs | null; // Accept null but will handle it
  required?: boolean;
}) {
  // Ensure minDate is either undefined or a valid Dayjs object
  const validMinDate = minDate ?? undefined;

  return (
    <div className="w-fit space-y-4">
      <div className="text-md text-left text-gray-600">{label}</div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          className="bg-white"
          value={value}
          onChange={(newDate) => onDateChange(newDate)}
          minDate={validMinDate} // Pass valid value (undefined or Dayjs)
        />
      </LocalizationProvider>
    </div>
  );
}
