<?php
/**
 * Plugin Name: Hubee Checkout Stripe
 * Description: Lista os produtos da sua conta Stripe e exibe o Embedded Checkout da Stripe direto na página (sem WooCommerce).
 * Version:     2.6.2
 * Author:      Hubee
 * Text Domain: hubee-checkout-stripe
 *
 * Shortcodes:
 *   [hubee_produtos]   -> grade de produtos vindos da Stripe + botão "Adicionar"
 *   [hubee_carrinho]   -> mini-carrinho (localStorage) com botão "Finalizar compra"
 *   [hubee_checkout]   -> Embedded Checkout da Stripe montado na página
 *   [hubee_obrigado]   -> página de retorno (status do pagamento)
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'HUBEE_LOJA_VER', '2.6.2' );
define( 'HUBEE_LOJA_URL', plugin_dir_url( __FILE__ ) );

/* -------------------------------------------------------------------------
 *  CHAVES STRIPE
 *  Recomendado no wp-config.php:
 *     define( 'HUBEE_STRIPE_PK', 'pk_live_...' );
 *     define( 'HUBEE_STRIPE_SK', 'sk_live_...' );
 *  Ou cadastre em Configurações > Hubee Stripe.
 * ----------------------------------------------------------------------- */
function hubee_stripe_pk() {
	if ( defined( 'HUBEE_STRIPE_PK' ) && HUBEE_STRIPE_PK ) {
		return HUBEE_STRIPE_PK;
	}
	return (string) get_option( 'hubee_stripe_pk', '' );
}
function hubee_stripe_sk() {
	if ( defined( 'HUBEE_STRIPE_SK' ) && HUBEE_STRIPE_SK ) {
		return HUBEE_STRIPE_SK;
	}
	return (string) get_option( 'hubee_stripe_sk', '' );
}

/* -------------------------------------------------------------------------
 *  PÁGINA DE OPÇÕES (Configurações > Hubee Stripe)
 * ----------------------------------------------------------------------- */
add_action( 'admin_menu', function () {
	add_options_page( 'Hubee Stripe', 'Hubee Stripe', 'manage_options', 'hubee-stripe', 'hubee_render_settings_page' );
} );

add_action( 'admin_init', function () {
	register_setting( 'hubee_stripe', 'hubee_stripe_pk' );
	register_setting( 'hubee_stripe', 'hubee_stripe_sk' );
	register_setting( 'hubee_stripe', 'hubee_return_url' );
} );

function hubee_render_settings_page() {
	?>
	<div class="wrap">
		<h1>Hubee Stripe</h1>
		<p>Cadastre as chaves da Stripe (ou defina <code>HUBEE_STRIPE_PK</code> / <code>HUBEE_STRIPE_SK</code> no <code>wp-config.php</code>).</p>
		<form method="post" action="options.php">
			<?php settings_fields( 'hubee_stripe' ); ?>
			<table class="form-table">
				<tr>
					<th><label for="hubee_stripe_pk">Publishable key (pk_...)</label></th>
					<td><input type="text" class="regular-text" id="hubee_stripe_pk" name="hubee_stripe_pk" value="<?php echo esc_attr( get_option( 'hubee_stripe_pk', '' ) ); ?>" <?php echo defined( 'HUBEE_STRIPE_PK' ) ? 'disabled placeholder="definida no wp-config.php"' : ''; ?>></td>
				</tr>
				<tr>
					<th><label for="hubee_stripe_sk">Secret key (sk_...)</label></th>
					<td><input type="password" class="regular-text" id="hubee_stripe_sk" name="hubee_stripe_sk" value="<?php echo esc_attr( get_option( 'hubee_stripe_sk', '' ) ); ?>" <?php echo defined( 'HUBEE_STRIPE_SK' ) ? 'disabled placeholder="definida no wp-config.php"' : ''; ?>></td>
				</tr>
				<tr>
					<th><label for="hubee_return_url">URL de retorno (página "obrigado")</label></th>
					<td>
						<input type="url" class="regular-text" id="hubee_return_url" name="hubee_return_url" value="<?php echo esc_attr( get_option( 'hubee_return_url', '' ) ); ?>" placeholder="https://seusite.com/obrigado">
						<p class="description">Página que contém o shortcode <code>[hubee_obrigado]</code>. O parâmetro <code>{CHECKOUT_SESSION_ID}</code> é anexado automaticamente.</p>
					</td>
				</tr>
			</table>
			<?php submit_button(); ?>
		</form>
		<p><button type="button" class="button" onclick="fetch('<?php echo esc_url_raw( rest_url( 'hubee/v1/flush' ) ); ?>',{headers:{'X-WP-Nonce':'<?php echo esc_js( wp_create_nonce( 'wp_rest' ) ); ?>'}}).then(()=>alert('Cache de produtos limpo.'))">Limpar cache de produtos</button></p>
	</div>
	<?php
}

