// Change this depending on how you're running the app:
//
// - Android emulator      -> "http://10.0.2.2:5000"
// - iOS simulator         -> "http://localhost:5000"
// - Physical phone (WiFi) -> "http://<YOUR_LAPTOP_LAN_IP>:5000"  e.g. http://192.168.1.42:5000
//
// Replace 5000 with whatever port your Express backend runs on.
export const API_BASE_URL = "http://192.168.1.179:5000/api";

export const STATUS = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const ROLES = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
  REVIEWER: "reviewer",
  APPROVER: "approver",
};
