const STORAGE_KEY = "hubee-cart-mvp";

const products = [
  {
    id: "apresentacao-comercial",
    name: "Apresentação Comercial",
    initials: "AC",
    price: 7000,
    unitSingular: "slide",
    unitPlural: "slides",
    description: "Apresentações comerciais, institucionais ou de vendas.",
    placeholder: "Ex: apresentação institucional para venda B2B",
  },
  {
    id: "identidade-visual",
    name: "Identidade Visual",
    initials: "IV",
    price: 90000,
    unitSingular: "projeto",
    unitPlural: "projetos",
    description: "Criação de identidade visual para marcas e campanhas.",
    placeholder: "Ex: identidade para nova marca de cosméticos",
  },
  {
    id: "landing-page",
    name: "Landing Page",
    initials: "LP",
    price: 25000,
    unitSingular: "seção",
    unitPlural: "seções",
    description: "Desenvolvimento visual de landing pages por seção.",
    placeholder: "Ex: LP para captação de leads",
  },
  {
    id: "social-media",
    name: "Social Media",
    initials: "SM",
    price: 15000,
    unitSingular: "peça",
    unitPlural: "peças",
    description: "Peças estáticas para redes sociais.",
    placeholder: "Ex: posts para campanha de lançamento",
  },
  {
    id: "motion-kit",
    name: "Motion Kit",
    initials: "MK",
    price: 45000,
    unitSingular: "motion",
    unitPlural: "motions",
    description: "Animações curtas para campanhas digitais.",
    placeholder: "Ex: animações curtas para redes sociais",
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

function getUnitLabel(product, quantity) {
  return `${quantity} ${quantity === 1 ? product.unitSingular : product.unitPlural}`;
}

function getTotalItems() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function getSubtotal() {
  return cart.reduce((total, item) => {
    const product = productsById[item.id];
    return product ? total + product.price * item.quantity : total;
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
      .map((item) => ({
        id: item.id,
        quantity: Math.max(1, Number(item.quantity) || 1),
        note: typeof item.note === "string" ? item.note : "",
      }));
  } catch {
    return [];
  }
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
              <span class="product-unit">por ${product.unitSingular}</span>
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
  const totalItems = getTotalItems();
  const subtotal = getSubtotal();
  const itemText = totalItems === 1 ? "1 item" : `${totalItems} itens`;

  drawerItemCount.textContent = itemText;
  cartButtonCount.textContent = String(totalItems);

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
      ${cart.map(renderCartItem).join("")}
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

function renderCartItem(item) {
  const product = productsById[item.id];
  const lineTotal = product.price * item.quantity;

  return `
    <li class="cart-item" data-cart-item="${item.id}">
      <div class="cart-thumb" aria-hidden="true">
        <span>${product.initials}</span>
      </div>
      <div class="cart-item-main">
        <div class="cart-item-top">
          <div>
            <h3 class="cart-item-title">${product.name}</h3>
            <p class="cart-item-unit">${getUnitLabel(product, item.quantity)}</p>
            <p class="cart-item-price">${formatCurrency(product.price)}</p>
          </div>
        </div>
        <textarea
          class="item-description"
          data-note-product="${item.id}"
          maxlength="160"
          placeholder="${product.placeholder}"
          aria-label="Descrição curta para ${product.name}"
        >${escapeTextarea(item.note)}</textarea>
      </div>
      <button class="icon-button remove-button" type="button" data-remove-product="${item.id}" aria-label="Remover ${product.name}">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="m19 6-1 14H6L5 6" />
          <path d="M10 11v5" />
          <path d="M14 11v5" />
        </svg>
      </button>
      <div class="cart-item-controls">
        <div class="quantity-stepper" aria-label="Quantidade de ${product.name}">
          <button type="button" data-decrease-product="${item.id}" ${item.quantity === 1 ? "disabled" : ""}>-</button>
          <span>${item.quantity}</span>
          <button type="button" data-increase-product="${item.id}">+</button>
        </div>
        <strong class="line-total">${formatCurrency(lineTotal)}</strong>
      </div>
    </li>
  `;
}

function escapeTextarea(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function addProduct(productId) {
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1, note: "" });
  }

  saveCart();
  renderCart();
  openCart();
}

function increaseQuantity(productId) {
  const item = cart.find((cartItem) => cartItem.id === productId);

  if (!item) {
    return;
  }

  item.quantity += 1;
  saveCart();
  renderCart();
}

function decreaseQuantity(productId) {
  const item = cart.find((cartItem) => cartItem.id === productId);

  if (!item || item.quantity === 1) {
    return;
  }

  item.quantity -= 1;
  saveCart();
  renderCart();
}

function removeProduct(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
}

function updateNote(productId, value) {
  const item = cart.find((cartItem) => cartItem.id === productId);

  if (!item) {
    return;
  }

  item.note = value;
  saveCart();
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
  const removeButton = event.target.closest("[data-remove-product]");
  const increaseButton = event.target.closest("[data-increase-product]");
  const decreaseButton = event.target.closest("[data-decrease-product]");

  if (closeButton) {
    closeCart();
    return;
  }

  if (checkoutButton) {
    showToast("Checkout ainda não implementado neste MVP.");
    return;
  }

  if (removeButton) {
    removeProduct(removeButton.dataset.removeProduct);
    return;
  }

  if (increaseButton) {
    increaseQuantity(increaseButton.dataset.increaseProduct);
    return;
  }

  if (decreaseButton) {
    decreaseQuantity(decreaseButton.dataset.decreaseProduct);
  }
});

cartContent.addEventListener("input", (event) => {
  const field = event.target.closest("[data-note-product]");

  if (!field) {
    return;
  }

  updateNote(field.dataset.noteProduct, field.value);
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
