// Executar somente no computador da loja. A chave privada nunca vai para GitHub/Vercel.
const fs = require('node:fs');
const path = require('node:path');
const { generateKeyPairSync, randomBytes } = require('node:crypto');
const { signOrder, MAX_AGE } = require('../lib/order-token.cjs');
const root = path.join(__dirname,'..');
const local = path.join(root,'.local');
const privatePath = path.join(local,'order-signing-key.pem');
const publicPath = path.join(root,'lib/order-public-key.json');
const ledgerPath = path.join(local,'orders.json');
fs.mkdirSync(local,{recursive:true});

if (process.argv.includes('--init')) {
  if (fs.existsSync(privatePath) || fs.existsSync(publicPath)) throw new Error('Chaves já existem; não sobrescrever.');
  const pair = generateKeyPairSync('ed25519');
  fs.writeFileSync(privatePath,pair.privateKey.export({type:'pkcs8',format:'pem'}),{mode:0o600});
  fs.writeFileSync(publicPath,JSON.stringify({publicKey:pair.publicKey.export({type:'spki',format:'pem'})},null,2)+'\n');
  console.log('Chave privada salva em .local; somente a chave pública vai para o site.');
} else {
  const inputPath = process.argv[2];
  if (!inputPath) throw new Error('Uso: node scripts/order-link.cjs caminho/pedido.json');
  const input = JSON.parse(fs.readFileSync(inputPath,'utf8'));
  if (input.confirmed !== true) throw new Error('Gere links apenas de compras confirmadas: confirmed deve ser true.');
  if (typeof input.reference !== 'string' || !/^[A-Z0-9-]{3,60}$/.test(input.reference)) throw new Error('Informe referência interna sem nome, telefone ou e-mail.');
  const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath,'utf8')) : {};
  const test = input.test === true;
  const key = `${test?'test':'sale'}:${input.reference}`;
  let saved = ledger[key];
  if (saved && (saved.order.totalCents !== input.totalCents || JSON.stringify(saved.order.items) !== JSON.stringify(input.items))) throw new Error('Pedido já emitido com outros dados; não gerar conversão duplicada.');
  if (!saved) {
    const iat = Math.floor(Date.now()/1000);
    const order = {v:1,id:`amr_${randomBytes(16).toString('hex')}`,totalCents:input.totalCents,items:input.items,iat,exp:iat+MAX_AGE,test};
    const token = signOrder(order,fs.readFileSync(privatePath,'utf8'));
    saved = {order,token}; ledger[key]=saved;
    fs.writeFileSync(ledgerPath,JSON.stringify(ledger,null,2),{mode:0o600});
  }
  const url = `https://amirabags.vercel.app/obrigado#pedido=${saved.token}`;
  console.log(url);
}
