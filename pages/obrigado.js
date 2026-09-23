import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useAnalytics } from "../components/Analytics";
import { trackPurchase } from "../lib/pixel";
import { products } from "../lib/products";

const names = Object.fromEntries(products.map(p => [p.id,p.name]));
export default function Obrigado() {
  const [order,setOrder] = useState(null);
  const [error,setError] = useState("");
  const [confirmed,setConfirmed] = useState(false);
  const {ready,allowOrderPage} = useAnalytics();
  const allowRef = useRef(allowOrderPage);
  const requested = useRef(false);
  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    let token = new URLSearchParams(window.location.hash.slice(1)).get("pedido");
    try {
      if (token) sessionStorage.setItem("amira_order_link",token);
      else token = sessionStorage.getItem("amira_order_link");
    } catch { /* O link funciona mesmo sem armazenamento. */ }
    // Remover o token antes de habilitar qualquer evento do Meta.
    window.history.replaceState(null,"","/obrigado");
    if (!token) { setError("Abra o link exclusivo enviado pela Amira após a confirmação da sua compra."); return; }
    fetch("/api/order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token})})
      .then(async response => { const data=await response.json(); if (!response.ok) throw new Error(data.error); return data.order; })
      .then(data => { setOrder(data); if (!data.test) allowRef.current(); })
      .catch(err => setError(err.message || "Não foi possível carregar seu pedido. Tente novamente."));
  },[]);
  function confirmOrder() {
    if (!order) return;
    if (!order.test && ready) trackPurchase(order);
    setConfirmed(true);
  }

  const summary = order?.items.map(item => `${names[item.id]}: ${item.quantity} un.`).join("; ");
  const total = order ? (order.totalCents/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}) : "";
  const confirmationMessage = order ? `Olá! Confirmei meu pedido Amira no site. ${summary} Total: ${total}. Está tudo certo e será feito e entregue conforme combinamos pelo WhatsApp.` : "";

  return <>
    <Head><title>Obrigada por escolher a Amira</title><meta name="robots" content="noindex,nofollow"/><meta name="referrer" content="no-referrer"/></Head>
    <main className="thank-you"><div className="thank-you-card">
      <a className="brand-wordmark" href="/" aria-label="Amira, início">amira.</a>
      <div className="eyebrow">Feito para celebrar</div>
      <h1>{confirmed ? "Obrigada pela sua compra!" : "Confirme seu pedido Amira"}</h1>
      {order ? <>
        {order.test && <p className="preview-note">Demonstração — nenhuma compra será registrada.</p>}
        <p>{confirmed ? "É uma alegria fazer parte da sua história. Seu pedido foi confirmado." : "Confira os produtos, as quantidades e o valor combinados pelo WhatsApp."}</p>
        <ul className="order-items">{order.items.map(item => <li key={item.id}><span>{names[item.id]}</span><strong>{item.quantity} un.</strong></li>)}</ul>
        <div className="order-total"><span>Total do pedido</span><strong>{total}</strong></div>
        {!confirmed ? <>
          <p>Ao confirmar, você declara que esses dados estão corretos. A personalização, o pagamento, o prazo e a entrega seguem o que foi combinado no WhatsApp.</p>
          <button type="button" className="btn btn-primary" onClick={confirmOrder}>Confirmar meu pedido</button>
        </> : <>
          <p>Tudo certo! Agora envie a confirmação abaixo para a Amira concluir este atendimento.</p>
          <a className="btn btn-primary" href={`https://wa.me/5521972628996?text=${encodeURIComponent(confirmationMessage)}`} target="_blank" rel="noopener noreferrer">Enviar confirmação no WhatsApp</a>
        </>}
      </> : <p role="status">{error || "Carregando os detalhes do seu pedido…"}</p>}
      {error && <a className="btn btn-primary" href="https://wa.me/5521972628996?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20com%20meu%20pedido%20Amira." target="_blank" rel="noopener noreferrer">Falar com a Amira</a>}
      <a className="back-catalog" href="/">Voltar ao catálogo</a>
    </div></main>
  </>;
}
