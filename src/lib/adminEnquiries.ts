import { request } from "./adminData";

export type EnquiryStatus = "new" | "read" | "archived";

export interface Enquiry {
  id: number;
  name: string;
  email: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
}

export function listEnquiries() {
  return request<{ items: Enquiry[] }>("/api/admin/enquiries");
}

export function setEnquiryStatus(id: number, status: EnquiryStatus) {
  return request<{ saved: boolean }>(`/api/admin/enquiries/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export function deleteEnquiry(id: number) {
  return request<{ deleted: boolean }>(`/api/admin/enquiries/${id}`, { method: "DELETE" });
}