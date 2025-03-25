'use client';
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { TextField } from "@mui/material";

export default function DatePickerComponent({
  label,
  value,
  onDateChange,
  minDate,
  required = false,
  darkMode = false, // Add dark mode prop
}: {
  label: string;
  value: Dayjs | null;
  onDateChange: (date: Dayjs | null) => void;
  minDate?: Dayjs | null;
  required?: boolean;
  darkMode?: boolean; // New prop for dark mode
}) {
  const validMinDate = minDate ?? undefined;

  const handleDateChange = (newDate: Dayjs | null) => {
    onDateChange(newDate);
  };

  return (
    <div className={`w-fit space-y-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={value}
          onChange={handleDateChange}
          minDate={validMinDate}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: darkMode ? '#4B5563' : '#E5E7EB',
                  },
                  "&:hover fieldset": {
                    borderColor: darkMode ? '#9CA3AF' : '#D1D5DB',
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: darkMode ? '#6366F1' : '#3B82F6',
                  },
                  backgroundColor: darkMode ? '#1F2937' : 'white',
                  color: darkMode ? 'white' : 'inherit',
                },
                "& .MuiInputLabel-root": {
                  color: darkMode ? '#9CA3AF' : '#6B7280',
                },
                "& .MuiSvgIcon-root": {
                  color: darkMode ? '#9CA3AF' : '#6B7280',
                },
              }}
            />
          )}
          componentsProps={{
            actionBar: {
              sx: {
                  backgroundColor: darkMode ? '#1F2937' : 'white',
                  color: darkMode ? 'white' : 'inherit',
              },
            },
            desktopPaper: {
              sx: {
                backgroundColor: darkMode ? '#1F2937' : 'white',
                color: darkMode ? 'white' : 'inherit',
                "& .MuiPickersDay-root": {
                  color: darkMode ? 'white' : 'inherit',
                  "&.Mui-selected": {
                    backgroundColor: darkMode ? '#6366F1' : '#3B82F6',
                  },
                  "&.Mui-disabled": {
                    color: darkMode ? '#4B5563' : '#9CA3AF',
                  },
                },
              },
            },
          }}
        />
      </LocalizationProvider>
    </div>
  );
}