/* -------------------------------------------------------------------------
 *  ASSETS
 * ----------------------------------------------------------------------- */
add_action( 'wp_enqueue_scripts', function () {
	wp_register_style( 'hubee-loja', HUBEE_LOJA_URL . 'assets/hubee-loja.css', [], HUBEE_LOJA_VER );
	wp_enqueue_style( 'hubee-loja' );

	wp_register_script( 'stripe-js', 'https://js.stripe.com/v3/', [], null, true );
	wp_register_script( 'hubee-loja', HUBEE_LOJA_URL . 'assets/hubee-loja.js', [ 'stripe-js' ], HUBEE_LOJA_VER, true );
	wp_localize_script( 'hubee-loja', 'HubeeLoja', [
		'restUrl'     => esc_url_raw( rest_url( 'hubee/v1/' ) ),
		'nonce'       => wp_create_nonce( 'wp_rest' ),
		'stripePk'    => hubee_stripe_pk(),
	] );
	wp_enqueue_script( 'hubee-loja' );
} );

/* -------------------------------------------------------------------------
 *  MODAL DO CARRINHO + BOTÃO FLUTUANTE (injetado no rodapé do site)
 * ----------------------------------------------------------------------- */
add_action( 'wp_footer', function () {
	if ( is_admin() ) {
		return;
	}
	?>
	<button type="button" class="hubee-fab" id="hubee-cart-fab" aria-label="Abrir carrinho">
		<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
		<span class="hubee-fab__count">0</span>
	</button>

	<div class="hubee-modal" id="hubee-modal" hidden>
		<div class="hubee-modal__overlay" data-hubee-close></div>
		<div class="hubee-modal__box" role="dialog" aria-modal="true" aria-label="Carrinho">
			<button type="button" class="hubee-modal__close" data-hubee-close aria-label="Fechar">&times;</button>

			<div class="hubee-modal__view" data-view="cart">
				<h3 class="hubee-modal__title">Seu carrinho</h3>
				<p class="hubee-modal__sub"><span data-hubee-count>0</span> itens</p>
				<div class="hubee-cart__body" data-hubee-modal-cart></div>
			</div>

			<div class="hubee-modal__view" data-view="checkout" hidden>
				<button type="button" class="hubee-back" data-hubee-back>&larr; Voltar ao carrinho</button>
				<div id="hubee-modal-checkout"></div>
			</div>

			<div class="hubee-modal__view" data-view="done" hidden>
				<div class="hubee-thanks">
					<h2>Pagamento confirmado! 🎉</h2>
					<p data-hubee-done-msg>Obrigado pela compra. Você receberá a confirmação por e-mail.</p>
					<button type="button" class="hubee-btn" data-hubee-close>Fechar</button>
				</div>
			</div>
		</div>
	</div>
	<?php
} );

/* -------------------------------------------------------------------------
 *  STRIPE HELPER (API REST via wp_remote — sem SDK)
 * ----------------------------------------------------------------------- */
function hubee_stripe_request( $method, $path, $body = [] ) {
	$sk = hubee_stripe_sk();
	if ( ! $sk ) {
		return new WP_Error( 'hubee_cfg', 'Stripe não configurada', [ 'status' => 500 ] );
	}
	$args = [
		'method'  => $method,
		'timeout' => 30,
		'headers' => [
			'Authorization' => 'Bearer ' . $sk,
			'Content-Type'  => 'application/x-www-form-urlencoded',
		],
	];
	if ( 'GET' === $method && ! empty( $body ) ) {
		$path .= '?' . http_build_query( $body );
	} elseif ( ! empty( $body ) ) {
		$args['body'] = http_build_query( $body );
	}
	$resp = wp_remote_request( 'https://api.stripe.com/v1/' . $path, $args );
	if ( is_wp_error( $resp ) ) {
		return $resp;
	}
	$data = json_decode( wp_remote_retrieve_body( $resp ), true );
	$code = wp_remote_retrieve_response_code( $resp );
	if ( $code >= 400 ) {
		return new WP_Error( 'hubee_stripe', $data['error']['message'] ?? 'Erro Stripe', [ 'status' => $code ] );
	}
	return $data;
}

