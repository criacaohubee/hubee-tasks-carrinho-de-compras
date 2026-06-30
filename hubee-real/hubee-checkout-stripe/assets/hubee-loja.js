/* global HubeeLoja, Stripe */
( function () {
	'use strict';

	const CART_KEY = 'hubee_cart';

	/* ---------- Carrinho (localStorage) ---------- */
	const Cart = {
		read() {
			try { return JSON.parse( localStorage.getItem( CART_KEY ) ) || []; }
			catch ( e ) { return []; }
		},
		write( items ) {
			localStorage.setItem( CART_KEY, JSON.stringify( items ) );
			document.dispatchEvent( new CustomEvent( 'hubee:cart-updated' ) );
		},
		add( item ) {
			const items = this.read();
			const found = items.find( ( i ) => i.price === item.price );
			if ( found ) { found.quantity += 1; }
			else {
				items.push( {
					price: item.price,
					name: item.name,
					amount: Number( item.amount ),
					currency: item.currency,
					image: item.image || '',
					variant: item.variant || '',
					quantity: 1,
				} );
			}
			this.write( items );
		},
		setQty( price, qty ) {
			let items = this.read();
			if ( qty <= 0 ) { items = items.filter( ( i ) => i.price !== price ); }
			else { const it = items.find( ( i ) => i.price === price ); if ( it ) { it.quantity = qty; } }
			this.write( items );
		},
		clear() { localStorage.removeItem( CART_KEY ); document.dispatchEvent( new CustomEvent( 'hubee:cart-updated' ) ); },
		count() { return this.read().reduce( ( n, i ) => n + i.quantity, 0 ); },
	};

	function fmt( amount, currency ) {
		if ( amount == null || isNaN( amount ) ) { return ''; }
		const zero = [ 'BIF','CLP','DJF','GNF','JPY','KMF','KRW','MGA','PYG','RWF','UGX','VND','VUV','XAF','XOF','XPF' ];
		const isZero = zero.includes( currency );
		const value = isZero ? amount : amount / 100;
		const symbols = { BRL: 'R$', USD: '$', EUR: '€', GBP: '£' };
		const sym = symbols[ currency ] || currency + ' ';
		return sym + ' ' + value.toLocaleString( 'pt-BR', { minimumFractionDigits: isZero ? 0 : 2, maximumFractionDigits: isZero ? 0 : 2 } );
	}

	function escapeHtml( s ) {
		return String( s ).replace( /[&<>"']/g, ( c ) => ( { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ c ] ) );
	}

	const api = ( path, opts = {} ) =>
		fetch( HubeeLoja.restUrl + path, Object.assign( {
			headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': HubeeLoja.nonce },
			credentials: 'same-origin',
		}, opts ) ).then( async ( r ) => {
			const data = await r.json().catch( () => ( {} ) );
			if ( ! r.ok ) { throw new Error( data.message || 'Erro na requisição' ); }
			return data;
		} );

	/* ---------- Botão "Adicionar" -> abre o modal no carrinho ---------- */
	document.addEventListener( 'click', function ( e ) {
		const add = e.target.closest( '.hubee-add' );
		if ( add ) {
			Cart.add( {
				price: add.dataset.price,
				name: add.dataset.name,
				amount: add.dataset.amount,
				currency: add.dataset.currency,
				image: add.dataset.image,
				variant: add.dataset.variant,
			} );
			openModal( 'cart' );
		}
	} );

	/* ---------- Render do carrinho (shortcode + modal) ---------- */
	const TRASH_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
	const LOCK_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';

	function mediaHtml( i ) {
		if ( i.image ) {
			return `<div class="hubee-ci__media"><img src="${ encodeURI( i.image ) }" alt="${ escapeHtml( i.name ) }"></div>`;
		}
		return '<div class="hubee-ci__media"></div>';
	}

	function cartItemsHtml( items, withCheckoutBtn ) {
		if ( ! items.length ) {
			return '<p class="hubee-cart__empty">Seu carrinho está vazio.</p>';
		}
		const currency = items[ 0 ].currency;
		const subtotal = items.reduce( ( s, i ) => s + i.amount * i.quantity, 0 );

		let html = '<ul class="hubee-cart__items">';
		items.forEach( ( i ) => {
			html += `<li class="hubee-ci">
				${ mediaHtml( i ) }
				<div class="hubee-ci__info">
					<div class="hubee-ci__name">${ escapeHtml( i.name ) }</div>
					${ i.variant ? `<div class="hubee-ci__variant">${ escapeHtml( i.variant ) }</div>` : '' }
					<div class="hubee-ci__unit">${ fmt( i.amount, i.currency ) }</div>
					<div class="hubee-ci__stepper">
						<button type="button" class="hubee-qty" data-price="${ i.price }" data-qty="${ i.quantity - 1 }" aria-label="Diminuir">−</button>
						<span class="hubee-ci__qtynum">${ i.quantity }</span>
						<button type="button" class="hubee-qty" data-price="${ i.price }" data-qty="${ i.quantity + 1 }" aria-label="Aumentar">+</button>
					</div>
				</div>
				<div class="hubee-ci__right">
					<button type="button" class="hubee-remove" data-price="${ i.price }" aria-label="Remover">${ TRASH_SVG }</button>
					<div class="hubee-ci__line">${ fmt( i.amount * i.quantity, i.currency ) }</div>
				</div>
			</li>`;
		} );
		html += '</ul>';

		html += `<div class="hubee-totals">
			<div class="hubee-totals__row"><span>Subtotal</span><strong>${ fmt( subtotal, currency ) }</strong></div>
			<hr class="hubee-totals__sep">
			<div class="hubee-totals__row hubee-totals__row--total"><span>Total</span><strong>${ fmt( subtotal, currency ) }</strong></div>
		</div>`;

		if ( withCheckoutBtn ) {
			html += `<button type="button" class="hubee-btn hubee-btn--pay" data-hubee-checkout>${ LOCK_SVG } Finalizar compra</button>`;
			html += '<div class="hubee-paywith">Pagamento via <span class="hubee-stripe">stripe</span></div>';
		}
		return html;
	}

	function renderAll() {
		const items = Cart.read();

		// Carrinhos via shortcode [hubee_carrinho]: botão "Finalizar" abre o checkout no modal.
		document.querySelectorAll( '.hubee-cart .hubee-cart__body' ).forEach( ( body ) => {
			body.innerHTML = cartItemsHtml( items, true );
		} );

		// Carrinho dentro do modal.
		const modalCart = document.querySelector( '[data-hubee-modal-cart]' );
		if ( modalCart ) { modalCart.innerHTML = cartItemsHtml( items, true ); }

		// Contador no subtítulo da sidebar.
		const count = Cart.count();
		const countEl = document.querySelector( '[data-hubee-count]' );
		if ( countEl ) {
			countEl.textContent = count;
			const sub = countEl.closest( '.hubee-modal__sub' );
			if ( sub ) { sub.innerHTML = count + ' ' + ( count === 1 ? 'item' : 'itens' ); }
		}

		// Botão flutuante (FAB) + contador.
		const fab = document.getElementById( 'hubee-cart-fab' );
		if ( fab ) {
			const badge = fab.querySelector( '.hubee-fab__count' );
			badge.textContent = count;
			badge.hidden = count === 0; // esconde só o número quando vazio
			fab.hidden = false;          // o botão fica sempre visível
		}
	}

	/* ---------- Cliques: quantidade / remover / checkout / voltar / fechar ---------- */
	document.addEventListener( 'click', function ( e ) {
		const qty = e.target.closest( '.hubee-qty' );
		if ( qty ) { Cart.setQty( qty.dataset.price, Number( qty.dataset.qty ) ); return; }

		const rm = e.target.closest( '.hubee-remove' );
		if ( rm ) { Cart.setQty( rm.dataset.price, 0 ); return; }

		if ( e.target.closest( '[data-hubee-checkout]' ) ) { e.preventDefault(); startCheckout(); return; }
		if ( e.target.closest( '[data-hubee-back]' ) ) { e.preventDefault(); destroyCheckout(); openModal( 'cart' ); return; }
		if ( e.target.closest( '[data-hubee-close]' ) ) { e.preventDefault(); closeModal(); return; }
		if ( e.target.closest( '#hubee-cart-fab' ) ) { openModal( 'cart' ); return; }
	} );

	document.addEventListener( 'keydown', function ( e ) {
		if ( e.key === 'Escape' ) { closeModal(); }
	} );

	document.addEventListener( 'hubee:cart-updated', renderAll );

	/* ---------- Controle do modal ---------- */
	const modal = document.getElementById( 'hubee-modal' );

	function showView( name ) {
		if ( ! modal ) { return; }
		modal.querySelectorAll( '.hubee-modal__view' ).forEach( ( v ) => {
			v.hidden = v.getAttribute( 'data-view' ) !== name;
		} );
		// No checkout a sidebar fica mais larga pra dar respiro às informações.
		const box = modal.querySelector( '.hubee-modal__box' );
		if ( box ) { box.classList.toggle( 'hubee-modal__box--wide', name === 'checkout' ); }
	}

	function openModal( view ) {
		if ( ! modal ) { return; }
		renderAll();
		showView( view || 'cart' );
		modal.hidden = false;
		document.body.classList.add( 'hubee-modal-open' );
	}

	function closeModal() {
		if ( ! modal ) { return; }
		modal.hidden = true;
		document.body.classList.remove( 'hubee-modal-open' );
		destroyCheckout();
	}

	/* ---------- Embedded Checkout dentro do modal ---------- */
	let stripe = null;
	let checkoutInstance = null;
	let lastSessionId = null;

	function getStripe() {
		if ( ! stripe && HubeeLoja.stripePk ) { stripe = Stripe( HubeeLoja.stripePk ); }
		return stripe;
	}

	function destroyCheckout() {
		if ( checkoutInstance ) {
			try { checkoutInstance.destroy(); } catch ( e ) {}
			checkoutInstance = null;
		}
		const mount = document.getElementById( 'hubee-modal-checkout' );
		if ( mount ) { mount.innerHTML = ''; }
	}

	function startCheckout() {
		const items = Cart.read();
		if ( ! items.length ) { return; }
		if ( ! getStripe() ) { alert( 'Stripe não configurada.' ); return; }

		showView( 'checkout' );
		const mount = document.getElementById( 'hubee-modal-checkout' );
		mount.innerHTML = '<p class="hubee-cart__empty">Carregando checkout…</p>';
		destroyCheckout();

		api( 'session', {
			method: 'POST',
			body: JSON.stringify( { items: items.map( ( i ) => ( { price: i.price, quantity: i.quantity } ) ) } ),
		} )
			.then( ( res ) => {
				lastSessionId = res.sessionId;
				return getStripe().initEmbeddedCheckout( {
					clientSecret: res.clientSecret,
					onComplete: onCheckoutComplete,
				} );
			} )
			.then( ( checkout ) => {
				checkoutInstance = checkout;
				mount.innerHTML = '';
				checkout.mount( '#hubee-modal-checkout' );
			} )
			.catch( ( err ) => {
				mount.innerHTML = '<p>Erro ao iniciar o checkout: ' + escapeHtml( err.message ) + '</p>';
			} );
	}

	function onCheckoutComplete() {
		// Pagamento concluído sem sair da página. O pós-compra (criar brand,
		// aplicar créditos/metadados) é feito no servidor pela edge function
		// chamada pelo webhook do Stripe — o front só mostra a confirmação.
		Cart.clear();
		destroyCheckout();
		showView( 'done' );
	}

	/* ---------- Inicialização ---------- */
	renderAll();
} )();
