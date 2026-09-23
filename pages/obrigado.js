import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useAnalytics } from "../components/Analytics";
import { trackPurchase } from "../lib/pixel";
import { products } from "../lib/products";

function parseMoney(value) {
  const clean = String(value).trim().replace(/\s/g, "").replace(/R\$/gi, "");
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const number = Number(normalized);
  return Number.isFinite(number) && number > 0 ? Math.round(number * 100) : 0;
}

export default function Obrigado() {
  const [invite,setInvite] = useState(null);
  const [error,setError] = useState("");
  const [formError,setFormError] = useState("");
  const [name,setName] = useState("");
  const [phone,setPhone] = useState("");
  const [amount,setAmount] = useState("");
  const [selected,setSelected] = useState({});
  const [dataConsent,setDataConsent] = useState(false);
  const [confirmed,setConfirmed] = useState(null);
  const {ready,allowOrderPage} = useAnalytics();
  const requested = useRef(false);
  const tracked = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    let token = new URLSearchParams(window.location.hash.slice(1)).get("pedido");
    try {
      if (token) sessionStorage.setItem("amira_order_link",token);
      else token = sessionStorage.getItem("amira_order_link");
    } catch { /* O link funciona mesmo sem armazenamento. */ }
    window.history.replaceState(null,"","/obrigado");
    if (!token) { setError("Abra o link exclusivo enviado pela Amira após finalizar sua compra no WhatsApp."); return; }
    fetch("/api/order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token})})
      .then(async response => { const data=await response.json(); if (!response.ok) throw new Error(data.error); return data.order; })
      .then(setInvite)
      .catch(err => setError(err.message || "Não foi possível carregar seu pedido. Tente novamente."));
  },[]);

  useEffect(() => {
    if (ready && confirmed && !confirmed.test && !tracked.current) {
      tracked.current = trackPurchase(confirmed);
    }
  },[ready,confirmed]);

  function toggleProduct(id, checked) {
    setSelected(current => checked ? {...current,[id]:current[id] || 1} : Object.fromEntries(Object.entries(current).filter(([key]) => key !== id)));
  }

  function submit(event) {
    event.preventDefault();
    const items = Object.entries(selected).map(([id,quantity]) => ({id,quantity:Number(quantity)})).filter(item => Number.isSafeInteger(item.quantity) && item.quantity > 0);
    const totalCents = parseMoney(amount);
    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 3) return setFormError("Informe seu nome.");
    if (digits.length < 10 || digits.length > 13) return setFormError("Informe um WhatsApp válido, com DDD.");
    if (!items.length) return setFormError("Marque pelo menos um produto.");
    if (!totalCents) return setFormError("Informe o valor total pago.");
    if (!dataConsent) return setFormError("Autorize o uso dos dados para confirmar a compra e medir o anúncio.");
    const purchase = {id:invite.id,totalCents,items,test:invite.test};
    setFormError("");
    setConfirmed({...purchase,name:name.trim(),phone:digits});
    if (!invite.test) allowOrderPage({name:name.trim(),phone:digits});
  }

  const productNames = Object.fromEntries(products.map(product => [product.id,product.name]));
  const summary = confirmed?.items.map(item => `${productNames[item.id]}: ${item.quantity} un.`).join("; ");
  const total = confirmed ? (confirmed.totalCents/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}) : "";
  const message = confirmed ? `Olá! Aqui é ${confirmed.name}. Confirmei meu pedido Amira no site. ${summary} Total pago: ${total}. Meu WhatsApp é ${confirmed.phone}. Está tudo certo e será feito e entregue conforme combinamos pelo WhatsApp.` : "";

  return <>
    <Head><title>Confirme seu pedido Amira</title><meta name="robots" content="noindex,nofollow"/><meta name="referrer" content="no-referrer"/></Head>
    <main className="thank-you"><div className="thank-you-card">
      <a className="brand-wordmark" href="/" aria-label="Amira, início">amira.</a>
      <div className="eyebrow">Feito para celebrar</div>
      <h1>{confirmed ? "Obrigada pela sua compra!" : "Confirme seu pedido Amira"}</h1>
      {invite && !confirmed && <form className="order-form" onSubmit={submit}>
        {invite.test && <p className="preview-note">Demonstração — nenhuma compra será registrada.</p>}
        <p>Preencha os dados da compra que você finalizou com a Amira pelo WhatsApp.</p>
        <label>Seu nome<input value={name} onChange={event=>setName(event.target.value)} autoComplete="name" required /></label>
        <label>Seu WhatsApp<input value={phone} onChange={event=>setPhone(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="(21) 99999-9999" required /></label>
        <fieldset><legend>O que você comprou?</legend>{products.map(product => <div className="product-check" key={product.id}>
          <label><input type="checkbox" checked={selected[product.id] !== undefined} onChange={event=>toggleProduct(product.id,event.target.checked)}/><span>{product.name}</span></label>
          {selected[product.id] !== undefined && <label className="quantity">Quantidade<input type="number" min="1" max="10000" value={selected[product.id]} onChange={event=>setSelected(current=>({...current,[product.id]:event.target.value}))} required/></label>}
        </div>)}</fieldset>
        <label>Valor total pago<input value={amount} onChange={event=>setAmount(event.target.value)} inputMode="decimal" placeholder="Ex.: 590,00" required /></label>
        <label className="data-consent"><input type="checkbox" checked={dataConsent} onChange={event=>setDataConsent(event.target.checked)} required/><span>Autorizo o uso do meu nome e WhatsApp pelo Meta Pixel para confirmar esta compra e medir o anúncio que me trouxe ao site. Esses dados não serão exibidos na página nem salvos pelo site.</span></label>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <button type="submit" className="btn btn-primary">Confirmar meu pedido</button>
      </form>}
      {confirmed && <>
        {confirmed.test && <p className="preview-note">Demonstração — nenhuma compra foi registrada.</p>}
        <p>É uma alegria fazer parte da sua história. Confira o resumo:</p>
        <ul className="order-items">{confirmed.items.map(item => <li key={item.id}><span>{productNames[item.id]}</span><strong>{item.quantity} un.</strong></li>)}</ul>
        <div className="order-total"><span>Total pago</span><strong>{total}</strong></div>
        <p>Tudo certo! Agora envie esta confirmação para a Amira. A produção e a entrega seguirão o que foi combinado no atendimento.</p>
        <a className="btn btn-primary" href={`https://wa.me/5521972628996?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">Enviar confirmação no WhatsApp</a>
      </>}
      {!invite && <p role="status">{error || "Carregando seu formulário…"}</p>}
      {error && <a className="btn btn-primary" href="https://wa.me/5521972628996?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20com%20meu%20pedido%20Amira." target="_blank" rel="noopener noreferrer">Falar com a Amira</a>}
      <a className="back-catalog" href="/">Voltar ao catálogo</a>
    </div></main>
  </>;
}
