export default function ProductCard({ product, onBuy }) {
  return (
    <div className="card">
      <div className="card-image">
        {product.tag && <span className="card-flag">{product.tag}</span>}
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <div className="card-body">
        <h3>{product.name}</h3>
        <div className="card-meta">
          {product.material} · {product.size}
          <br />
          {product.printArea}
        </div>
        <div className="card-tag-row">
          <div className="hang-tag">
            <div className="price">R$ {product.priceUnit}</div>
            <div className="price-note">a partir de 40un: R$ {product.priceBulk}</div>
          </div>
        </div>
        <div className="card-footer">
          <button
            className="btn btn-primary btn-block"
            onClick={() => onBuy(product)}
          >
            Comprar no WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
