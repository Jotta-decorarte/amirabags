# Meta Pixel — Amira

Pixel: **908423904913977**. Domínio autorizado para envio: `amirabags.vercel.app`.
Localhost e previews da Vercel não enviam eventos ao pixel de produção.

## Eventos

- `PageView`: visita, após permissão para medição.
- `ViewContent`: catálogo visível, uma vez por carregamento.
- `Contact`: clique nos produtos ou kits para abrir o WhatsApp, com modelo e posição do link. Não comprova mensagem enviada ou conversa efetivamente iniciada.
- `Purchase`: clique do comprador em **Confirmar meu pedido**, dentro da página de obrigado com pedido assinado pela loja. Envia total real em BRL, IDs dos produtos, quantidades e `eventID` estável por pedido.

O antigo botão de autodeclaração de compra foi removido. Não usar uma conversão personalizada baseada apenas na URL `/obrigado`: a visita genérica não é prova de venda.

## Operação da loja

1. Confirmar a compra no atendimento e o total acordado, incluindo os adicionais/frete que devem compor a receita reportada. Não confundir sinal de 50% com total do pedido.
2. Informar ao assistente a referência interna do pedido, modelos, quantidades e total. Não são necessários nome, telefone, e-mail ou endereço.
3. Gerar o link exclusivo com o procedimento abaixo e enviar ao comprador pelo WhatsApp. O comprador confere os dados e toca em **Confirmar meu pedido**. A loja não deve abrir nem confirmar links reais para teste.
4. Depois da confirmação, o comprador toca em **Enviar confirmação no WhatsApp**. A mensagem pronta repete produtos, quantidades e total e confirma que a produção e a entrega seguirão o combinado no atendimento.
5. Reenvios do mesmo pedido usam o mesmo link/ID. Não criar outra referência para a mesma venda.

Exemplo de arquivo **local**, nunca versionado, em `.local/pedido.json`:

```json
{
  "reference": "AMIRA-2027-001",
  "confirmed": true,
  "test": false,
  "totalCents": 44000,
  "items": [{ "id": "bolsa-aurora", "quantity": 10 }]
}
```

`totalCents` está em centavos: 44000 = R$ 440,00.
Gerar: `npm run order:link -- .local/pedido.json`.
O link vale 90 dias e contém apenas identificação aleatória do pedido e informações comerciais.
A página retira o token do endereço antes de habilitar o pixel.
Para demonstração, usar `test: true`: não dispara eventos do pixel na página de obrigado.

Produtos: `bolsa-aurora`, `bolsa-bella`, `bolsa-serena`, `bolsa-jade`, `necessaire-lua`, `porta-chinelo`.

## Chave de assinatura

A chave privada fica em `.local/order-signing-key.pem` no computador onde o projeto foi preparado.
O histórico de links fica em `.local/orders.json`. Faça backup privado dos dois arquivos.
Eles são ignorados pelo Git e não são enviados à Vercel. Nunca compartilhar a chave em chat ou repositório.
A chave pública em `lib/order-public-key.json` permite ao site verificar pedidos sem ter permissão de emitir novas compras.
Não executar `--init` novamente: uma troca de chave exige planejar migração para não invalidar links existentes.

## Conferência no Meta

No Gerenciador de Eventos, selecionar o pixel e usar **Testar eventos** para validar `PageView`, `ViewContent` e `Contact`, com permissão de medição habilitada. O evento `Contact` é o objetivo disponível para a ação de contato no site; a métrica de conversas no WhatsApp exige integração com o canal e não é criada pelo pixel.

Validar `Purchase` com uma compra real confirmada, ou com um pixel separado de teste. Não gerar vendas fictícias no pixel de produção. O projeto testa o disparo com mocks, sem transmitir vendas.

No conjunto de anúncios de conversão pelo site, selecionar esse pixel e o evento adequado à campanha: `Contact` para intenção de contato; `Purchase` para compradores que abrem o link. A disponibilidade depende da configuração da conta e eventos recebidos. Configurações da conta de anúncios e recebimento no Gerenciador de Eventos não foram validados por este código.

## Limites

- A visita à página não é confirmação bancária de pagamento. A loja emite o link somente após confirmar o pedido.
- O envio pelo navegador depende de consentimento, carregamento do pixel e ausência de bloqueadores. Enfileirar não prova recebimento ou atribuição pelo Meta.
- Recarregamentos são bloqueados pelo armazenamento do navegador, além de usar ID estável. Não há banco central de vendas: abrir em outro dispositivo ou apagar dados pode reenviar o evento. Não prometer deduplicação global.
- Não há Conversions API nem correspondência avançada de clientes nesta implementação. Apenas o ID do pixel não fornece credenciais para essas integrações. Elas exigem token privado e uma fonte confiável de pedidos, além de configuração específica.
- Bloqueio de rastreamento ou recusa de consentimento nunca impede a compra pelo WhatsApp nem a leitura do pedido.

Referência: https://developers.facebook.com/docs/meta-pixel/reference/
