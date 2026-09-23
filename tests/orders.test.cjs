const { test } = require('node:test');
const assert = require('node:assert/strict');
const { generateKeyPairSync } = require('node:crypto');
const { signOrder, verifyOrder, validateOrder, MAX_AGE } = require('../lib/order-token.cjs');
const pair = generateKeyPairSync('ed25519');
const now=Math.floor(Date.now()/1000);
const order={v:2,id:'amr_'+'a'.repeat(32),iat:now,exp:now+MAX_AGE,test:false};

test('convite assinado mantém ID e descarta compra e dados pessoais',()=>{
  const token=signOrder({...order,name:'Não incluir',email:'nao@incluir.test',totalCents:44000,items:[{id:'bolsa-aurora',quantity:10}]},pair.privateKey);
  assert.deepEqual(verifyOrder(token,pair.publicKey),order);
  assert.equal(Buffer.from(token.split('.')[0],'base64url').toString().includes('email'),false);
});
test('link alterado, outra assinatura e link vencido são rejeitados',()=>{
  const token=signOrder(order,pair.privateKey);
  const changed=Buffer.from(JSON.stringify({...order,totalCents:1})).toString('base64url')+'.'+token.split('.')[1];
  assert.throws(()=>verifyOrder(changed,pair.publicKey));
  assert.throws(()=>verifyOrder(token,generateKeyPairSync('ed25519').publicKey));
  assert.throws(()=>verifyOrder(token,pair.publicKey,order.exp));
  for(const input of ['', 'abc.def', token+'.extra', 'a'.repeat(5000)]) assert.throws(()=>verifyOrder(input,pair.publicKey));
});
test('convites inválidos são rejeitados',()=>{
  assert.throws(()=>validateOrder({...order,v:1}));
  assert.throws(()=>validateOrder({...order,id:'pedido-1'}));
  assert.throws(()=>validateOrder({...order,exp:now+MAX_AGE+1}));
  assert.throws(()=>validateOrder({...order,test:undefined}));
});
