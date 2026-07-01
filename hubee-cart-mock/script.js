const STORAGE_KEY = "hubee-cart-mvp";

const products = [
  {
    id: "apresentacao-comercial",
    name: "Apresentação Comercial",
    initials: "AC",
    price: 7000,
    unitSingular: "slide",
    unitPlural: "slides",
    description: "Apresentação comercial, institucional ou de vendas.",
    cardScope: "A partir de 10 slides",
    summaryUnitSingular: "slide",
    summaryUnitPlural: "slides",
    scope: {
      singular: "slide",
      plural: "slides",
      controlLabel: "Slides da apresentação",
      initialQuantity: 10,
      minQuantity: 10,
      step: 5,
    },
  },
  {
    id: "identidade-visual",
    name: "Identidade Visual",
    initials: "IV",
    price: 90000,
    unitSingular: "projeto",
    unitPlural: "projetos",
    description: "Projeto de identidade visual para marca ou campanha.",
    cardScope: "Por projeto",
  },
  {
    id: "landing-page",
    name: "Landing Page",
    initials: "LP",
    price: 25000,
    unitSingular: "seção",
    unitPlural: "seções",
    description: "Página de conversão estruturada por seções.",
    cardScope: "Por seção",
    summaryUnitSingular: "seção",
    summaryUnitPlural: "seções",
    scope: {
      singular: "seção",
      plural: "seções",
      controlLabel: "Seções da landing page",
      initialQuantity: 5,
      minQuantity: 5,
      step: 1,
    },
  },
  {
    id: "motion-kit",
    name: "Motion Kit",
    initials: "MK",
    price: 45000,
    unitSingular: "motion",
    unitPlural: "motions",
    description: "Animações curtas para campanhas digitais.",
    cardScope: "Por motion",
  },
];

const productsById = products.reduce((acc, product) => {
  acc[product.id] = product;
  return acc;
}, {});

const productsGrid = document.querySelector("#productsGrid");
const cartDrawer = document.querySelector("#cartDrawer");
const pageOverlay = document.querySelector("#pageOverlay");
const pageShell = document.querySelector("#pageShell");
const openCartButton = document.querySelector("#openCartButton");
const closeCartButton = document.querySelector("#closeCartButton");
const cartContent = document.querySelector("#cartContent");
const drawerItemCount = document.querySelector("#drawerItemCount");
const cartButtonCount = document.querySelector("#cartButtonCount");
const toast = document.querySelector("#toast");

let cart = loadCart();
let toastTimer;

function formatCurrency(valueInCents) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInCents / 100);
}

function getTotalDeliveries() {
  return cart.length;
}

function getSubtotal() {
  return cart.reduce((total, item) => {
    const product = productsById[item.id];
    return product ? total + getLineTotal(product, item) : total;
  }, 0);
}

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    if (!Array.isArray(savedCart)) {
      return [];
    }

    return savedCart
      .filter((item) => productsById[item.id])
      .flatMap((item) => normalizeCartItem(productsById[item.id], item));
  } catch {
    return [];
  }
}

function normalizeCartItem(product, item) {
  const legacyDeliveries = Number(item.deliveries) || 1;
  const itemCount = item.itemId ? 1 : Math.max(1, Math.floor(legacyDeliveries));
  const legacyScope = item.scope ?? item.quantity;

  return Array.from({ length: itemCount }, (_, index) => ({
    itemId: item.itemId || createCartItemId(product.id, index),
    id: product.id,
    scope: product.scope ? normalizeStepValue(legacyScope, product.scope.minQuantity, product.scope.step) : undefined,
  }));
}

function normalizeStepValue(value, minimum, step) {
  const parsedQuantity = Number(value);
  const quantity = Number.isFinite(parsedQuantity) ? parsedQuantity : minimum;

  if (quantity <= minimum) {
    return minimum;
  }

  const offset = quantity - minimum;
  return minimum + Math.ceil(offset / step) * step;
}

function getLineTotal(product, item) {
  return product.price * getScopeQuantity(product, item);
}

