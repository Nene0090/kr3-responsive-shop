const orderForm = document.querySelector('.order-form');
const contactsForm = document.querySelector('.contact-feedback form');

function showError(input, errorElement, message) {
  if (!errorElement) {
    return;
  }
  errorElement.textContent = message;
  input.setAttribute('aria-invalid', 'true');
  if (errorElement.id) {
    input.setAttribute('aria-describedby', errorElement.id);
  }
}

function clearError(input, errorElement) {
  if (!errorElement) {
    return;
  }
  errorElement.textContent = '';
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
}

function digitsOf(value) {
  const digits = value.replace(/\D/g, '');
  if (digits === '') {
    return '';
  }
  if (digits.startsWith('8')) {
    return `7${digits.slice(1)}`;
  }
  if (digits.startsWith('7')) {
    return digits;
  }
  return `7${digits}`;
}

function isPhoneValid(value) {
  const digits = digitsOf(value);
  return digits.length === 11 && digits.startsWith('7');
}

function formatPhone(value) {
  const digits = digitsOf(value);
  if (!digits) {
    return '';
  }
  const visible = digits.slice(0, 11);
  const extra = digits.slice(11);
  const part = visible.slice(1);
  return '+7'
    + (part ? ` (${part.slice(0, 3)}` : '')
    + (part.length >= 3 ? ')' : '')
    + (part.length > 3 ? ` ${part.slice(3, 6)}` : '')
    + (part.length > 6 ? `-${part.slice(6, 8)}` : '')
    + (part.length > 8 ? `-${part.slice(8, 10)}` : '')
    + (extra ? ` [лишние цифры: ${extra}]` : '');
}

function attachPhoneMask(input) {
  if (!input) {
    return;
  }
  input.addEventListener('input', () => {
    const cursorPosition = input.selectionStart;
    const digitsBeforeCursor = input.value.slice(0, cursorPosition).replace(/\D/g, '').length;
    input.value = formatPhone(input.value);
    let newPosition = 0;
    let digitsCount = 0;
    while (newPosition < input.value.length && digitsCount < digitsBeforeCursor) {
      if (/\d/.test(input.value[newPosition])) {
        digitsCount += 1;
      }
      newPosition += 1;
    }
    input.setSelectionRange(newPosition, newPosition);
  });
}

if (orderForm) {
  const nameInput = orderForm.querySelector('#name');
  const emailInput = orderForm.querySelector('#email');
  const phoneInput = orderForm.querySelector('#phone');
  const dateInput = orderForm.querySelector('#date');
  const productSelect = orderForm.querySelector('#product');
  const agreementInput = orderForm.querySelector('input[type="checkbox"]');
  const formMessage = orderForm.querySelector('.form-message') || document.getElementById('successMessage');

  const nameError = orderForm.querySelector('#name-error');
  const emailError = orderForm.querySelector('#email-error');
  const phoneError = orderForm.querySelector('#phone-error');
  const productError = orderForm.querySelector('#product-error');
  const agreementError = orderForm.querySelector('#agreement-error');

  function validateName() {
    const value = nameInput ? nameInput.value.trim() : '';
    if (value.length < 2) {
      showError(nameInput, nameError, 'Введите имя не короче 2 символов.');
      return false;
    }
    clearError(nameInput, nameError);
    return true;
  }

  function validateEmail() {
    const value = emailInput ? emailInput.value.trim() : '';
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(value)) {
      showError(emailInput, emailError, 'Введите корректный e-mail.');
      return false;
    }
    clearError(emailInput, emailError);
    return true;
  }

  function validatePhone() {
    const value = phoneInput ? phoneInput.value : '';
    if (!isPhoneValid(value)) {
      showError(phoneInput, phoneError, 'Введите корректный номер телефона.');
      return false;
    }
    clearError(phoneInput, phoneError);
    return true;
  }

  function validateProduct() {
    const value = productSelect ? productSelect.value : '';
    if (value === '') {
      showError(productSelect, productError, 'Выберите товар.');
      return false;
    }
    clearError(productSelect, productError);
    return true;
  }

  function validateAgreement() {
    const checked = agreementInput ? agreementInput.checked : false;
    if (!checked) {
      showError(agreementInput, agreementError, 'Подтвердите согласие на обработку данных.');
      return false;
    }
    clearError(agreementInput, agreementError);
    return true;
  }

  attachPhoneMask(phoneInput);

  if (nameInput) nameInput.addEventListener('input', validateName);
  if (emailInput) emailInput.addEventListener('input', validateEmail);
  if (phoneInput) phoneInput.addEventListener('blur', validatePhone);
  if (productSelect) productSelect.addEventListener('change', validateProduct);
  if (agreementInput) agreementInput.addEventListener('change', validateAgreement);

  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const validName = validateName();
    const validEmail = validateEmail();
    const validPhone = validatePhone();
    const validProduct = validateProduct();
    const validAgreement = validateAgreement();

    const isFormValid = validName && validEmail && validPhone && validProduct && validAgreement;

    if (formMessage) {
      formMessage.textContent = isFormValid
        ? 'Заявка прошла проверку. Данные не отправлены.'
        : 'Проверьте поля формы.';
      formMessage.classList.toggle('is-success', isFormValid);
      formMessage.classList.toggle('is-error', !isFormValid);
    }

    if (isFormValid) {
      orderForm.reset();
      if (nameError) nameError.textContent = '';
      if (emailError) emailError.textContent = '';
      if (phoneError) phoneError.textContent = '';
      if (productError) productError.textContent = '';
      if (agreementError) agreementError.textContent = '';
    }
  });
}

if (contactsForm) {
  const contactName = contactsForm.querySelector('#contact-name');
  const contactEmail = contactsForm.querySelector('#contact-email');
  const contactMessage = contactsForm.querySelector('#contact-message');
  const contactFormMessage = contactsForm.querySelector('.form-message');

  const contactNameError = contactsForm.querySelector('#contact-name-error');
  const contactEmailError = contactsForm.querySelector('#contact-email-error');

  function validateContactName() {
    const value = contactName ? contactName.value.trim() : '';
    if (value.length < 2) {
      showError(contactName, contactNameError, 'Введите имя не короче 2 символов.');
      return false;
    }
    clearError(contactName, contactNameError);
    return true;
  }

  function validateContactEmail() {
    const value = contactEmail ? contactEmail.value.trim() : '';
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(value)) {
      showError(contactEmail, contactEmailError, 'Введите корректный e-mail.');
      return false;
    }
    clearError(contactEmail, contactEmailError);
    return true;
  }

  if (contactName) contactName.addEventListener('input', validateContactName);
  if (contactEmail) contactEmail.addEventListener('input', validateContactEmail);

  contactsForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const validName = validateContactName();
    const validEmail = validateContactEmail();

    if (contactFormMessage) {
      contactFormMessage.textContent = validName && validEmail
        ? 'Сообщение прошло проверку. Данные не отправлены.'
        : 'Проверьте поля формы.';
      contactFormMessage.classList.toggle('is-success', validName && validEmail);
      contactFormMessage.classList.toggle('is-error', !(validName && validEmail));
    }

    if (validName && validEmail) {
      contactsForm.reset();
      if (contactNameError) contactNameError.textContent = '';
      if (contactEmailError) contactEmailError.textContent = '';
    }
  });
}