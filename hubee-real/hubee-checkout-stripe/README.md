# Hubee Loja — Produtos Stripe + Embedded Checkout

Plugin WordPress que **lista os produtos da sua conta Stripe** e exibe o
**Embedded Checkout** da própria Stripe direto na página. **Não usa WooCommerce.**

- Catálogo vem da API da Stripe (Products + default Price), com cache de 10 min.
- Carrinho leve no navegador (`localStorage`) — só guarda `price_id` + quantidade.
- Checkout é uma **Checkout Session `ui_mode: embedded`** montada com Stripe.js.

## Instalação

1. Compacte a pasta `hubee-loja` em um `.zip`.
2. No WP: **Plugins → Adicionar novo → Enviar plugin** → selecione o `.zip` → **Ativar**.
3. Vá em **Configurações → Hubee Stripe** e cole `pk_...` e `sk_...`.
   - Recomendado (mais seguro): defina no `wp-config.php`:
     ```php
     define( 'HUBEE_STRIPE_PK', 'pk_live_xxx' );
     define( 'HUBEE_STRIPE_SK', 'sk_live_xxx' );
     ```
4. Em **Configurações → Hubee Stripe**, informe a **URL de retorno** (a página
   que terá o shortcode `[hubee_obrigado]`).

## Pré-requisitos na Stripe

Os produtos só aparecem se na Stripe eles estiverem **ativos** e tiverem um
**preço padrão (default price) ativo**. (Dashboard Stripe → Catálogo de produtos.)

## Uso (shortcodes)

| Shortcode | O que faz |
|-----------|-----------|
| `[hubee_produtos]` | Grade com seus produtos da Stripe + botão "Adicionar". Atributo: `colunas` (padrão 3). |
| `[hubee_carrinho checkout_url="https://seusite.com/checkout"]` | Mini-carrinho com botão "Finalizar compra" apontando pra página de checkout. |
| `[hubee_checkout]` | Monta o Embedded Checkout da Stripe (usa os itens do carrinho). |
| `[hubee_obrigado]` | Página de retorno: confirma o status do pagamento. |

### Estrutura sugerida de páginas

1. **Loja** → `[hubee_produtos]` e `[hubee_carrinho checkout_url=".../checkout"]`
2. **Checkout** → `[hubee_checkout]`
3. **Obrigado** → `[hubee_obrigado]` (e cadastre a URL dela em Configurações → Hubee Stripe)

## Segurança

- O navegador envia apenas **`price_id` + quantidade**; o servidor **valida** os
  IDs contra os produtos ativos e a Stripe define o valor real. Não há como
  forjar preço.
- Endpoint REST protegido por **nonce**.
- O preço/total exibido no carrinho é só informativo — quem cobra é a Stripe.

## Observações

- Suporta `mode: payment`. Para assinaturas (`recurring`), troque `mode` para
  `subscription` em `hubee_rest_session()` quando o carrinho tiver itens recorrentes.
- O cache de produtos pode ser limpo no botão em Configurações → Hubee Stripe.
