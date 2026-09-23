const { test } = require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function setup(host='amirabags.vercel.app', blockedStorage=false) {
  const events=[],storage=new Map(),scripts=[];
  const window={location:{hostname:host},localStorage:{getItem:key=>{if(blockedStorage)throw Error();return storage.get(key);},setItem:(key,value)=>{if(blockedStorage)throw Error();storage.set(key,value);}},fbq:(...args)=>events.push(args)};
  const context=vm.createContext({window,document:{createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}},Date,Set,Map});
  const source=fs.readFileSync(path.join(__dirname,'../lib/pixel.js'),'utf8').replaceAll('export ','');
  vm.runInContext(source+'\nthis.api={setPixelConsent,initializePixel,trackPageView,trackWhatsAppContact,trackPurchase,trackCatalogView};',context);
  return {api:context.api,events,storage,scripts};
}
const order={id:'amr_'+'a'.repeat(32),totalCents:123456,items:[{id:'bolsa-aurora',quantity:30},{id:'necessaire-lua',quantity:30}],test:false};

test('sem consentimento não registra eventos; prévias não enviam para produção',()=>{
  const {api,events}=setup();
  api.initializePixel();api.trackPageView();api.trackWhatsAppContact({id:'a',name:'a'});api.trackPurchase(order);
  assert.equal(events.filter(e=>e[0]==='trackSingle').length,0);
  for(const host of ['localhost','preview.vercel.app']) {const s=setup(host);s.api.setPixelConsent(true);assert.equal(s.api.initializePixel(),false);s.api.trackPurchase(order);assert.equal(s.events.filter(e=>e[0]==='trackSingle').length,0);}
});
test('Contact registra produto ou kit, sem Purchase/checkout e evita clique duplo',()=>{
  const {api,events}=setup();api.setPixelConsent(true);api.initializePixel();
  api.trackWhatsAppContact({id:'bolsa-aurora',name:'Bolsa Aurora'});api.trackWhatsAppContact({id:'bolsa-aurora',name:'Bolsa Aurora'});
  api.trackWhatsAppContact({id:'kit-personalizado',name:'Kit personalizado'},'kits');
  const sent=events.filter(e=>e[0]==='trackSingle');
  assert.equal(sent.length,2);assert.ok(sent.every(e=>e[2]==='Contact'));
  assert.equal(sent[0][3].content_ids[0],'bolsa-aurora');assert.equal(sent[1][3].placement,'kits');
});
test('correspondência avançada é normalizada somente na inicialização autorizada',()=>{
  const {api,events}=setup();api.setPixelConsent(true);api.initializePixel({name:'  Maria da Silva ',phone:'(21) 99999-8888'});
  const init=events.find(e=>e[0]==='init');
  assert.equal(init[1],'908423904913977');assert.equal(init[2].fn,'maria');assert.equal(init[2].ln,'da silva');assert.equal(init[2].ph,'21999998888');
});
test('Purchase usa total real, moeda, quantidades e ID estável; bloqueia repetição',()=>{
  const {api,events,storage}=setup();api.setPixelConsent(true);api.initializePixel();
  assert.equal(api.trackPurchase(order),true);assert.equal(api.trackPurchase(order),false);
  const purchase=events.find(e=>e[2]==='Purchase');
  assert.equal(purchase[1],'908423904913977');assert.equal(purchase[3].value,1234.56);assert.equal(purchase[3].currency,'BRL');assert.equal(purchase[3].num_items,60);assert.equal(purchase[4].eventID,'purchase_'+order.id);
  const reload=setup();for(const [k,v]of storage)reload.storage.set(k,v);reload.api.setPixelConsent(true);reload.api.initializePixel();assert.equal(reload.api.trackPurchase(order),false);
  const another=setup('amirabags.vercel.app',true);another.api.setPixelConsent(true);another.api.initializePixel();assert.equal(another.api.trackPurchase(order),true);assert.equal(another.api.trackPurchase(order),false);
});
test('demonstração nunca conta venda e revogação interrompe eventos',()=>{
  const {api,events}=setup();api.setPixelConsent(true);api.initializePixel();
  assert.equal(api.trackPurchase({...order,test:true}),false);api.setPixelConsent(false);assert.equal(api.trackPurchase(order),false);
  assert.equal(events.filter(e=>e[2]==='Purchase').length,0);
});
