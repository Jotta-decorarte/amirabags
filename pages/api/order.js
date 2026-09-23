import { verifyOrder } from "../../lib/order-token.cjs";
import signingKey from "../../lib/order-public-key.json";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({error:"Método inválido"}); }
  try { return res.status(200).json({order:verifyOrder(req.body?.token,signingKey.publicKey)}); }
  catch { return res.status(400).json({error:"Este link é inválido ou expirou. Peça um novo link à Amira."}); }
}

export const config = { api: { bodyParser: { sizeLimit: "8kb" } } };
