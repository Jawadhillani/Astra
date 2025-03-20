// app/types.ts
export interface Car {
    id: number;
    manufacturer: string;
    model: string;
    year: number;
    body_type?: string;
    engine_info?: string;
    transmission?: string;
    fuel_type?: string;
    mpg?: number;
  }
  
  export interface Review {
    id: number;
    car_id: number;
    author?: string;
    rating: number;
    review_text: string;
    review_date?: string;
    review_title?: string;
  }
  
  export interface CarListingProps {
    onSelectCar?: (id: number) => void;
  }