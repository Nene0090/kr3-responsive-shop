document.addEventListener("DOMContentLoaded", () => {
  
  // 1. БУРГЕР-МЕНЮ
  const menuToggle = document.getElementById("menuToggle");
  const navList = document.getElementById("navList");

  if (menuToggle && navList) {
    menuToggle.addEventListener("click", () => {
      navList.classList.toggle("active");
      const isExpanded = navList.classList.contains("active");
      menuToggle.setAttribute("aria-expanded", isExpanded);
    });
  }

  // 2. КАРУСЕЛЬ (с автопрокруткой)
  const track = document.getElementById("carouselTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (track && prevBtn && nextBtn) {
    let currentIndex = 0;
    const totalSlides = track.children.length;
    let autoPlayInterval;

    function updateCarousel() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % totalSlides;
      updateCarousel();
    }

    nextBtn.addEventListener("click", () => {
      nextSlide();
      resetAutoPlay();
    });

    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      updateCarousel();
      resetAutoPlay();
    });

    function startAutoPlay() {
      autoPlayInterval = setInterval(nextSlide, 4000);
    }

    function stopAutoPlay() {
      clearInterval(autoPlayInterval);
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    startAutoPlay();

    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
      carouselContainer.addEventListener('mouseenter', stopAutoPlay);
      carouselContainer.addEventListener('mouseleave', startAutoPlay);
    }
  }

  // 3. ФИЛЬТРЫ В КАТАЛОГЕ
  const filterCheckboxes = document.querySelectorAll(".filter-checkbox");
  const productCards = document.querySelectorAll(".product-card");

  if (filterCheckboxes.length > 0 && productCards.length > 0) {
    filterCheckboxes.forEach(checkbox => {
      checkbox.addEventListener("change", () => {
        const activeFilters = Array.from(filterCheckboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.value);

        productCards.forEach(card => {
          if (activeFilters.length === 0) {
            card.style.display = "block";
          } else {
            const cardCategories = card.getAttribute("data-category").split(" ");
            const isMatch = activeFilters.some(filter => cardCategories.includes(filter));
            card.style.display = isMatch ? "block" : "none";
          }
        });
      });
    });
  }

  // 4. СТРАНИЦА ТОВАРА (подстановка данных)
  const productTitle = document.getElementById("productTitle");
  
  if (productTitle) {
    const productsData = {
      "1": { title: "Товар 1", price: "299 руб.", desc: "Какое-то кофе 1. Вкусный и бодрящий напиток.", img: "images/coffee-1.jpg", specs: { "Объем": "300 мл", "Состав": "Кофе, молоко", "Калорийность": "150 ккал" } },
      "2": { title: "Товар 2", price: "399 руб.", desc: "Какое-то кофе 2. Освежающий и холодный.", img: "images/coffee-2.jpg", specs: { "Объем": "400 мл", "Состав": "Кофе, лед, сироп", "Калорийность": "120 ккал" } },
      "3": { title: "Товар 3", price: "499 руб.", desc: "Какое-то дорогое кофе 3. Премиальный сорт.", img: "images/coffee-3.jpg", specs: { "Объем": "200 мл", "Состав": "Эспрессо, сливки", "Калорийность": "200 ккал" } }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id") || "1";
    const product = productsData[productId];

    if (product) {
      productTitle.textContent = product.title;
      document.title = `Star Hit Cafe — ${product.title}`;
      document.getElementById("productPrice").textContent = product.price;
      document.getElementById("productDesc").textContent = product.desc;
      
      const imgElement = document.getElementById("productImage");
      imgElement.src = product.img;
      imgElement.alt = product.title;

      const specsBody = document.getElementById("productSpecs");
      specsBody.innerHTML = "";
      for (const [key, value] of Object.entries(product.specs)) {
        specsBody.innerHTML += `<tr><td>${key}</td><td>${value}</td></tr>`;
      }
    }
  }

  // 5. ФОРМА ЗАКАЗА
  const form = document.getElementById("orderForm");
  const successMessage = document.getElementById("successMessage");

  if (form && successMessage) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      successMessage.style.display = "block";
      successMessage.style.color = "#089aa5";
      successMessage.style.fontWeight = "bold";
      successMessage.style.marginTop = "20px";
      successMessage.style.textAlign = "center";
      form.reset();
      setTimeout(() => { successMessage.style.display = "none"; }, 4000);
    });
  }
});