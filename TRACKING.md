# Meta Pixel — fluxo de venda da Amira

Pixel: **908423904913977**. O site envia eventos somente em `amirabags.vercel.app`; localhost e previews da Vercel não alimentam o Pixel de produção.

## Fluxo

1. A Amira envia ao comprador: `https://amirabags.vercel.app/venda`.
2. Em `/venda`, o comprador informa nome, WhatsApp, produtos, quantidades e valor total pago e autoriza a medição.
3. Os dados são validados e guardados temporariamente na sessão daquele navegador. Eles não são enviados à API nem gravados no servidor do site.
4. O site abre `/obrigado`.
5. Ao carregar uma venda válida da sessão, `/obrigado` envia `Purchase` com total em BRL, produtos, quantidades e ID aleatório da finalização.
6. O comprador vê o resumo e envia pelo WhatsApp uma mensagem pronta com os mesmos dados.

Acessar `/obrigado` diretamente não registra venda e mostra um botão para preencher `/venda`.

## Eventos

- `PageView`: visita, após permissão de medição.
- `ViewContent`: visualização do catálogo.
- `Contact`: clique em produto, kit ou atendimento para abrir o WhatsApp. Mede intenção de contato; não comprova mensagem enviada.
- `Purchase`: chegada a `/obrigado` depois de concluir `/venda`, com valor, produtos e quantidades informados pelo comprador.
- Correspondência avançada: nome e WhatsApp são normalizados no navegador e entregues ao Meta Pixel somente após autorização expressa.

## Limites

- O formulário é público e os dados são declarados pelo comprador. Isso não substitui a confirmação do pagamento pela Amira.
- Como não há banco de pedidos ou checkout integrado, alguém pode informar dados incorretos ou preencher o formulário mais de uma vez. O navegador evita recontar o mesmo ID, mas não há deduplicação global entre aparelhos ou depois da limpeza dos dados locais.
- O envio depende de consentimento, carregamento do Pixel e ausência de bloqueadores. Enfileirar o evento não prova recebimento ou atribuição pelo Meta.
- Não há Conversions API. Ela exigiria credencial privada do Meta e uma fonte confiável de pedidos no servidor.

## Validação

Executar `npm test` e `npm run build`. Para evitar vendas falsas, testes automatizados usam mocks e localhost não envia eventos ao Pixel de produção.

No Gerenciador de Eventos, use **Testar eventos** para conferir `PageView`, `ViewContent`, `Contact` e `Purchase` durante uma finalização controlada.

Referência: https://developers.facebook.com/docs/meta-pixel/reference/
