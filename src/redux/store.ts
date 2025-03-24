import { combineReducers, configureStore, createAction } from "@reduxjs/toolkit";
import bookSlice from "./features/bookSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistReducer, FLUSH, PERSIST, PAUSE, REHYDRATE, PURGE, REGISTER } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { WebStorage } from "redux-persist/lib/types";

// ฟังก์ชันการสร้าง storage สำหรับ SSR และ CSR
function createPersistStorage(): WebStorage {
    const isServer = typeof window === 'undefined';
    if (isServer) {
        return {
            getItem() {
                return Promise.resolve(null);
            },
            setItem() {
                return Promise.resolve();
            },
            removeItem() {
                return Promise.resolve();
            },
        };
    }
    return createWebStorage('local');
}

const storage = createPersistStorage();

// การตั้งค่าของ redux-persist
const persistConfig = {
    key: "rootPersist",
    storage,
};

const rootReducer = combineReducers({
    bookSlice,
});

const reduxPersistReducer = persistReducer(persistConfig, rootReducer);

// สร้าง store พร้อม middleware ที่ไม่ให้เกิดปัญหา serializable check
export const store = configureStore({
    reducer: reduxPersistReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
// การใช้ useSelector ที่มี typing แบบเจาะจง
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
