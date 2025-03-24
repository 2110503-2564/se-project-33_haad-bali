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
    nameLastname: string;
    tel: string;
    campground: string;
    bookDate: string;
  }