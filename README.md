# Amira Bags — Landing Page

LP do catálogo da Amira Bags, com botão de compra por WhatsApp em cada
produto e rastreamento de conversão via Pixel do Meta.

## Como rodar localmente

```bash
npm install
cp .env.example .env.local
# edite .env.local e coloque o Pixel ID real
npm run dev
```

Abre em http://localhost:3000

## Deploy no Vercel

1. Suba essa pasta num repositório Git (GitHub/GitLab) **ou** arraste a
   pasta direto no dashboard do Vercel (New Project > importar sem git).
2. Nas configurações do projeto no Vercel, em **Environment Variables**,
   adicione:
   - `NEXT_PUBLIC_META_PIXEL_ID` → o ID do Pixel da Amira Bags
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` → 5521972628996 (já vem por padrão no
     código, só precisa mudar se o número trocar)
3. Deploy.

## Onde pegar o Pixel ID

Meta Business Suite > Gerenciador de eventos > Origens de dados > escolhe
o pixel > o ID aparece no topo. Se a Amira Bags ainda não tem pixel
próprio, cria um novo em Origens de dados > Adicionar.

## Como funciona o rastreamento de compra

Não tem checkout no site. O fechamento acontece no WhatsApp, então o
fluxo de conversão funciona assim:

1. Cliente clica em "Comprar no WhatsApp" num produto → dispara evento
   **InitiateCheckout** no Pixel e abre o WhatsApp com a mensagem certa
   pro produto.
2. A aba da LP continua aberta. Aparece uma barra fixa embaixo:
   "Já fechou o pedido de [produto] com a Amira?"
3. Quando o cliente confirma (depois de combinar tudo no zap), dispara o
   evento **Purchase** com o valor do produto.

Isso é uma aproximação, não uma confirmação real de pagamento. Ideal
combinar com a Amira que ela avise quando uma venda realmente aconteceu,
pra eventualmente cruzar com os números do Pixel e calibrar.

## UTM

A LP já lê `utm_source`, `utm_medium`, `utm_campaign` e `utm_content` da
URL e guarda na sessão do navegador (`sessionStorage`). Serve pra
identificar depois, olhando o Pixel/Ads Manager, qual criativo ou
campanha trouxe aquele clique de compra. Não precisa incluir UTM na
mensagem do WhatsApp, cada botão já manda o nome certo do produto pro
texto.

Exemplo de link de anúncio pra Bolsa Prom:
```
https://sua-lp.vercel.app/?utm_source=meta&utm_medium=paid&utm_campaign=amira_formatura&utm_content=bolsa_prom
```

## Estrutura

```
pages/
  _app.js       -> injeta o script do Pixel do Meta
  index.js      -> a LP inteira
components/
  ProductCard.jsx
  ConfirmBar.jsx  -> barra fixa de confirmação de pedido
lib/
  products.js   -> catálogo (preços, fotos, textos do WhatsApp)
  pixel.js      -> funções de tracking (InitiateCheckout / Purchase)
public/images/  -> fotos dos produtos
```

## Editar preços ou produtos

Tudo fica em `lib/products.js`. Cada produto/combo tem nome, preço,
imagem e a mensagem que abre no WhatsApp (`waMessage`). Só editar ali,
sem mexer no resto do código.
