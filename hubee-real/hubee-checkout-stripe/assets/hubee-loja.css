/* ===== Hubee Loja ===== */
:root {
	--hubee-primary: #5b21e6;
	--hubee-primary-dark: #4c1bc4;
	--hubee-ink: #1e1b2e;
	--hubee-muted: #8a86a0;
	--hubee-line: #efedf5;
	--hubee-soft: #f4f1fe;
}

.hubee-grid {
	display: grid;
	grid-template-columns: repeat(var(--hubee-cols, 3), 1fr);
	gap: 24px;
}
@media (max-width: 768px) {
	.hubee-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
	.hubee-grid { grid-template-columns: 1fr; }
}

.hubee-card {
	display: flex;
	flex-direction: column;
	gap: 10px;
	border: 1px solid #ececec;
	border-radius: 12px;
	padding: 16px;
	background: #fff;
	transition: box-shadow .2s ease;
}
.hubee-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,.08); }
.hubee-card__img img { width: 100%; height: auto; border-radius: 8px; display: block; }
.hubee-card__title { font-size: 1rem; margin: 0; line-height: 1.3; }
.hubee-card__desc { font-size: .88rem; color: #666; margin: 0; flex: 1; }
.hubee-card__price { color: var(--hubee-primary); font-weight: 700; }
.hubee-card__rec { font-weight: 400; color: #888; font-size: .8rem; }

.hubee-thanks { text-align: center; padding: 40px 16px; }
.hubee-thanks h2 { margin-bottom: 8px; }

/* ===== Botões ===== */
.hubee-btn {
	appearance: none;
	border: 0;
	border-radius: 12px;
	padding: 13px 18px;
	font-weight: 700;
	font-size: 1rem;
	cursor: pointer;
	background: var(--hubee-primary);
	color: #fff;
	text-align: center;
	text-decoration: none;
	transition: background .15s ease, opacity .15s ease;
}
.hubee-btn:hover { background: var(--hubee-primary-dark); }
.hubee-btn:disabled { opacity: .55; cursor: default; }
.hubee-btn.is-loading { position: relative; color: transparent; }
.hubee-btn.is-loading::after {
	content: ""; position: absolute; inset: 0; margin: auto;
	width: 16px; height: 16px; border-radius: 50%;
	border: 2px solid rgba(255,255,255,.5); border-top-color: #fff;
	animation: hubee-spin .7s linear infinite;
}
@keyframes hubee-spin { to { transform: rotate(360deg); } }
.hubee-btn--ghost { background: transparent; color: var(--hubee-primary); border: 1px solid var(--hubee-primary); }
.hubee-btn--pay {
	width: 100%;
	margin-top: 4px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	padding: 16px 18px;
	box-shadow: 0 8px 20px rgba(91,33,230,.28);
}
.hubee-btn--pay svg { flex: 0 0 auto; }

/* ===== Carrinho (shortcode simples, mantido) ===== */
.hubee-cart { border: 1px solid #ececec; border-radius: 12px; padding: 16px; background: #fff; }
.hubee-cart h3 { margin-top: 0; }
.hubee-cart__empty { color: var(--hubee-muted); text-align: center; padding: 32px 0; }

/* ===== Itens do carrinho (estrutura rica) ===== */
.hubee-cart__items { list-style: none; margin: 0; padding: 0; }
.hubee-ci {
	display: grid;
	grid-template-columns: 84px 1fr auto;
	gap: 18px;
	padding: 22px 0;
	border-bottom: 1px solid var(--hubee-line);
}
.hubee-ci__media {
	width: 84px;
	height: 84px;
	border-radius: 14px;
	background: var(--hubee-soft);
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}
.hubee-ci__media img { width: 100%; height: 100%; object-fit: cover; }
.hubee-ci__info { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.hubee-ci__name { font-weight: 700; color: var(--hubee-ink); line-height: 1.25; }
.hubee-ci__variant { font-size: .85rem; color: var(--hubee-muted); }
.hubee-ci__unit { color: var(--hubee-primary); font-weight: 700; }
.hubee-ci__right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	justify-content: space-between;
}
.hubee-ci__line { font-weight: 700; color: var(--hubee-ink); white-space: nowrap; }

/* Stepper de quantidade */
.hubee-ci__stepper {
	display: inline-flex;
	align-items: center;
	gap: 14px;
	margin-top: 4px;
	border: 1px solid var(--hubee-line);
	border-radius: 10px;
	padding: 6px 12px;
	width: max-content;
}
.hubee-qty {
	width: 22px; height: 22px;
	border: 0; background: none;
	color: var(--hubee-primary);
	cursor: pointer; font-size: 18px; line-height: 1;
	display: flex; align-items: center; justify-content: center;
}
.hubee-qty:hover { opacity: .7; }
.hubee-ci__qtynum { min-width: 14px; text-align: center; font-weight: 600; }
.hubee-remove {
	border: 0; background: none; cursor: pointer;
	color: var(--hubee-muted); padding: 2px;
	display: flex;
}
.hubee-remove:hover { color: #e23; }

/* Bloco de totais */
.hubee-totals {
	background: var(--hubee-soft);
	border-radius: 14px;
	padding: 18px 20px;
	margin-top: 20px;
}
.hubee-totals__row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	color: #5a5670;
}
.hubee-totals__row + .hubee-totals__row { margin-top: 14px; }
.hubee-totals__sep { border: 0; border-top: 1px solid #e4dffa; margin: 14px 0; }
.hubee-totals__row--total { color: var(--hubee-ink); }
.hubee-totals__row--total span { font-weight: 700; }
.hubee-totals__row--total strong { color: var(--hubee-primary); font-size: 1.5rem; }

/* Selo de pagamento */
.hubee-paywith {
	text-align: center;
	color: var(--hubee-muted);
	font-size: .9rem;
	margin-top: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
}
.hubee-paywith .hubee-stripe { color: var(--hubee-primary); font-weight: 800; letter-spacing: -.5px; }

/* ===== Checkout (página standalone) ===== */
#hubee-payment-element { margin: 6px 0; }
.hubee-pay-msg { color: #c00; font-size: .9rem; min-height: 1.2em; }

/* ===== Botão flutuante (FAB) ===== */
.hubee-fab {
	position: fixed;
	right: 24px;
	bottom: 24px;
	z-index: 99998;
	width: 56px;
	height: 56px;
	border: 0;
	border-radius: 50%;
	background: var(--hubee-primary);
	color: #fff;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8px 24px rgba(91,33,230,.4);
	transition: transform .15s ease;
}
.hubee-fab:hover { transform: scale(1.06); }
.hubee-fab__count {
	position: absolute;
	top: -4px;
	right: -4px;
	min-width: 22px;
	height: 22px;
	padding: 0 6px;
	border-radius: 11px;
	background: #ff4d4f;
	color: #fff;
	font-size: 12px;
	font-weight: 700;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* ===== Drawer lateral ===== */
body.hubee-modal-open { overflow: hidden; }
.hubee-modal {
	position: fixed;
	inset: 0;
	z-index: 99999;
	display: flex;
	align-items: stretch;
	justify-content: flex-end;
}
.hubee-modal[hidden] { display: none; }
.hubee-modal__overlay {
	position: absolute;
	inset: 0;
	background: rgba(20,16,40,.55);
	backdrop-filter: blur(2px);
	animation: hubee-fade .25s ease;
}
@keyframes hubee-fade { from { opacity: 0; } to { opacity: 1; } }

.hubee-modal__box {
	position: relative;
	z-index: 1;
	width: 100%;
	max-width: 460px;
	height: 100vh;
	overflow-y: auto;
	background: #fff;
	padding: 28px 28px 32px;
	box-shadow: -12px 0 40px rgba(0,0,0,.25);
	animation: hubee-slide-in .28s cubic-bezier(.22,.61,.36,1);
	transition: max-width .3s cubic-bezier(.22,.61,.36,1);
}
/* Mais espaço quando está no checkout */
.hubee-modal__box--wide { max-width: 640px; }
@keyframes hubee-slide-in {
	from { transform: translateX(100%); }
	to   { transform: translateX(0); }
}
@media (max-width: 660px) {
	.hubee-modal__box, .hubee-modal__box--wide { max-width: 100%; }
}

.hubee-modal__close {
	position: absolute;
	top: 24px;
	right: 24px;
	border: 0;
	background: none;
	font-size: 26px;
	line-height: 1;
	color: var(--hubee-primary);
	cursor: pointer;
	z-index: 2;
}
.hubee-modal__close:hover { opacity: .7; }
.hubee-modal__title { margin: 0; font-size: 1.6rem; color: var(--hubee-ink); }
.hubee-modal__sub { margin: 4px 0 20px; color: var(--hubee-muted); font-size: .95rem; }
.hubee-modal__view[hidden] { display: none; }
.hubee-back {
	border: 0;
	background: none;
	color: var(--hubee-primary);
	cursor: pointer;
	font-weight: 700;
	padding: 0 0 16px;
}
#hubee-modal-checkout { min-height: 240px; }

/* ===== Blindagem contra estilos de botão do tema =====
   Muitos temas aplicam fundo/borda/sombra em todo <button>.
   Aqui forçamos os controles do carrinho a ficarem "limpos". */
.hubee-modal__close,
.hubee-cart .hubee-qty,
.hubee-modal .hubee-qty,
.hubee-cart .hubee-remove,
.hubee-modal .hubee-remove {
	background: none !important;
	background-image: none !important;
	border: 0 !important;
	box-shadow: none !important;
	text-shadow: none !important;
	min-width: 0 !important;
	width: auto !important;
	height: auto !important;
	margin: 0 !important;
	line-height: 1 !important;
}

/* X de fechar */
.hubee-modal__close {
	padding: 0 !important;
	width: 32px !important;
	height: 32px !important;
	color: var(--hubee-primary) !important;
	font-size: 26px !important;
	display: inline-flex !important;
	align-items: center !important;
	justify-content: center !important;
}

/* Setas − + do stepper */
.hubee-cart .hubee-qty,
.hubee-modal .hubee-qty {
	width: 24px !important;
	height: 24px !important;
	padding: 0 !important;
	color: #6b6880 !important;
	font-size: 18px !important;
	font-weight: 600 !important;
	display: inline-flex !important;
	align-items: center !important;
	justify-content: center !important;
	border-radius: 0 !important;
}
.hubee-cart .hubee-qty:hover,
.hubee-modal .hubee-qty:hover { color: var(--hubee-primary) !important; }
.hubee-ci__qtynum { color: var(--hubee-ink); }

/* Lixeira */
.hubee-cart .hubee-remove,
.hubee-modal .hubee-remove {
	padding: 2px !important;
	color: var(--hubee-muted) !important;
	border-radius: 0 !important;
	display: inline-flex !important;
}
.hubee-cart .hubee-remove:hover,
.hubee-modal .hubee-remove:hover { color: #e23 !important; }

/* Container do stepper mantém a borda fininha do mockup */
.hubee-ci__stepper {
	background: #fff !important;
	box-shadow: none !important;
}

/* Botão "Finalizar compra": garante retângulo full-width como no mockup */
.hubee-modal .hubee-btn--pay,
.hubee-cart .hubee-btn--pay {
	width: 100% !important;
	border-radius: 14px !important;
}

/* =========================================================================
   RESET TOTAL — o carrinho não herda NADA do tema do WordPress.
   Define a própria tipografia, espaçamentos, listas e botões.
   ========================================================================= */
#hubee-modal,
#hubee-modal *,
#hubee-modal *::before,
#hubee-modal *::after,
.hubee-cart,
.hubee-cart *,
#hubee-cart-fab,
#hubee-cart-fab * {
	box-sizing: border-box !important;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
}

/* Listas sem marcadores/recuo do tema */
#hubee-modal ul,
.hubee-cart ul {
	list-style: none !important;
	margin: 0 !important;
	padding: 0 !important;
}
#hubee-modal li,
.hubee-cart li { margin: 0 !important; list-style: none !important; }

/* Todo botão dentro do carrinho começa "zerado" e só recebe o nosso estilo */
#hubee-modal button,
.hubee-cart button,
#hubee-cart-fab {
	-webkit-appearance: none !important;
	appearance: none !important;
	text-transform: none !important;
	letter-spacing: normal !important;
	font-family: inherit !important;
	outline: none !important;
}

/* Títulos e parágrafos sem margens herdadas estranhas */
#hubee-modal h2,
#hubee-modal h3 { margin: 0; padding: 0; font-weight: 700; }
#hubee-modal p { margin: 0; padding: 0; }
#hubee-modal img { max-width: 100%; display: block; }
