import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAnalytics } from "../components/Analytics";
import { products } from "../lib/products";
import { createSaleId, parseMoney, SALE_KEY, validateSale } from "../lib/sale";

export default function Venda() {
  const router = useRouter();
  const {allowOrderPage} = useAnalytics();
  const [name,setName] = useState("");
  const [phone,setPhone] = useState("");
  const [amount,setAmount] = useState("");
  const [selected,setSelected] = useState({});
  const [dataConsent,setDataConsent] = useState(false);
  const [formError,setFormError] = useState("");

  function toggleProduct(id, checked) {
    setSelected(current => checked ? {...current,[id]:current[id] || 1} : Object.fromEntries(Object.entries(current).filter(([key]) => key !== id)));
  }

  function submit(event) {
    event.preventDefault();
    const sale = validateSale({
      id:createSaleId(), name, phone, totalCents:parseMoney(amount), test:false,
      items:Object.entries(selected).map(([id,quantity])=>({id,quantity:Number(quantity)})),
    });
    if (!sale) return setFormError("Revise seu nome, WhatsApp, produtos, quantidades e valor total pago.");
    if (!dataConsent) return setFormError("Autorize o uso dos dados para confirmar a compra e medir o anúncio.");
    try { sessionStorage.setItem(SALE_KEY,JSON.stringify(sale)); }
    catch { return setFormError("Não foi possível continuar neste navegador. Tente novamente sem o modo privado."); }
    allowOrderPage({name:sale.name,phone:sale.phone});
    router.push("/obrigado");
  }

  return <>
    <Head><title>Finalizar compra | Amira</title><meta name="robots" content="noindex,nofollow"/><meta name="referrer" content="no-referrer"/></Head>
    <main className="thank-you"><div className="thank-you-card">
      <a className="brand-wordmark" href="/" aria-label="Amira, início">amira.</a>
      <div className="eyebrow">Finalização da compra</div>
      <h1>Conte o que você comprou</h1>
      <form className="order-form" onSubmit={submit}>
        <p>Preencha os dados combinados com a Amira pelo WhatsApp. Ao finalizar, você será direcionado para a página de agradecimento.</p>
        <label>Seu nome<input value={name} onChange={event=>setName(event.target.value)} autoComplete="name" required /></label>
        <label>Seu WhatsApp<input value={phone} onChange={event=>setPhone(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="(21) 99999-9999" required /></label>
        <fieldset><legend>Produtos comprados</legend>{products.map(product => <div className="product-check" key={product.id}>
          <label><input type="checkbox" checked={selected[product.id] !== undefined} onChange={event=>toggleProduct(product.id,event.target.checked)}/><span>{product.name}</span></label>
          {selected[product.id] !== undefined && <label className="quantity">Quantidade<input type="number" min="1" max="10000" value={selected[product.id]} onChange={event=>setSelected(current=>({...current,[product.id]:event.target.value}))} required/></label>}
        </div>)}</fieldset>
        <label>Valor total pago<input value={amount} onChange={event=>setAmount(event.target.value)} inputMode="decimal" placeholder="Ex.: 590,00" required /></label>
        <label className="data-consent"><input type="checkbox" checked={dataConsent} onChange={event=>setDataConsent(event.target.checked)} required/><span>Autorizo o uso do meu nome e WhatsApp pelo Meta Pixel para confirmar esta compra e medir o anúncio que me trouxe ao site. Os dados ficam temporariamente neste navegador durante a confirmação e não são gravados no servidor do site.</span></label>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <button type="submit" className="btn btn-primary">Finalizar e ver confirmação</button>
      </form>
      <a className="back-catalog" href="/">Voltar ao catálogo</a>
    </div></main>
  </>;
}
