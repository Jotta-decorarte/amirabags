import { useState } from "react";

export default function ProductCard({ product, onAdd }) {
  const [quantity, setQuantity] = useState(product.minQuantity);
  const changeQuantity = value => setQuantity(Math.max(product.minQuantity, Number(value) || product.minQuantity));
  return (
    <article className="card">
      <div className="card-image">
        <img src={product.image} alt={product.name} loading="lazy" width="800" height="800" />
      </div>
      <div className="card-body">
        <h3>{product.name}</h3>
        <div className="card-meta">
          {product.material} · {product.size}
          <br />
          Transfer incluído · bordado opcional
        </div>
        <div className="card-tag-row">
          <div className="hang-tag">
            <div className="price">{product.priceUnit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
            <div className="price-note">por unidade · a partir de {product.minQuantity} unidades</div>
            <div className="bulk-price">{product.priceBulk.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
            <div className="price-note">por unidade · a partir de {product.bulkQuantity} unidades</div>
          </div>
        </div>
        <div className="card-footer">
          <div className="quantity-picker" aria-label={`Quantidade de ${product.name}`}>
            <button type="button" onClick={() => changeQuantity(quantity - 1)} aria-label={`Diminuir quantidade de ${product.name}`}>−</button>
            <input type="number" min={product.minQuantity} value={quantity} onChange={event => changeQuantity(event.target.value)} aria-label={`Quantidade de ${product.name}`} />
            <button type="button" onClick={() => changeQuantity(quantity + 1)} aria-label={`Aumentar quantidade de ${product.name}`}>+</button>
          </div>
          <button type="button" className="btn btn-primary btn-block" onClick={() => onAdd(product, quantity)}>Adicionar ao orçamento</button>
        </div>
      </div>
    </article>
  );
}
