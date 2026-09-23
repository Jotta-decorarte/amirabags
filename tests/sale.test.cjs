const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const productIds=['bolsa-aurora','bolsa-bella','bolsa-serena','bolsa-jade','necessaire-lua','porta-chinelo'];
let source=fs.readFileSync(path.join(__dirname,'../lib/sale.js'),'utf8');
source=source.replace('import { products } from "./products";',`const products=${JSON.stringify(productIds.map(id=>({id})))};`).replaceAll('export ','');
const context=vm.createContext({crypto:{getRandomValues:array=>{array.fill(10);return array;}},Number,String,Set,Array,Object,Math});
vm.runInContext(source+'\nthis.api={parseMoney,createSaleId,validateSale};',context);
const {parseMoney,createSaleId,validateSale}=context.api;

test('valor brasileiro vira centavos e valores inválidos são bloqueados',()=>{
  assert.equal(parseMoney('R$ 1.234,56'),123456);
  assert.equal(parseMoney('590,00'),59000);
  for(const value of ['',0,'-5','abc']) assert.equal(parseMoney(value),0);
});

test('ID de finalização tem formato aceito pelo Pixel',()=>{
  assert.match(createSaleId(),/^amr_[a-f0-9]{32}$/);
});

test('venda exige cliente, contato, produto, quantidade e total válidos',()=>{
  const valid={id:'amr_'+'a'.repeat(32),name:'Maria Silva',phone:'(21) 99999-8888',items:[{id:'bolsa-aurora',quantity:10}],totalCents:44000,test:false};
  assert.equal(validateSale(valid).phone,'21999998888');
  for(const change of [{name:''},{phone:'123'},{items:[]},{items:[{id:'outro',quantity:1}]},{items:[{id:'bolsa-aurora',quantity:0}]},{totalCents:0},{id:'pedido'}]) assert.equal(validateSale({...valid,...change}),null);
});
