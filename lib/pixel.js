export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "908423904913977";

export const pixelReady = () =>
  typeof window !== "undefined" && typeof window.fbq === "function";

export function trackInitiateCheckout(productName, value) {
  if (!pixelReady()) return;
  window.fbq("track", "InitiateCheckout", {
    content_name: productName,
    value: value,
    currency: "BRL"
  });
}

export function trackPurchase(productName, value) {
  if (!pixelReady()) return;
  window.fbq("track", "Purchase", {
    content_name: productName,
    value: value,
    currency: "BRL"
  });
}

export function trackViewContent(productName, value) {
  if (!pixelReady()) return;
  window.fbq("track", "ViewContent", {
    content_name: productName,
    value: value,
    currency: "BRL"
  });
}
