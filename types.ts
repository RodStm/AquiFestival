export interface Festival {
  id: string;
  name: string;
  poster: string; // uri
  location: string; // text or coords
  history: string;
  startDate: string;
  endDate: string;
  createdBy: string; // userId do criador
}

export interface User {
  id: string;
  name: string;
  age: number;
  sex: string;
  email: string;
  city: string;
  password?: string;
  isAdmin: boolean;
}

export interface Attendance {
  userId: string;
  festivalId: string;
}