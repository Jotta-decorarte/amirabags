import { useEffect, useState } from "react";

const money = value => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function QuoteDrawer({ open, items, onClose, onChange, onRemove, whatsappNumber, onSend }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState("");
  useEffect(() => { document.body.classList.toggle("drawer-open", open); return () => document.body.classList.remove("drawer-open"); }, [open]);
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const units = items.reduce((sum, item) => sum + item.quantity, 0);

  function submit(event) {
    event.preventDefault();
    if (!items.length) return;
    const lines = items.map(item => `• ${item.name}: ${item.quantity} un. × ${money(item.unitPrice)} = ${money(item.quantity * item.unitPrice)}`);
    const message = ["Olá! Quero solicitar um orçamento da Amira.", "", `Nome: ${name}`, `WhatsApp: ${phone}`, eventDate ? `Data do evento: ${eventDate.split("-").reverse().join("/")}` : "", "", "Produtos:", ...lines, "", `Total estimado: ${money(total)}`, notes ? `Observações: ${notes}` : "", "", "Podemos confirmar personalização, disponibilidade, prazo e valor final?"].filter(Boolean).join("\n");
    onSend(items);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return <>
    <button className={`drawer-backdrop ${open ? "is-open" : ""}`} type="button" onClick={onClose} aria-label="Fechar orçamento" />
    <aside className={`quote-drawer ${open ? "is-open" : ""}`} aria-hidden={!open} aria-label="Sacola de orçamento">
      <header className="drawer-header"><div><span>SEU ORÇAMENTO</span><h2>Produtos escolhidos</h2></div><button type="button" onClick={onClose} aria-label="Fechar">×</button></header>
      <div className="drawer-content">
        {!items.length ? <div className="empty-cart"><strong>Sua sacola está vazia</strong><p>Escolha os produtos e quantidades no catálogo.</p></div> : <>
          <div className="quote-items">{items.map(item => <div className="quote-item" key={item.id}>
            <img src={item.image} alt="" /><div><strong>{item.name}</strong><small>{money(item.unitPrice)} por unidade</small>
            <div className="quantity-picker compact"><button type="button" onClick={() => onChange(item.id, item.quantity - 1)}>−</button><input value={item.quantity} type="number" min={item.minQuantity} onChange={event => onChange(item.id, event.target.value)} aria-label={`Quantidade de ${item.name}`} /><button type="button" onClick={() => onChange(item.id, item.quantity + 1)}>+</button></div></div>
            <button className="remove-item" type="button" onClick={() => onRemove(item.id)} aria-label={`Remover ${item.name}`}>Remover</button>
          </div>)}</div>
          <div className="quote-total"><span>{units} unidades</span><strong>Estimativa: {money(total)}</strong><small>O valor final será confirmado no atendimento.</small></div>
          <form className="quote-form" onSubmit={submit}><h3>Seus dados</h3>
            <label>Nome<input value={name} onChange={event => setName(event.target.value)} required autoComplete="name" /></label>
            <label>WhatsApp<input value={phone} onChange={event => setPhone(event.target.value)} required inputMode="tel" autoComplete="tel" placeholder="(21) 99999-9999" /></label>
            <label>Data do evento (opcional)<input value={eventDate} onChange={event => setEventDate(event.target.value)} type="date" /></label>
            <label>Personalização ou observações (opcional)<textarea value={notes} onChange={event => setNotes(event.target.value)} rows="3" placeholder="Cores, nomes, arte, tipo de evento…" /></label>
            <button className="btn btn-primary btn-block" type="submit">Enviar orçamento pelo WhatsApp</button>
          </form>
        </>}
      </div>
    </aside>
  </>;
}
