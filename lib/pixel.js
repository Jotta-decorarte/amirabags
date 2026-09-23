export const PIXEL_ID = "908423904913977";
export const CONSENT_KEY = "amira_marketing_consent_v1";
let allowed = false;
let initialized = false;
const sentPurchases = new Set();
const contacts = new Map();

export function readStorage(key) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}

export function writeStorage(key, value) {
  try { window.localStorage.setItem(key, value); } catch { /* Navegação continua sem armazenamento. */ }
}

export function setPixelConsent(granted) {
  allowed = granted === true;
  if (typeof window === "undefined") return;
  if (window.fbq) window.fbq("consent", allowed ? "grant" : "revoke");
}

export function initializePixel(customer = null) {
  // Prévia e localhost nunca enviam testes ao pixel de produção.
  if (!allowed || typeof window === "undefined" || window.location.hostname !== "amirabags.vercel.app") return false;
  if (initialized) return true;
  if (!window.fbq) {
    const fbq = function () {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
      else fbq.queue.push(arguments);
    };
    fbq.queue = []; fbq.loaded = true; fbq.version = "2.0";
    window.fbq = fbq; window._fbq = fbq;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
  window.fbq("consent", "grant");
  window.fbq("set", "autoConfig", false, PIXEL_ID);
  const matching = customer ? normalizeCustomer(customer) : undefined;
  window.fbq("init", PIXEL_ID, matching);
  initialized = true;
  return true;
}

function normalizeCustomer(customer) {
  const parts = String(customer.name || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  const phone = String(customer.phone || "").replace(/\D/g, "");
  return { fn: parts[0] || "", ln: parts.slice(1).join(" "), ph: phone };
}

function send(event, params = {}, eventID) {
  if (!allowed || !initialized || typeof window.fbq !== "function") return false;
  window.fbq("trackSingle", PIXEL_ID, event, params, eventID ? { eventID } : {});
  return true; // Enfileirado; recebimento e atribuição são determinados pelo Meta.
}

export function trackPageView() { return send("PageView"); }

export function trackCatalogView() {
  return send("ViewContent", { content_name: "Catálogo Amira 2027", content_category: "Catálogo" });
}

export function trackWhatsAppContact(item, placement = "product_card") {
  const key = `${item.id}:${placement}`;
  const now = Date.now();
  if (now - (contacts.get(key) || 0) < 1500) return false;
  const sent = send("Contact", {
    content_name: item.name,
    content_ids: [item.id],
    content_type: "product",
    contact_channel: "whatsapp",
    action_source_detail: "website_link_click",
    placement,
  });
  if (sent) contacts.set(key, now);
  return sent;
}

export function trackPurchase(order) {
  if (!order || order.test || !/^amr_[a-f0-9]{32}$/.test(order.id) || !Number.isSafeInteger(order.totalCents) || order.totalCents <= 0 || !Array.isArray(order.items) || !order.items.length) return false;
  const key = `amira_purchase_v1_${order.id}`;
  if (sentPurchases.has(order.id) || readStorage(key)) return false;
  const sent = send("Purchase", {
    value: order.totalCents / 100,
    currency: "BRL",
    content_type: "product",
    content_ids: order.items.map(item => item.id),
    contents: order.items.map(item => ({ id: item.id, quantity: item.quantity })),
    num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
    order_id: order.id,
  }, `purchase_${order.id}`);
  if (sent) { sentPurchases.add(order.id); writeStorage(key, "queued"); }
  return sent;
}
