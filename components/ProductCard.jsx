export default function ProductCard({ product, onBuy, whatsappNumber }) {
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
          <a
            className="btn btn-primary btn-block"
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(product.waMessage)}`}
            target="_blank" rel="noopener noreferrer"
            aria-label={`Comprar ${product.name} no WhatsApp`}
            onClick={() => onBuy(product)}
          >
            Comprar no WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