/**
 * Busca produtos ativos da Stripe (com default_price expandido).
 * Resultado normalizado e cacheado por 10 min.
 */
function hubee_get_products( $force = false ) {
	$cache_key = 'hubee_stripe_products';
	if ( ! $force ) {
		$cached = get_transient( $cache_key );
		if ( false !== $cached ) {
			return $cached;
		}
	}

	$res = hubee_stripe_request( 'GET', 'products', [
		'active'             => 'true',
		'limit'              => 100,
		'expand'             => [ 'data.default_price' ],
	] );
	if ( is_wp_error( $res ) ) {
		return $res;
	}

	$products = [];
	foreach ( $res['data'] ?? [] as $p ) {
		$price = $p['default_price'] ?? null;
		if ( ! is_array( $price ) || empty( $price['active'] ) ) {
			continue; // sem preço padrão ativo -> ignora
		}
		$products[] = [
			'id'         => $p['id'],
			'name'       => $p['name'],
			'desc'       => $p['description'] ?? '',
			'image'      => ! empty( $p['images'][0] ) ? $p['images'][0] : '',
			'price_id'   => $price['id'],
			'amount'     => isset( $price['unit_amount'] ) ? (int) $price['unit_amount'] : null,
			'currency'   => strtoupper( $price['currency'] ?? 'BRL' ),
			'recurring'  => ! empty( $price['recurring'] ),
		];
	}

	set_transient( $cache_key, $products, 10 * MINUTE_IN_SECONDS );
	return $products;
}

/** Formata valor (em centavos) para exibição. */
function hubee_fmt_price( $amount, $currency ) {
	if ( null === $amount ) {
		return '';
	}
	$zero = [ 'BIF','CLP','DJF','GNF','JPY','KMF','KRW','MGA','PYG','RWF','UGX','VND','VUV','XAF','XOF','XPF' ];
	$value = in_array( $currency, $zero, true ) ? $amount : $amount / 100;
	$symbols = [ 'BRL' => 'R$', 'USD' => '$', 'EUR' => '€', 'GBP' => '£' ];
	$sym = $symbols[ $currency ] ?? ( $currency . ' ' );
	return $sym . ' ' . number_format( $value, in_array( $currency, $zero, true ) ? 0 : 2, ',', '.' );
}

/* -------------------------------------------------------------------------
 *  SHORTCODE: [hubee_produtos]
 * ----------------------------------------------------------------------- */
add_shortcode( 'hubee_produtos', function ( $atts ) {
	$atts = shortcode_atts( [ 'colunas' => 3 ], $atts, 'hubee_produtos' );

	$products = hubee_get_products();
	if ( is_wp_error( $products ) ) {
		return '<p>Erro ao carregar produtos: ' . esc_html( $products->get_error_message() ) . '</p>';
	}
	if ( empty( $products ) ) {
		return '<p>Nenhum produto ativo encontrado na Stripe.</p>';
	}

	ob_start();
	echo '<div class="hubee-grid" style="--hubee-cols:' . (int) $atts['colunas'] . '">';
	foreach ( $products as $p ) {
		?>
		<div class="hubee-card">
			<?php if ( $p['image'] ) : ?>
				<div class="hubee-card__img"><img src="<?php echo esc_url( $p['image'] ); ?>" alt="<?php echo esc_attr( $p['name'] ); ?>" loading="lazy"></div>
			<?php endif; ?>
			<h3 class="hubee-card__title"><?php echo esc_html( $p['name'] ); ?></h3>
			<?php if ( $p['desc'] ) : ?>
				<p class="hubee-card__desc"><?php echo esc_html( $p['desc'] ); ?></p>
			<?php endif; ?>
			<div class="hubee-card__price">
				<?php echo esc_html( hubee_fmt_price( $p['amount'], $p['currency'] ) ); ?>
				<?php echo $p['recurring'] ? '<span class="hubee-card__rec">/recorrente</span>' : ''; ?>
			</div>
			<button type="button" class="hubee-btn hubee-add"
				data-price="<?php echo esc_attr( $p['price_id'] ); ?>"
				data-name="<?php echo esc_attr( $p['name'] ); ?>"
				data-amount="<?php echo esc_attr( $p['amount'] ); ?>"
				data-currency="<?php echo esc_attr( $p['currency'] ); ?>"
				data-image="<?php echo esc_attr( $p['image'] ); ?>">
				Adicionar
			</button>
		</div>
		<?php
	}
	echo '</div>';
	return ob_get_clean();
} );

/* -------------------------------------------------------------------------
 *  SHORTCODE: [hubee_carrinho]
 * ----------------------------------------------------------------------- */
