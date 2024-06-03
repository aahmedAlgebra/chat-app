// types.ts
// types.ts
export interface Message {
  id: number; // Ensure this field is correctly named and used
  text: string; // Ensure this field is correctly named and used
  sender: string;
  displayName: string;
  timestamp?: number;
}

export interface ApiMessage {

  message: string;
  sender: string;
  displayName: string;
  recipient: string;
  timestamp?: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  id?: string;
}
