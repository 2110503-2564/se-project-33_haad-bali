import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BookingItem } from "../../../interface";

type BookState = {
    bookItems: BookingItem[]
}
const initialState: BookState = {
    bookItems: []
}

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
        resetBookings: (state) => {
          state.bookItems = [];
      }
    }
})

export const { addBooking, removeBooking, resetBookings } = bookSlice.actions;
export default bookSlice.reducer;