add_shortcode( 'hubee_carrinho', function ( $atts ) {
	$atts = shortcode_atts( [ 'checkout_url' => '' ], $atts, 'hubee_carrinho' );
	ob_start();
	?>
	<div class="hubee-cart" data-checkout-url="<?php echo esc_url( $atts['checkout_url'] ); ?>">
		<h3>Seu carrinho</h3>
		<div class="hubee-cart__body"><p class="hubee-cart__empty">Seu carrinho está vazio.</p></div>
	</div>
	<?php
	return ob_get_clean();
} );

/* -------------------------------------------------------------------------
 *  SHORTCODE: [hubee_checkout]  (Embedded Checkout)
 * ----------------------------------------------------------------------- */
add_shortcode( 'hubee_checkout', function () {
	if ( ! hubee_stripe_pk() ) {
		return '<p>Configure as chaves da Stripe em Configurações &gt; Hubee Stripe.</p>';
	}
	return '<div id="hubee-checkout"><p class="hubee-cart__empty">Carregando checkout…</p></div>';
} );

/* -------------------------------------------------------------------------
 *  SHORTCODE: [hubee_obrigado]  (página de retorno)
 * ----------------------------------------------------------------------- */
add_shortcode( 'hubee_obrigado', function () {
	$session_id = isset( $_GET['session_id'] ) ? sanitize_text_field( wp_unslash( $_GET['session_id'] ) ) : '';
	if ( ! $session_id ) {
		return '<p>Sessão não encontrada.</p>';
	}
	$sess = hubee_stripe_request( 'GET', 'checkout/sessions/' . $session_id );
	if ( is_wp_error( $sess ) ) {
		return '<p>Não foi possível verificar o pagamento.</p>';
	}
	if ( ( $sess['status'] ?? '' ) === 'complete' && ( $sess['payment_status'] ?? '' ) === 'paid' ) {
		$email = $sess['customer_details']['email'] ?? '';
		return '<div class="hubee-thanks"><h2>Pagamento confirmado! 🎉</h2><p>Obrigado pela compra' . ( $email ? ', enviamos a confirmação para <strong>' . esc_html( $email ) . '</strong>' : '' ) . '.</p></div>';
	}
	return '<div class="hubee-thanks"><h2>Pagamento em processamento</h2><p>Assim que for confirmado você receberá um e-mail.</p></div>';
} );

/* -------------------------------------------------------------------------
 *  ENDPOINTS REST
 * ----------------------------------------------------------------------- */
add_action( 'rest_api_init', function () {
	register_rest_route( 'hubee/v1', '/session', [
		'methods'             => 'POST',
		'permission_callback' => 'hubee_rest_perm',
		'callback'            => 'hubee_rest_session',
	] );
	register_rest_route( 'hubee/v1', '/status', [
		'methods'             => 'POST',
		'permission_callback' => 'hubee_rest_perm',
		'callback'            => 'hubee_rest_status',
	] );
	register_rest_route( 'hubee/v1', '/flush', [
		'methods'             => 'GET',
		'permission_callback' => function () { return current_user_can( 'manage_options' ); },
		'callback'            => function () { delete_transient( 'hubee_stripe_products' ); hubee_get_products( true ); return [ 'ok' => true ]; },
	] );
} );

function hubee_rest_perm( WP_REST_Request $req ) {
	return (bool) wp_verify_nonce( $req->get_header( 'X-WP-Nonce' ), 'wp_rest' );
}

/**
 * Cria a Checkout Session embedada.
 * O cliente envia [{price, quantity}]; o servidor valida os price IDs contra
 * a lista de produtos ativos da Stripe — o valor é definido pela Stripe.
 */
