import { authFetch } from "./client";

export interface ChallanItemInput {
  product_id: number;
  quantity: number;
}

export interface Challan {
  id: number;
  challan_number: string;
  customer_id: number;
  customer_name: string;
  status: "draft" | "confirmed" | "cancelled";
  total_quantity: number;
  created_at: string;
  confirmed_at?: string;
}

export interface ChallanItem {
  id: number;
  product_id: number;
  product_name_snapshot: string;
  product_sku_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  subtotal: number;
}

export async function getChallans(status = "") {
  const query = status ? `?status=${status}` : "";
  const data = await authFetch(`/challans${query}`);
  return data.challans as Challan[];
}

export async function getChallanById(id: string) {
  const data = await authFetch(`/challans/${id}`);
  return data as { challan: Challan; items: ChallanItem[] };
}

export async function createChallan(
  customer_id: number,
  items: ChallanItemInput[],
) {
  const data = await authFetch("/challans", {
    method: "POST",
    body: JSON.stringify({ customer_id, items }),
  });
  return data as { challan: Challan; items: ChallanItem[] };
}

export async function confirmChallan(id: string) {
  const data = await authFetch(`/challans/${id}/confirm`, { method: "POST" });
  return data as { message: string; challan: Challan };
}

export async function cancelChallan(id: string) {
  const data = await authFetch(`/challans/${id}/cancel`, { method: "POST" });
  return data as { challan: Challan };
}
