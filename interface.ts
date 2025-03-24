export interface CampgroundItem {
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

export interface CammpgroundsJson {
  success: boolean;
  count: number;
  pagination: Object;
  data: CampgroundItem[];
}

export interface BookingItem {

  nameLastname: string;
  _id: string,
  tel: string;
  campground: CampgroundItem;
  checkInDate: string;   // Added check-in date
  checkOutDate: string;  // Added check-out date
  breakfast: boolean;    // Added breakfast option
}
