const productModal = document.querySelector('#product-modal');
const modalTitle = document.querySelector('#modal-title');
const modalImage = document.querySelector('#modal-image');
const modalRating = document.querySelector('#modal-rating');
const modalDescription = document.querySelector('#modal-description');
const modalPrice = document.querySelector('#modal-price');
const modalStatus = document.querySelector('#modal-status');
const modalSpecs = document.querySelector('#modal-specs');
const modalClose = document.querySelector('#modal-close');
const modalAddBtn = document.querySelector('#modal-add');

let modalProductId = null;

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

function fillModal(product) {
  modalProductId = product.id;

  if (modalTitle) {
    modalTitle.textContent = product.title;
  }

  if (modalImage) {
    modalImage.src = product.image;
    modalImage.alt = product.title;
  }

  if (modalRating) {
    modalRating.textContent = `★ ${product.rating.toFixed(1)}`;
  }

  if (modalDescription) {
    modalDescription.textContent = product.description;
  }

  if (modalPrice) {
    modalPrice.textContent = '';
    if (product.discountPercent > 0) {
      const oldPrice = document.createElement('span');
      oldPrice.classList.add('modal__price-old');
      oldPrice.textContent = formatPrice(product.price);
      modalPrice.append(oldPrice);
      const newPrice = document.createElement('span');
      newPrice.classList.add('modal__price-new');
      newPrice.textContent = formatPrice(getFinalPrice(product));
      modalPrice.append(newPrice);
    } else {
      modalPrice.textContent = formatPrice(product.price);
    }
  }

  if (modalStatus) {
    modalStatus.textContent = product.isAvailable ? 'В наличии' : 'Нет в наличии';
    modalStatus.classList.toggle('is-unavailable', !product.isAvailable);
  }

  if (modalSpecs) {
    modalSpecs.textContent = '';
    Object.entries(product.specs).forEach(([key, value]) => {
      const row = document.createElement('tr');
      const cellKey = document.createElement('td');
      cellKey.textContent = key;
      const cellValue = document.createElement('td');
      cellValue.textContent = value;
      row.append(cellKey, cellValue);
      modalSpecs.append(row);
    });
  }

  if (modalAddBtn) {
    if (!product.isAvailable) {
      modalAddBtn.disabled = true;
      modalAddBtn.textContent = 'Недоступно';
    } else {
      modalAddBtn.disabled = false;
      modalAddBtn.textContent = 'В корзину';
    }
  }
}

function openModal(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product || !productModal) {
    return;
  }
  fillModal(product);
  productModal.showModal();
}

if (productModal && modalClose) {
  modalClose.addEventListener('click', () => {
    productModal.close();
  });

  productModal.addEventListener('click', (event) => {
    if (event.target === productModal) {
      productModal.close();
    }
  });
}

if (modalAddBtn) {
  modalAddBtn.addEventListener('click', () => {
    if (modalProductId === null) {
      return;
    }
    const cart = loadCart();
    const existing = cart.find((item) => item.productId === modalProductId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ productId: modalProductId, quantity: 1 });
    }
    saveCart(cart);
    modalAddBtn.textContent = 'Добавлено';
    setTimeout(() => {
      modalAddBtn.textContent = 'В корзину';
    }, 1500);
  });
}