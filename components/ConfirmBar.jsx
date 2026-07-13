import { trackPurchase } from "../lib/pixel";

export default function ConfirmBar({ pending, onConfirm, onDismiss }) {
  if (!pending) return null;

  function handleConfirm() {
    trackPurchase(pending.name, pending.price);
    onConfirm();
  }

  return (
    <div className="confirm-bar" role="status">
      <div className="confirm-bar-inner">
        <div className="confirm-bar-text">
          Já fechou o pedido de <b>{pending.name}</b> com a Amira no WhatsApp?
        </div>
        <div className="confirm-bar-actions">
          <button className="btn btn-primary" onClick={handleConfirm}>
            Confirmar pedido
          </button>
          <button className="confirm-dismiss" onClick={onDismiss}>
            Ainda não
          </button>
        </div>
      </div>
    </div>
  );
}