function hubee_rest_session( WP_REST_Request $req ) {
	$items = $req->get_param( 'items' );
	if ( empty( $items ) || ! is_array( $items ) ) {
		return new WP_Error( 'hubee_empty', 'Carrinho vazio', [ 'status' => 400 ] );
	}

	// IDs de preço permitidos (apenas produtos ativos).
	$products = hubee_get_products();
	if ( is_wp_error( $products ) ) {
		return $products;
	}
	$allowed = wp_list_pluck( $products, 'price_id' );

	$line_items = [];
	$idx = 0;
	foreach ( $items as $it ) {
		$price = sanitize_text_field( $it['price'] ?? '' );
		$qty   = max( 1, absint( $it['quantity'] ?? 1 ) );
		if ( ! in_array( $price, $allowed, true ) ) {
			continue; // ignora price IDs não reconhecidos
		}
		$line_items[ "line_items[$idx][price]" ]    = $price;
		$line_items[ "line_items[$idx][quantity]" ] = $qty;
		$idx++;
	}
	if ( empty( $line_items ) ) {
		return new WP_Error( 'hubee_bad', 'Nenhum item válido', [ 'status' => 400 ] );
	}

	// Mantém tudo na mesma página: o checkout embedado não redireciona.
	$body = array_merge( [
		'ui_mode'                => 'embedded',
		'mode'                   => 'payment',
		'redirect_on_completion' => 'never',

		// E-mail já é nativo. Cria/salva um Customer com os dados informados.
		'customer_creation'      => 'always',

		// Campo: Nome completo
		'custom_fields[0][key]'           => 'nome',
		'custom_fields[0][label][type]'   => 'custom',
		'custom_fields[0][label][custom]' => 'Nome completo',
		'custom_fields[0][type]'          => 'text',

		// Campo: Nome da marca
		'custom_fields[1][key]'           => 'marca',
		'custom_fields[1][label][type]'   => 'custom',
		'custom_fields[1][label][custom]' => 'Nome da marca',
		'custom_fields[1][type]'          => 'text',
	], $line_items );

	$res = hubee_stripe_request( 'POST', 'checkout/sessions', $body );
	if ( is_wp_error( $res ) ) {
		return $res;
	}
	return [
		'clientSecret' => $res['client_secret'],
		'sessionId'    => $res['id'],
	];
}

/**
 * Após o pagamento: confirma na Stripe que a sessão foi paga, extrai os dados
 * do cliente (e-mail, nome, nome da marca) e dispara o gancho de cadastro.
 *
 * ETAPA FUTURA — cadastro na sua plataforma:
 * Crie um hook em qualquer lugar (functions.php do tema ou outro plugin):
 *
 *   add_action( 'hubee_purchase_complete', function ( $dados ) {
 *       // $dados = [ 'email', 'nome', 'marca', 'session_id', 'amount_total', 'currency', 'line_items' ]
 *       // Ex.: wp_remote_post( 'https://api.hubee.co/clientes', [ 'body' => $dados ] );
 *   } );
 */
function hubee_rest_status( WP_REST_Request $req ) {
	$session_id = sanitize_text_field( $req->get_param( 'session_id' ) );
	if ( ! $session_id ) {
		return new WP_Error( 'hubee_bad', 'Sessão ausente', [ 'status' => 400 ] );
	}

	$sess = hubee_stripe_request( 'GET', 'checkout/sessions/' . $session_id, [
		'expand' => [ 'line_items' ],
	] );
	if ( is_wp_error( $sess ) ) {
		return $sess;
	}

	$paid = ( ( $sess['status'] ?? '' ) === 'complete' ) && ( ( $sess['payment_status'] ?? '' ) === 'paid' );

	// Lê os custom fields (nome / marca).
	$nome = '';
	$marca = '';
	foreach ( $sess['custom_fields'] ?? [] as $f ) {
		if ( ( $f['key'] ?? '' ) === 'nome' ) {
			$nome = $f['text']['value'] ?? '';
		} elseif ( ( $f['key'] ?? '' ) === 'marca' ) {
			$marca = $f['text']['value'] ?? '';
		}
	}

	$email = $sess['customer_details']['email'] ?? '';
	if ( ! $nome ) {
		$nome = $sess['customer_details']['name'] ?? '';
	}

	$dados = [
		'paid'         => $paid,
		'email'        => $email,
		'nome'         => $nome,
		'marca'        => $marca,
		'session_id'   => $session_id,
		'amount_total' => $sess['amount_total'] ?? null,
		'currency'     => strtoupper( $sess['currency'] ?? '' ),
		'line_items'   => array_map( function ( $li ) {
			return [
				'description' => $li['description'] ?? '',
				'quantity'    => $li['quantity'] ?? 1,
				'price_id'    => $li['price']['id'] ?? '',
			];
		}, $sess['line_items']['data'] ?? [] ),
	];

	// Gancho de extensão: dispara só uma vez por sessão paga.
	if ( $paid ) {
		$flag = 'hubee_done_' . md5( $session_id );
		if ( ! get_transient( $flag ) ) {
			set_transient( $flag, 1, DAY_IN_SECONDS );
			do_action( 'hubee_purchase_complete', $dados );
		}
	}

	// Não devolve dados sensíveis além do necessário pro front.
	return [
		'paid'  => $paid,
		'email' => $email,
		'nome'  => $nome,
		'marca' => $marca,
	];
}
