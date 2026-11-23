const productsContainer = document.querySelector('[data-products-container]');
const searchInput = document.querySelector('#catalog-search');
const categoryFilter = document.querySelector('#category-filter');
const sortSelect = document.querySelector('#sort-select');
const catalogCount = document.querySelector('.catalog-count');
const catalogEmpty = document.querySelector('.catalog-empty');
const paginationContainer = document.querySelector('.pagination');
const cartCounter = document.querySelector('.cart-counter');
const favoritesCounter = document.querySelector('.favorites-counter');

const catalogState = {
  query: '',
  category: 'all',
  sort: 'default',
  page: 1,
  perPage: 6
};

let cartItems = [];
let favoriteIds = [];

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

function loadFavorites() {
  try {
    const raw = localStorage.getItem('starhit-favorites');
    const value = raw === null ? [] : JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveFavorites() {
  localStorage.setItem('starhit-favorites', JSON.stringify(favoriteIds));
}

function formatPrice(price) {
  return `${price.toLocaleString('ru-RU')} руб.`;
}

function getFinalPrice(product) {
  return Math.round(product.price - product.price * product.discountPercent / 100);
}

function searchProducts(list, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery === '') {
    return list;
  }
  return list.filter((product) => product.title.toLowerCase().includes(normalizedQuery));
}

function filterProductsByCategory(list, category) {
  if (category === 'all') {
    return list;
  }
  return list.filter((product) => product.category === category);
}

function sortProducts(list, sortType) {
  const copy = [...list];
  if (sortType === 'price-asc') {
    return copy.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
  }
  if (sortType === 'price-desc') {
    return copy.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
  }
  if (sortType === 'title-asc') {
    return copy.sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sortType === 'rating-desc') {
    return copy.sort((a, b) => b.rating - a.rating);
  }
  return copy;
}

function getPreparedProducts(list, state) {
  let result = [...list];
  result = searchProducts(result, state.query);
  result = filterProductsByCategory(result, state.category);
  result = sortProducts(result, state.sort);
  return result;
}

function updateCartCounter() {
  if (cartCounter) {
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    cartCounter.textContent = `Корзина: ${totalQuantity}`;
  }
}

function updateFavoritesCounter() {
  if (favoritesCounter) {
    favoritesCounter.textContent = `Избранное: ${favoriteIds.length}`;
  }
}

function createProductCard(product) {
  const card = document.createElement('article');
  card.classList.add('product-card');
  card.dataset.productId = String(product.id);

  if (product.discountPercent > 0) {
    const badge = document.createElement('span');
    badge.classList.add('product-card__badge');
    badge.textContent = `-${product.discountPercent}%`;
    card.append(badge);
  }

  const favoriteButton = document.createElement('button');
  favoriteButton.type = 'button';
  favoriteButton.classList.add('product-card__favorite');
  favoriteButton.dataset.action = 'toggle-favorite';
  favoriteButton.dataset.productId = String(product.id);
  favoriteButton.setAttribute('aria-label', 'Добавить в избранное');
  favoriteButton.textContent = favoriteIds.includes(product.id) ? '★' : '☆';
  if (favoriteIds.includes(product.id)) {
    favoriteButton.classList.add('is-active');
  }
  card.append(favoriteButton);

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

function renderPagination(totalPages) {
  if (!paginationContainer) {
    return;
  }
  paginationContainer.textContent = '';
  if (totalPages <= 1) {
    return;
  }
  for (let page = 1; page <= totalPages; page += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('pagination__btn');
    if (page === catalogState.page) {
      button.classList.add('is-active');
    }
    button.dataset.action = 'go-to-page';
    button.dataset.page = String(page);
    button.textContent = String(page);
    paginationContainer.append(button);
  }
}

function renderProducts(list) {
  if (!productsContainer) {
    return;
  }

  productsContainer.textContent = '';

  if (catalogCount) {
    catalogCount.textContent = `Найдено товаров: ${list.length}`;
  }

  if (catalogEmpty) {
    catalogEmpty.hidden = list.length > 0;
  }

  const totalPages = Math.ceil(list.length / catalogState.perPage);
  if (catalogState.page > totalPages && totalPages > 0) {
    catalogState.page = totalPages;
  }
  if (totalPages === 0) {
    catalogState.page = 1;
  }

  const startIndex = (catalogState.page - 1) * catalogState.perPage;
  const pageItems = list.slice(startIndex, startIndex + catalogState.perPage);

  pageItems.forEach((product) => {
    productsContainer.append(createProductCard(product));
  });

  renderPagination(totalPages);
}

function updateCatalog() {
  const prepared = getPreparedProducts(products, catalogState);
  renderProducts(prepared);
}

function addToCart(productId) {
  const existing = cartItems.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.push({ productId, quantity: 1 });
  }
  saveCart();
  updateCartCounter();
}

function toggleFavorite(productId) {
  if (favoriteIds.includes(productId)) {
    favoriteIds = favoriteIds.filter((id) => id !== productId);
  } else {
    favoriteIds.push(productId);
  }
  saveFavorites();
  updateFavoritesCounter();
  updateCatalog();
}

if (searchInput) {
  searchInput.addEventListener('input', (event) => {
    catalogState.query = event.target.value;
    catalogState.page = 1;
    updateCatalog();
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener('change', (event) => {
    catalogState.category = event.target.value;
    catalogState.page = 1;
    updateCatalog();
  });
}

if (sortSelect) {
  sortSelect.addEventListener('change', (event) => {
    catalogState.sort = event.target.value;
    catalogState.page = 1;
    updateCatalog();
  });
}

if (paginationContainer) {
  paginationContainer.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="go-to-page"]');
    if (!button) {
      return;
    }
    catalogState.page = Number(button.dataset.page);
    updateCatalog();
  });
}

if (productsContainer) {
  productsContainer.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-action="add-to-cart"]');
    if (addButton) {
      const productId = Number(addButton.dataset.productId);
      const selected = products.find((product) => product.id === productId);
      if (!selected || !selected.isAvailable) {
        return;
      }
      addToCart(productId);
      return;
    }

    const favoriteButton = event.target.closest('[data-action="toggle-favorite"]');
    if (favoriteButton) {
      toggleFavorite(Number(favoriteButton.dataset.productId));
    }
  });
}

cartItems = loadCart();
favoriteIds = loadFavorites();
updateCartCounter();
updateFavoritesCounter();

if (productsContainer) {
  updateCatalog();
}