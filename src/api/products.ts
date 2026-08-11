import { authFetch } from "./client";

export interface Product {
  id: number;
  name: string;
  sku: string;
  category?: string;
  unit_price: number;
  current_stock: number;
  min_stock_alert: number;
  location?: string;
  created_at: string;
}

export interface StockMovement {
  id: number;
  quantity_changed: number;
  movement_type: "IN" | "OUT";
  reason: string;
  created_at: string;
}

export async function getProducts(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const data = await authFetch(`/products${query}`);
  return data.products as Product[];
}

export async function getProductById(id: string) {
  const data = await authFetch(`/products/${id}`);
  return data as { product: Product; movements: StockMovement[] };
}

export async function createProduct(payload: Partial<Product>) {
  const data = await authFetch("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.product as Product;
}

export async function updateProduct(id: string, payload: Partial<Product>) {
  const data = await authFetch(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.product as Product;
}

export async function adjustStock(
  id: string,
  quantity: number,
  movement_type: "IN" | "OUT",
  reason: string,
) {
  const data = await authFetch(`/products/${id}/stock`, {
    method: "POST",
    body: JSON.stringify({ quantity, movement_type, reason }),
  });
  return data as { message: string; current_stock: number };
}
