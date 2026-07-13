import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { products, combos, straps } from "../lib/products";
import { trackInitiateCheckout } from "../lib/pixel";
import ProductCard from "../components/ProductCard";
import ConfirmBar from "../components/ConfirmBar";

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5521972628996";

const STRAP_COLORS = {
  "Vinho": "#6E2438",
  "Lilás": "#A78BC9",
  "Azul Marinho": "#1F2A44",
  "Rosê": "#D9A6AE",
  "Ice Green": "#B7CBB0",
  "Verde Musgo": "#5B6E4F",
  "Bege": "#D8C7A1",
  "Marrom": "#7B5B3E",
  "Marrom Choc": "#4A2F22",
  "Preto": "#1C1A18",
  "Cinza": "#9C978F",
  "Branco / Off White": "#EFE9DC"
};

export default function Home() {
  const router = useRouter();
  const [pending, setPending] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // Guarda o UTM de entrada na sessao, para amarrar depois qual anuncio trouxe o pedido
  useEffect(() => {
    if (!router.isReady) return;
    const { utm_source, utm_medium, utm_campaign, utm_content } = router.query;
    if (utm_source || utm_campaign) {
      sessionStorage.setItem(
        "amira_utm",
        JSON.stringify({ utm_source, utm_medium, utm_campaign, utm_content })
      );
    }
    const saved = sessionStorage.getItem("amira_pending");
    if (saved) setPending(JSON.parse(saved));
  }, [router.isReady, router.query]);

  function handleBuy(item) {
    const name = item.name;
    const price = item.price ?? item.priceUnit;
    trackInitiateCheckout(name, price);

    const pendingItem = { name, price };
    sessionStorage.setItem("amira_pending", JSON.stringify(pendingItem));
    setPending(pendingItem);

    const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      item.waMessage
    )}`;
    window.open(link, "_blank", "noopener,noreferrer");
  }

  function handleConfirm() {
    sessionStorage.removeItem("amira_pending");
    setPending(null);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3600);
  }

  function handleDismiss() {
    setPending(null);
  }

  return (
    <>
      <Head>
        <title>Amira Bags | Ecobags personalizadas feitas à mão</title>
        <meta
          name="description"
          content="Ecobags, necessaires e kits de formatura personalizados à mão pela Amira Bags. Envio para todo o Brasil."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* HERO */}
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <div className="eyebrow">Amira Bags · Handmade</div>
            <h1>
              Ecobags que carregam
              <br />
              <em>o nome de cada história</em>
            </h1>
            <p className="lead">
              Peças artesanais personalizadas para formatura, casamento e
              eventos. Cada bolsa é feita à mão, com o nome de quem vai
              usar.
            </p>
            <div className="hero-cta-row">
              <a href="#produtos" className="btn btn-primary">
                Ver o catálogo
              </a>
              <a href="#kits" className="btn btn-ghost">
                Kits para formatura
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <img src="/images/hero-red.jpg" alt="Bolsa personalizada Amira Bags na praia" />
            <div className="hero-badge">
              <span className="dot" />
              Feita à mão, com seu nome
            </div>
          </div>
        </div>
      </section>

      <div className="strip">
        <div className="container">
          <span>Envios para todo o Brasil</span>
          <span>Peças 100% artesanais</span>
          <span>Perfeitas para eventos, brindes e formaturas</span>
        </div>
      </div>

      {/* PRODUTOS */}
      <section id="produtos" className="section">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Catálogo</div>
            <h2>Escolha a peça</h2>
            <p>
              Toque em comprar para falar direto com a Amira no WhatsApp.
              A mensagem já sai pronta, com a peça certa.
            </p>
          </div>
          <div className="grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onBuy={handleBuy} />
            ))}
          </div>
        </div>
      </section>

      {/* KITS */}
      <section id="kits" className="section section-tight" style={{ background: "var(--cream-deep)" }}>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Para turmas de formatura</div>
            <h2>Kits fechados, preço por volume</h2>
            <p>Bolsa Prom, Saquinho e Necessaire combinados, com desconto por quantidade.</p>
          </div>
          <div className="combo-grid">
            {combos.map((c) => (
              <div className="combo-card" key={c.id}>
                <div className="combo-image">
                  <img src={c.image} alt={c.name} loading="lazy" />
                </div>
                <div className="combo-body">
                  <h3>{c.name}</h3>
                  <p>{c.description}</p>
                  <div className="combo-price">
                    R$ {c.price.toLocaleString("pt-BR")}
                    <small>{c.units} kits completos</small>
                  </div>
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => handleBuy(c)}
                  >
                    Comprar no WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORES DE ALCA */}
      <section className="section straps-band">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Personalização</div>
            <h2>Cores de alça gorgurão</h2>
            <p>Escolha a cor da alça na hora de fechar o pedido no WhatsApp.</p>
          </div>
          <div className="strap-grid">
            {straps.map((s) => (
              <div className="strap-swatch" key={s}>
                <div className="chip" style={{ background: STRAP_COLORS[s] }} />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INFO / CONFIANCA */}
      <section className="section section-tight">
        <div className="container">
          <div className="info-grid">
            <div className="info-item">
              <h4>Prazo de envio</h4>
              <p>Mínimo de 40 dias úteis. Prazos menores, só consultando disponibilidade direto com a Amira.</p>
            </div>
            <div className="info-item">
              <h4>Pagamento</h4>
              <p>Pix, 50% no fechamento do pedido e 50% até 3 dias antes do envio. Cartão com acréscimo de 5% + juros da maquininha.</p>
            </div>
            <div className="info-item">
              <h4>Feito à mão</h4>
              <p>Cada peça é artesanal. Pode haver pequenas variações de tom e tecido entre lotes diferentes.</p>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container foot-row">
          <div>
            <strong>amira.</strong>
            <div style={{ marginTop: 4 }}>@souamira.bag</div>
          </div>
          <div>WhatsApp +55 21 97262-8996 · contato.amirabag@gmail.com</div>
        </div>
      </footer>

      <ConfirmBar pending={pending} onConfirm={handleConfirm} onDismiss={handleDismiss} />

      {showToast && (
        <div className="toast">Pedido confirmado. Obrigada! 🎉</div>
      )}
    </>
  );
}
