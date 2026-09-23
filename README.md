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

## Rastreamento e página de obrigado

Consulte TRACKING.md para eventos, emissão de links de compras confirmadas e limites de atribuição. O pixel é 908423904913977. Contact mede cliques para o WhatsApp; Purchase usa o total real de um pedido assinado pela loja. O cliente recebe e abre o link exclusivo.

Testes automatizados: npm test.

## Estrutura

```
pages/
  _app.js       -> integra medição com consentimento
  index.js      -> a LP inteira
components/
  ProductCard.jsx
  Analytics.jsx   -> consentimento e inicialização do pixel
lib/
  products.js   -> catálogo (preços, fotos, textos do WhatsApp)
  pixel.js      -> PageView, ViewContent, Contact e Purchase
public/images/  -> fotos dos produtos
```

## Editar preços ou produtos

Produtos e opções de personalização ficam em `lib/products.js`. Cada produto tem
nome, material, medidas, foto, preços unitários para 10 e 30 unidades e a mensagem
que abre no WhatsApp (`waMessage`). Os kits são orçados no atendimento, sem preços
fechados no site.

## Catálogo 2027

Dados e seis fotos de produtos conferidos no catálogo fornecido pela marca:
https://www.canva.com/design/DAHVr_Sw1pI/xgnQ_HpDKcBCIyLJk2Zr2g/edit

Produtos e preços: páginas 5–6. Personalização: página 7. Condições: página 3.
Necessaire Lua usa a grafia usual de “necessaire”; no catálogo consta “Necessarie Lua”.
O WhatsApp e a foto principal do site anterior foram preservados. As fotos novas
estão salvas no próprio projeto, sem depender de links temporários do Canva.

Validar com `npm run build` e conferir a página em computador e celular.
