const popularContainer = document.querySelector('[data-popular-container]');
const popularEmpty = document.querySelector('[data-popular-empty]');

function formatPrice(price) {
  return `${price.toLocaleString('ru-RU')} руб.`;
}

function getFinalPrice(product) {
  return Math.round(product.price - product.price * product.discountPercent / 100);
}

function loadCart() {
  try {
    const raw = localStorage.getItem('starhit-cart');
    const value = raw === null ? [] : JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem('starhit-cart', JSON.stringify(items));
}

function createPopularCard(product) {
  const card = document.createElement('article');
  card.classList.add('product-card');
  card.dataset.productId = String(product.id);

  if (product.discountPercent > 0) {
    const badge = document.createElement('span');
    badge.classList.add('product-card__badge');
    badge.textContent = `-${product.discountPercent}%`;
    card.append(badge);
  }

  const image = document.createElement('img');
  image.classList.add('product-card__image');
  image.src = product.image;
  image.alt = product.title;
  image.loading = 'lazy';
  card.append(image);

  const title = document.createElement('h3');
  title.classList.add('product-card__title');
  title.textContent = product.title;
  card.append(title);

  const rating = document.createElement('p');
  rating.classList.add('product-card__rating');
  rating.textContent = `★ ${product.rating.toFixed(1)}`;
  card.append(rating);

  const description = document.createElement('p');
  description.classList.add('product-card__description');
  description.textContent = product.description;
  card.append(description);

  const priceBlock = document.createElement('p');
  priceBlock.classList.add('product-card__price');
  if (product.discountPercent > 0) {
    const oldPrice = document.createElement('span');
    oldPrice.classList.add('product-card__price-old');
    oldPrice.textContent = formatPrice(product.price);
    priceBlock.append(oldPrice);
    const newPrice = document.createElement('span');
    newPrice.classList.add('product-card__price-new');
    newPrice.textContent = formatPrice(getFinalPrice(product));
    priceBlock.append(newPrice);
  } else {
    priceBlock.textContent = formatPrice(product.price);
  }
  card.append(priceBlock);

  const status = document.createElement('p');
  status.classList.add('product-card__status');
  status.textContent = product.isAvailable ? 'В наличии' : 'Нет в наличии';
  if (!product.isAvailable) {
    status.classList.add('is-unavailable');
  }
  card.append(status);

  const actions = document.createElement('div');
  actions.classList.add('product-card__actions');

  const detailsLink = document.createElement('a');
  detailsLink.classList.add('btn', 'btn--small');
  detailsLink.href = `product.html?id=${product.id}`;
  detailsLink.textContent = 'Подробнее';
  actions.append(detailsLink);

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.classList.add('btn', 'btn--small', 'btn--accent');
  addButton.dataset.action = 'add-to-cart';
  addButton.dataset.productId = String(product.id);
  if (!product.isAvailable) {
    addButton.disabled = true;
    addButton.textContent = 'Недоступно';
  } else {
    addButton.textContent = 'В корзину';
  }
  actions.append(addButton);

  card.append(actions);

  return card;
}

function renderPopular() {
  if (!popularContainer) {
    return;
  }

  popularContainer.textContent = '';
  const popular = products.slice(0, 3);

  if (popularEmpty) {
    popularEmpty.hidden = popular.length > 0;
  }

  popular.forEach((product) => {
    popularContainer.append(createPopularCard(product));
  });
}

if (popularContainer) {
  popularContainer.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="add-to-cart"]');
    if (!button) {
      return;
    }
    const productId = Number(button.dataset.productId);
    const selected = products.find((product) => product.id === productId);
    if (!selected || !selected.isAvailable) {
      return;
    }
    const cart = loadCart();
    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ productId, quantity: 1 });
    }
    saveCart(cart);
    button.textContent = 'Добавлено';
    setTimeout(() => {
      button.textContent = 'В корзину';
    }, 1500);
  });

  renderPopular();
}