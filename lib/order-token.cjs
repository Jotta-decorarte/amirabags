const { sign, verify } = require('node:crypto');
const MAX_AGE = 90 * 24 * 60 * 60;
const IDS = new Set(['bolsa-aurora','bolsa-bella','bolsa-serena','bolsa-jade','necessaire-lua','porta-chinelo']);

function validateOrder(order, now = Math.floor(Date.now() / 1000)) {
  if (!order || order.v !== 1 || !/^amr_[a-f0-9]{32}$/.test(order.id)) throw new Error('Pedido inválido');
  if (!Number.isSafeInteger(order.totalCents) || order.totalCents <= 0 || order.totalCents > 100000000) throw new Error('Valor inválido');
  if (!Number.isInteger(order.iat) || !Number.isInteger(order.exp) || order.iat > now + 60 || order.exp <= now || order.exp - order.iat > MAX_AGE || order.exp <= order.iat) throw new Error('Link vencido ou inválido');
  if (typeof order.test !== 'boolean' || !Array.isArray(order.items) || !order.items.length || order.items.length > 6) throw new Error('Itens inválidos');
  const ids = new Set();
  for (const item of order.items) {
    if (!IDS.has(item.id) || ids.has(item.id) || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 10000) throw new Error('Item inválido');
    ids.add(item.id);
  }
  // Retornar apenas campos permitidos; nunca dados pessoais.
  return { v: 1, id: order.id, totalCents: order.totalCents, items: order.items.map(({id,quantity})=>({id,quantity})), iat: order.iat, exp: order.exp, test: order.test };
}

function signOrder(order, privateKey) {
  const clean = validateOrder(order);
  const payload = Buffer.from(JSON.stringify(clean)).toString('base64url');
  return `${payload}.${sign(null, Buffer.from(payload), privateKey).toString('base64url')}`;
}

function verifyOrder(token, publicKey, now) {
  if (typeof token !== 'string' || token.length > 4096 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) throw new Error('Link inválido');
  const [payload, signature] = token.split('.');
  if (!verify(null, Buffer.from(payload), publicKey, Buffer.from(signature,'base64url'))) throw new Error('Assinatura inválida');
  return validateOrder(JSON.parse(Buffer.from(payload,'base64url').toString('utf8')), now);
}
module.exports = { validateOrder, signOrder, verifyOrder, MAX_AGE };
