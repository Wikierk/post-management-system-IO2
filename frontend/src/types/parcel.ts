export interface Parcel {
  id?: number;
  trackingNumber?: string;
  receiverName: string;
  receiverEmail: string;
  receiverAddress: string;
  size: "SMALL" | "MEDIUM" | "LARGE";
  weight: number;
  isPriority: boolean;
  isInsured: boolean;
  price?: number;
  status?:
    | "CREATED"
    | "PAID"
    | "IN_SORTING"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "IN_COMPLAINT"
    | "RETURNED";
  createdAt?: string;
}
