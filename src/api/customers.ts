import { authFetch } from "./client";

export interface Customer {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  business_name?: string;
  gst_number?: string;
  customer_type: "retail" | "wholesale" | "distributor";
  address?: string;
  status: "lead" | "active" | "inactive";
  follow_up_date?: string;
  created_at: string;
}

export interface CustomerNote {
  id: number;
  note: string;
  created_at: string;
}

export async function getCustomers(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const data = await authFetch(`/customers${query}`);
  return data.customers as Customer[];
}

export async function getCustomerById(id: string) {
  const data = await authFetch(`/customers/${id}`);
  return data as { customer: Customer; notes: CustomerNote[] };
}

export async function createCustomer(payload: Partial<Customer>) {
  const data = await authFetch("/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.customer as Customer;
}

export async function updateCustomer(id: string, payload: Partial<Customer>) {
  const data = await authFetch(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.customer as Customer;
}

export async function addCustomerNote(id: string, note: string) {
  const data = await authFetch(`/customers/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
  return data.note as CustomerNote;
}