function getScopeQuantity(product, item) {
  return product.scope ? item.scope : 1;
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function renderProducts() {
  productsGrid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-thumb" aria-hidden="true">
            <span>${product.initials}</span>
          </div>
          <div class="product-body">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-meta">
              <span class="product-price">${formatCurrency(product.price)}</span>
              <span class="product-unit">${product.cardScope}</span>
            </div>
            <button class="add-button" type="button" data-add-product="${product.id}">
              Adicionar ao carrinho
            </button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderCart() {
  const totalDeliveries = getTotalDeliveries();
  const subtotal = getSubtotal();
  const itemText = totalDeliveries === 1 ? "1 entrega no carrinho" : `${totalDeliveries} entregas no carrinho`;

  drawerItemCount.textContent = itemText;
  cartButtonCount.textContent = String(totalDeliveries);

  if (cart.length === 0) {
    cartContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__inner">
          <span class="empty-state__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M7 7h13l-1.7 8.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.6L5.8 4H3" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="17" cy="20" r="1" />
            </svg>
          </span>
          <h3>Seu carrinho está vazio.</h3>
          <p>Adicione um serviço para visualizar o subtotal e continuar a simulação.</p>
          <button class="secondary-button" type="button" data-close-cart>Continuar comprando</button>
        </div>
      </div>
    `;
    return;
  }

  cartContent.innerHTML = `
    <ul class="cart-list">
      ${cart.map((item) => renderCartItem(item, getProductInstanceNumber(item))).join("")}
    </ul>
    <div class="cart-divider"></div>
    <div class="cart-summary" aria-label="Resumo do carrinho">
      <div class="summary-row">
        <span>Subtotal</span>
        <strong>${formatCurrency(subtotal)}</strong>
      </div>
      <div class="summary-row total">
        <strong>Total</strong>
        <span>${formatCurrency(subtotal)}</span>
      </div>
    </div>
    <div class="drawer-actions">
      <button class="checkout-button" type="button" data-checkout>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
        Finalizar compra
      </button>
      <button class="secondary-button" type="button" data-close-cart>Continuar comprando</button>
      <p class="stripe-note">Pagamento via <strong>stripe</strong></p>
    </div>
  `;
}

function renderCartItem(item, instanceNumber) {
  const product = productsById[item.id];
  const lineTotal = getLineTotal(product, item);
  const itemTitle = `${product.name} #${instanceNumber}`;

  return `
    <li class="cart-item" data-cart-item="${item.itemId}">
      <div class="cart-thumb" aria-hidden="true">
        <span>${product.initials}</span>
      </div>
      <div class="cart-item-main">
        <div class="cart-item-top">
          <div>
            <h3 class="cart-item-title">${itemTitle}</h3>
            <p class="cart-item-description">${product.description}</p>
          </div>
        </div>
      </div>
      <button class="icon-button remove-button" type="button" data-remove-item="${item.itemId}" aria-label="Remover ${itemTitle}">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="m19 6-1 14H6L5 6" />
          <path d="M10 11v5" />
          <path d="M14 11v5" />
        </svg>
      </button>
      <div class="cart-item-controls">
        <div class="cart-controls-stack">
          ${renderScopeControl(product, item)}
        </div>
        <div class="line-total-wrap">
          <span>Total</span>
          <strong class="line-total">${formatCurrency(lineTotal)}</strong>
        </div>
      </div>
    </li>
  `;
}

function renderScopeControl(product, item) {
  if (!product.scope) {
    return "";
  }

  return `
    <div class="scope-control">
      <span class="scope-label">${product.scope.controlLabel}</span>
      <div class="quantity-stepper" aria-label="${product.scope.controlLabel} de ${product.name}">
        <button type="button" data-decrease-scope="${item.itemId}" ${item.scope === product.scope.minQuantity ? "disabled" : ""}>-</button>
        <span>${item.scope}</span>
        <button type="button" data-increase-scope="${item.itemId}">+</button>
      </div>
    </div>
  `;
}

function addProduct(productId) {
  const product = productsById[productId];

  if (!product) {
    return;
  }

  cart.push(createCartItem(product));

  saveCart();
  renderCart();
  openCart();
}

function createCartItem(product) {
  return {
    itemId: createCartItemId(product.id),
    id: product.id,
    scope: product.scope ? product.scope.initialQuantity : undefined,
  };
}

function createCartItemId(productId, index = 0) {
  return `${productId}-${Date.now().toString(36)}-${index}-${Math.random().toString(36).slice(2, 8)}`;
}

function getProductInstanceNumber(item) {
  return cart.filter((cartItem) => cartItem.id === item.id).findIndex((cartItem) => cartItem.itemId === item.itemId) + 1;
}

function increaseScope(itemId) {
  const item = cart.find((cartItem) => cartItem.itemId === itemId);
  const product = item ? productsById[item.id] : null;

  if (!item || !product?.scope) {
    return;
  }

  item.scope += product.scope.step;
  saveCart();
  renderCart();
}

function decreaseScope(itemId) {
  const item = cart.find((cartItem) => cartItem.itemId === itemId);
  const product = item ? productsById[item.id] : null;

  if (!item || !product?.scope || item.scope === product.scope.minQuantity) {
    return;
  }

  item.scope = Math.max(product.scope.minQuantity, item.scope - product.scope.step);
  saveCart();
  renderCart();
}

function removeItem(itemId) {
  cart = cart.filter((item) => item.itemId !== itemId);
  saveCart();
  renderCart();
}

function openCart() {
  pageOverlay.hidden = false;
  requestAnimationFrame(() => {
    document.body.classList.add("cart-open");
    pageShell.classList.add("is-muted");
    pageOverlay.classList.add("is-visible");
    cartDrawer.classList.add("is-open");
    cartDrawer.setAttribute("aria-hidden", "false");
  });
}

function closeCart() {
  document.body.classList.remove("cart-open");
  pageShell.classList.remove("is-muted");
  pageOverlay.classList.remove("is-visible");
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");

  window.setTimeout(() => {
    if (!cartDrawer.classList.contains("is-open")) {
      pageOverlay.hidden = true;
    }
  }, 180);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2800);
}

productsGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-product]");

  if (!button) {
    return;
  }

  addProduct(button.dataset.addProduct);
});

cartContent.addEventListener("click", (event) => {
  const closeButton = event.target.closest("[data-close-cart]");
  const checkoutButton = event.target.closest("[data-checkout]");
  const removeButton = event.target.closest("[data-remove-item]");
  const increaseScopeButton = event.target.closest("[data-increase-scope]");
  const decreaseScopeButton = event.target.closest("[data-decrease-scope]");

  if (closeButton) {
    closeCart();
    return;
  }

  if (checkoutButton) {
    showToast("Checkout ainda não implementado neste MVP.");
    return;
  }

  if (removeButton) {
    removeItem(removeButton.dataset.removeItem);
    return;
  }

  if (increaseScopeButton) {
    increaseScope(increaseScopeButton.dataset.increaseScope);
    return;
  }

  if (decreaseScopeButton) {
    decreaseScope(decreaseScopeButton.dataset.decreaseScope);
  }
});

openCartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
pageOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) {
    closeCart();
  }
});

renderProducts();
renderCart();
