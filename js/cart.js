const cartContainer = document.querySelector('[data-cart-container]');
const cartSummary = document.querySelector('[data-cart-summary]');
const cartEmpty = document.querySelector('[data-cart-empty]');
const cartCounter = document.querySelector('.cart-counter');
const promoInput = document.querySelector('#promo-input');
const promoApply = document.querySelector('#promo-apply');
const promoMessage = document.querySelector('#promo-message');

const PROMO_CODES = {
  STAR10: 10,
  HIT20: 20,
  CAFE15: 15
};

let cartItems = [];
let activeDiscount = 0;

function loadCart() {
  try {
    const raw = localStorage.getItem('starhit-cart');
    const value = raw === null ? [] : JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem('starhit-cart', JSON.stringify(cartItems));
}

function loadDiscount() {
  try {
    const raw = localStorage.getItem('starhit-promo');
    const value = raw === null ? 0 : Number(raw);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function saveDiscount() {
  localStorage.setItem('starhit-promo', String(activeDiscount));
}

function formatPrice(price) {
  return `${price.toLocaleString('ru-RU')} руб.`;
}

function getFinalPrice(product) {
  return Math.round(product.price - product.price * product.discountPercent / 100);
}

function updateCartCounter() {
  if (cartCounter) {
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    cartCounter.textContent = `Корзина: ${totalQuantity}`;
  }
}

function getCartDetails() {
  return cartItems
    .map((item) => {
      const product = products.find((product) => product.id === item.productId);
      if (!product) {
        return null;
      }
      return { product, quantity: item.quantity };
    })
    .filter((entry) => entry !== null);
}

function calculateSubtotal() {
  return getCartDetails().reduce((sum, entry) => {
    return sum + getFinalPrice(entry.product) * entry.quantity;
  }, 0);
}

function calculateDiscount(subtotal) {
  return Math.round(subtotal * activeDiscount / 100);
}

function calculateTotal() {
  const subtotal = calculateSubtotal();
  return subtotal - calculateDiscount(subtotal);
}

function createCartRow(entry) {
  const row = document.createElement('article');
  row.classList.add('cart-item');
  row.dataset.productId = String(entry.product.id);

  const image = document.createElement('img');
  image.classList.add('cart-item__image');
  image.src = entry.product.image;
  image.alt = entry.product.title;
  row.append(image);

  const info = document.createElement('div');
  info.classList.add('cart-item__info');

  const title = document.createElement('h3');
  title.classList.add('cart-item__title');
  title.textContent = entry.product.title;
  info.append(title);

  const price = document.createElement('p');
  price.classList.add('cart-item__price');
  price.textContent = formatPrice(getFinalPrice(entry.product));
  info.append(price);

  const controls = document.createElement('div');
  controls.classList.add('cart-item__controls');

  const decreaseBtn = document.createElement('button');
  decreaseBtn.type = 'button';
  decreaseBtn.classList.add('cart-item__btn');
  decreaseBtn.dataset.action = 'decrease';
  decreaseBtn.dataset.productId = String(entry.product.id);
  decreaseBtn.setAttribute('aria-label', 'Уменьшить количество');
  decreaseBtn.textContent = '−';
  controls.append(decreaseBtn);

  const quantity = document.createElement('span');
  quantity.classList.add('cart-item__quantity');
  quantity.textContent = String(entry.quantity);
  controls.append(quantity);

  const increaseBtn = document.createElement('button');
  increaseBtn.type = 'button';
  increaseBtn.classList.add('cart-item__btn');
  increaseBtn.dataset.action = 'increase';
  increaseBtn.dataset.productId = String(entry.product.id);
  increaseBtn.setAttribute('aria-label', 'Увеличить количество');
  increaseBtn.textContent = '+';
  controls.append(increaseBtn);

  info.append(controls);
  row.append(info);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.classList.add('cart-item__remove');
  removeBtn.dataset.action = 'remove';
  removeBtn.dataset.productId = String(entry.product.id);
  removeBtn.setAttribute('aria-label', 'Удалить товар из корзины');
  removeBtn.textContent = '×';
  row.append(removeBtn);

  return row;
}

function renderCart() {
  if (!cartContainer) {
    return;
  }

  cartContainer.textContent = '';
  const details = getCartDetails();

  if (cartEmpty) {
    cartEmpty.hidden = details.length > 0;
  }

  details.forEach((entry) => {
    cartContainer.append(createCartRow(entry));
  });

  if (cartSummary) {
    cartSummary.textContent = '';
    const subtotal = calculateSubtotal();
    const discountValue = calculateDiscount(subtotal);
    const total = subtotal - discountValue;

    const subtotalLine = document.createElement('p');
    subtotalLine.classList.add('cart-summary__line');
    subtotalLine.textContent = `Подытог: ${formatPrice(subtotal)}`;
    cartSummary.append(subtotalLine);

    if (discountValue > 0) {
      const discountLine = document.createElement('p');
      discountLine.classList.add('cart-summary__line', 'cart-summary__line--discount');
      discountLine.textContent = `Скидка по промокоду (${activeDiscount}%): −${formatPrice(discountValue)}`;
      cartSummary.append(discountLine);
    }

    const totalLine = document.createElement('p');
    totalLine.classList.add('cart-summary__line', 'cart-summary__line--total');
    totalLine.textContent = `Итого: ${formatPrice(total)}`;
    cartSummary.append(totalLine);
  }

  updateCartCounter();
}

function changeQuantity(productId, delta) {
  const item = cartItems.find((item) => item.productId === productId);
  if (!item) {
    return;
  }
  item.quantity += delta;
  if (item.quantity <= 0) {
    cartItems = cartItems.filter((item) => item.productId !== productId);
  }
  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cartItems = cartItems.filter((item) => item.productId !== productId);
  saveCart();
  renderCart();
}

if (cartContainer) {
  cartContainer.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) {
      return;
    }
    const productId = Number(button.dataset.productId);
    const action = button.dataset.action;

    if (action === 'increase') {
      changeQuantity(productId, 1);
    } else if (action === 'decrease') {
      changeQuantity(productId, -1);
    } else if (action === 'remove') {
      removeFromCart(productId);
    }
  });
}

if (promoApply && promoInput) {
  promoApply.addEventListener('click', () => {
    const code = promoInput.value.trim().toUpperCase();
    if (code === '') {
      activeDiscount = 0;
      saveDiscount();
      if (promoMessage) {
        promoMessage.textContent = 'Введите промокод.';
        promoMessage.classList.remove('is-success');
        promoMessage.classList.add('is-error');
      }
      renderCart();
      return;
    }
    if (Object.hasOwn(PROMO_CODES, code)) {
      activeDiscount = PROMO_CODES[code];
      saveDiscount();
      if (promoMessage) {
        promoMessage.textContent = `Промокод применён: скидка ${activeDiscount}%.`;
        promoMessage.classList.remove('is-error');
        promoMessage.classList.add('is-success');
      }
    } else {
      activeDiscount = 0;
      saveDiscount();
      if (promoMessage) {
        promoMessage.textContent = 'Промокод не найден.';
        promoMessage.classList.remove('is-success');
        promoMessage.classList.add('is-error');
      }
    }
    renderCart();
  });
}

cartItems = loadCart();
activeDiscount = loadDiscount();
updateCartCounter();
renderCart();