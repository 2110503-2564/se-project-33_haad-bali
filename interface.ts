export interface CampgroundItem {
  breakfastPrice: number;
  pricePerNight: number;
  _id: string;
  name: string;
  address: string;
  district: string;
  province: string;
  postalcode: string;
  tel: string;
  picture: string;
  breakfast: boolean;  // Indicating if breakfast is available
  __v: number;
  id: string;
}

export interface CampgroundsJson {
  success: boolean;
  count: number;
  pagination: Object;
  data: CampgroundItem[];
}
export interface BookingsJson {
  success: boolean;
  count: number;
  pagination: Object;
  data: BookingItem[];
}
export interface BookingItem {
  _id: string,
  CheckInDate: string;   // Added check-in date
  CheckOutDate: string;  // Added check-out date
  breakfast: boolean;    // Added breakfast option
  campground: CampgroundItem;
  apptDate: string | number | Date;
  user:string;
  tel: string;
  totalPrice: number
  
}
export interface PromotionJson {
  success: boolean;
  count: number;
  pagination: Object;
  data: PromotionItem[];
}
export interface PromotionItem {
  _id:string,
  promotionCode:string,
  discountPercentage:number,
  expiredDate: string | number | Date,
  minSpend:number,
  usedCount:number
}
