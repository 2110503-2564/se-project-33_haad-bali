import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { BookingItem } from "../../../interface";

// API URL สำหรับดึงข้อมูล booking
const API_URL = "http://localhost:5000/api/v1/bookings";

// Initial state
type BookState = {
  bookItems: BookingItem[];
  loading: boolean;
  error: string | null;
};

const initialState: BookState = {
  bookItems: [],
  loading: false,
  error: null,
};

// createAsyncThunk สำหรับดึงข้อมูลการจอง
export const getBooking = createAsyncThunk(
  "book/getBooking",
  async (_, thunkAPI) => {
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ถ้ามีการใช้ JWT token
        },
      });
      const data = await response.json();
      return data.data; // ส่งข้อมูลการจองกลับมา
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch bookings");
    }
  }
);

// สร้าง slice ที่จัดการข้อมูล
export const bookSlice = createSlice({
  name: "book",
  initialState,
  reducers: {
    addBooking: (state, action: PayloadAction<BookingItem>) => {
      const existingIndex = state.bookItems.findIndex(
        (item) => item._id === action.payload._id
      );
      if (existingIndex !== -1) {
        state.bookItems[existingIndex] = action.payload;
      } else {
        state.bookItems.push(action.payload);
      }
    },

    removeBooking: (state, action: PayloadAction<BookingItem>) => {
      state.bookItems = state.bookItems.filter(
        (item) => item._id !== action.payload._id
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookItems = action.payload; // ใส่ข้อมูลที่ได้จาก API
      })
      .addCase(getBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addBooking, removeBooking } = bookSlice.actions;
export default bookSlice.reducer;
