const { sign, verify } = require('node:crypto');
const MAX_AGE = 90 * 24 * 60 * 60;
function validateOrder(order, now = Math.floor(Date.now() / 1000)) {
  if (!order || order.v !== 2 || !/^amr_[a-f0-9]{32}$/.test(order.id)) throw new Error('Pedido inválido');
  if (!Number.isInteger(order.iat) || !Number.isInteger(order.exp) || order.iat > now + 60 || order.exp <= now || order.exp - order.iat > MAX_AGE || order.exp <= order.iat) throw new Error('Link vencido ou inválido');
  if (typeof order.test !== 'boolean') throw new Error('Pedido inválido');
  // O convite não contém valor, produtos ou dados pessoais; o cliente os informa no formulário.
  return { v: 2, id: order.id, iat: order.iat, exp: order.exp, test: order.test };
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
