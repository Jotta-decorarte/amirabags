import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { products, personalizations } from "../lib/products";
import { trackInitiateCheckout } from "../lib/pixel";
import ProductCard from "../components/ProductCard";
import ConfirmBar from "../components/ConfirmBar";

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5521972628996";

const kitMessage = "Olá! Quero montar um kit personalizado para meu evento com os produtos do catálogo Amira 2027. Podemos combinar modelos, quantidade, personalização e prazo?";

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

    // O link do produto abre o WhatsApp, inclusive sem JavaScript.
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
            <div className="brand-wordmark">amira.</div>
            <div className="eyebrow">Amira · Catálogo 2027</div>
            <h1>
              Seu grande dia
              <br />
              <em>começa aqui</em>
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
            <div className="eyebrow">Catálogo 2027 · a partir de 10 unidades</div>
            <h2>Escolha a peça</h2>
            <p>
              Toque em comprar para falar direto com a Amira no WhatsApp.
              A mensagem já sai pronta, com a peça certa.
            </p>
          </div>
          <div className="grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onBuy={handleBuy} whatsappNumber={WHATSAPP_NUMBER} />
            ))}
          </div>
        </div>
      </section>

      <section id="kits" className="section section-tight kits-band">
        <div className="container kit-layout">
          <div>
            <div className="eyebrow">Para formaturas, casamentos e eventos</div>
            <h2>Um kit com a sua história</h2>
            <p>Combine sua bolsa favorita com a Necessaire Lua e o Porta Chinelo. Conte a quantidade e a data do evento para receber um orçamento personalizado.</p>
            <a className="btn btn-light" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(kitMessage)}`} target="_blank" rel="noopener noreferrer">Montar meu kit no WhatsApp</a>
          </div>
          <div className="kit-note"><span>Feito para celebrar</span><strong>Cada detalhe,<br />do seu jeito.</strong><p>Escolha as peças. Personalize os nomes. Deixe o seu dia ainda mais especial.</p></div>
        </div>
      </section>

      <section className="section straps-band" id="personalizacao">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Personalização</div>
            <h2>O seu nome faz parte</h2>
            <p>Transfer ou bordado para transformar cada peça em uma lembrança do seu evento.</p>
          </div>
          <div className="personalization-grid">
            {personalizations.map(option => <article className="personalization-card" key={option.name}><h3>{option.name}</h3><strong>{option.price}</strong><p>{option.description}</p></article>)}
          </div>
          <p className="art-note">Envie sua arte ou logo em PDF de alta qualidade ou como link do Canva. Consulte cores e disponibilidade pelo WhatsApp.</p>
        </div>
      </section>

      {/* INFO / CONFIANCA */}
      <section className="section section-tight">
        <div className="container">
          <div className="info-grid">
            <div className="info-item"><h4>Frete</h4><p>Calculado após a finalização do pedido, conforme o peso e as dimensões da caixa. Peça uma previsão de custo no atendimento.</p></div>
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
              <p>Cada peça é artesanal. Pode haver pequenas variações de tamanho, tom e tecido entre lotes diferentes.</p>
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
