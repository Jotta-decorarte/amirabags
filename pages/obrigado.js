import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useAnalytics } from "../components/Analytics";
import { trackPurchase } from "../lib/pixel";
import { products } from "../lib/products";
import { SALE_KEY, validateSale } from "../lib/sale";

const names = Object.fromEntries(products.map(product => [product.id,product.name]));

export default function Obrigado() {
  const [sale,setSale] = useState(null);
  const [error,setError] = useState("");
  const {ready,allowOrderPage} = useAnalytics();
  const tracked = useRef(false);

  useEffect(() => {
    try {
      const current = validateSale(JSON.parse(sessionStorage.getItem(SALE_KEY) || "null"));
      if (!current) throw new Error();
      setSale(current);
      allowOrderPage({name:current.name,phone:current.phone});
    } catch { setError("Finalize os dados da sua compra antes de acessar esta página."); }
  },[]);

  useEffect(() => {
    if (ready && sale && !sale.test && !tracked.current) tracked.current = trackPurchase(sale);
  },[ready,sale]);

  const summary = sale?.items.map(item => `${names[item.id]}: ${item.quantity} un.`).join("; ");
  const total = sale ? (sale.totalCents/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}) : "";
  const message = sale ? `Olá! Aqui é ${sale.name}. Finalizei minha compra Amira no site. ${summary} Total pago: ${total}. Meu WhatsApp é ${sale.phone}. Está tudo certo e será feito e entregue conforme combinamos pelo WhatsApp.` : "";

  return <>
    <Head><title>Obrigada pela sua compra | Amira</title><meta name="robots" content="noindex,nofollow"/><meta name="referrer" content="no-referrer"/></Head>
    <main className="thank-you"><div className="thank-you-card">
      <a className="brand-wordmark" href="/" aria-label="Amira, início">amira.</a>
      <div className="eyebrow">Compra finalizada</div>
      <h1>{sale ? `Obrigada, ${sale.name}!` : "Confirmação da compra"}</h1>
      {sale ? <>
        <p>Recebemos sua confirmação. É uma alegria fazer parte da sua história.</p>
        <ul className="order-items">{sale.items.map(item => <li key={item.id}><span>{names[item.id]}</span><strong>{item.quantity} un.</strong></li>)}</ul>
        <div className="order-total"><span>Total pago</span><strong>{total}</strong></div>
        <p>Tudo certo! Agora envie esta confirmação para a Amira. A produção e a entrega seguirão o que foi combinado no atendimento.</p>
        <a className="btn btn-primary" href={`https://wa.me/5521972628996?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">Enviar confirmação no WhatsApp</a>
      </> : <>
        <p role="status">{error || "Carregando sua confirmação…"}</p>
        {error && <a className="btn btn-primary" href="/venda">Preencher dados da venda</a>}
      </>}
      <a className="back-catalog" href="/">Voltar ao catálogo</a>
    </div></main>
  </>;
}
