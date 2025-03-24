export interface CamgroundItem {
    _id: string,
    name: string,
    address: string,
    district: string,
    province: string,
    postalcode: string,
    tel: string,
    picture: string,
    breakfast: boolean,
    __v: number,
    id: string
  }
  
  export interface CammpgroundsJson {
    success: boolean,
    count: number,
    pagination: Object,
    data: CamgroundItem[]
  }

  export interface BookingItem {
    checkInDate: string | number | Date;
    nameLastname: string;
    _id: string,
    tel: string;
    campground: CamgroundItem;
    bookDate: string;
  }