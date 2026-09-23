import { products } from "./products";

export const SALE_KEY = "amira_pending_sale_v1";
const productIds = new Set(products.map(product => product.id));

export function parseMoney(value) {
  const clean = String(value).trim().replace(/\s/g, "").replace(/R\$/gi, "");
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const number = Number(normalized);
  return Number.isFinite(number) && number > 0 ? Math.round(number * 100) : 0;
}

export function createSaleId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return `amr_${Array.from(bytes, byte => byte.toString(16).padStart(2,"0")).join("")}`;
}

export function validateSale(sale) {
  if (!sale || !/^amr_[a-f0-9]{32}$/.test(sale.id)) return null;
  const name = String(sale.name || "").trim();
  const phone = String(sale.phone || "").replace(/\D/g, "");
  const items = Array.isArray(sale.items) ? sale.items.filter(item => productIds.has(item.id) && Number.isSafeInteger(item.quantity) && item.quantity > 0 && item.quantity <= 10000) : [];
  if (name.length < 3 || phone.length < 10 || phone.length > 13 || !Number.isSafeInteger(sale.totalCents) || sale.totalCents <= 0 || sale.totalCents > 100000000 || !items.length) return null;
  return {id:sale.id,name,phone,items,totalCents:sale.totalCents,test:sale.test === true};
}
