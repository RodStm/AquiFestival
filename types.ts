export interface Festival {
  id: string;
  name: string;
  poster: string;
  location: string;
  history: string;
  startDate: string;
  endDate: string;
  createdBy: string;
  suspended?: boolean;
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