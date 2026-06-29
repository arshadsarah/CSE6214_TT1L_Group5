const VALID_ROLES = ['Student', 'Staff / Faculty', 'Resource Manager', 'Admin'];

function $(id) {
  return document.getElementById(id);
}

function setText(id, message = '') {
  const element = $(id);
  if (element) element.textContent = message;
}

function setInvalid(id, isInvalid) {
  const element = $(id);
  if (element) element.classList.toggle('invalid', Boolean(isInvalid));
}

function showFieldError(inputId, errorId, message) {
  setInvalid(inputId, true);
  setText(errorId, message);
}

function clearFieldError(inputId, errorId) {
  setInvalid(inputId, false);
  setText(errorId, '');
}

function showAlert(message, type = 'error') {
  const alertBox = $('formAlert');
  if (!alertBox) return;

  alertBox.textContent = message;
  alertBox.classList.remove('error-alert', 'success-alert');
  alertBox.classList.add('show', type === 'success' ? 'success-alert' : 'error-alert');
}

function clearAlert() {
  const alertBox = $('formAlert');
  if (!alertBox) return;

  alertBox.textContent = '';
  alertBox.classList.remove('show', 'error-alert', 'success-alert');
}

function showToast(message) {
  const toast = $('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

function isSafeSearchText(value) {
  return /^[a-zA-Z0-9 ._-]+$/.test(value);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isValidUsername(value) {
  return /^[a-zA-Z0-9._]{3,30}$/.test(value);
}

function getSelectedRole() {
  const selectedRole = localStorage.getItem('selectedRole');
  return VALID_ROLES.includes(selectedRole) ? selectedRole : '';
}

// HOME PAGE SEARCH VALIDATION
const resourceSearchForm = $('resourceSearchForm');

if (resourceSearchForm) {
  const resourceName = $('resourceName');
  const category = $('category');
  const location = $('location');

  resourceSearchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    clearAlert();
    clearFieldError('resourceName', 'resourceNameError');
    clearFieldError('category', 'categoryError');
    clearFieldError('location', 'locationError');

    const resourceValue = resourceName.value.trim();
    let isValid = true;

    if (!resourceValue) {
      showFieldError('resourceName', 'resourceNameError', 'Please enter a resource name.');
      isValid = false;
    } else if (resourceValue.length < 2) {
      showFieldError('resourceName', 'resourceNameError', 'Enter at least 2 characters.');
      isValid = false;
    } else if (!isSafeSearchText(resourceValue)) {
      showFieldError(
        'resourceName',
        'resourceNameError',
        'Only letters, numbers, spaces, dot, dash and underscore are allowed.'
      );
      isValid = false;
    }

    if (!category.value) {
      showFieldError('category', 'categoryError', 'Please select a category.');
      isValid = false;
    }

    if (!location.value) {
      showFieldError('location', 'locationError', 'Please select a location.');
      isValid = false;
    }

    if (!isValid) {
      showToast('Invalid search blocked. Please fix the highlighted fields.');
      return;
    }

    showToast('Search input is valid. You can connect this to backend search now.');
    resourceSearchForm.reset();
  });

  [resourceName, category, location].forEach((field) => {
    field.addEventListener('input', () => {
      clearFieldError(field.id, `${field.id}Error`);
    });

    field.addEventListener('change', () => {
      clearFieldError(field.id, `${field.id}Error`);
    });
  });
}

// ROLE PAGE VALIDATION
const roleList = $('roleList');

if (roleList) {
  roleList.addEventListener('click', (event) => {
    const roleButton = event.target.closest('.role-option');
    if (!roleButton) return;

    clearAlert();
    setText('roleError', '');

    const selectedRole = roleButton.dataset.role;

    if (!VALID_ROLES.includes(selectedRole)) {
      setText('roleError', 'Please select a valid role.');
      showAlert('Invalid role selected. Please choose Student, Staff / Faculty, Resource Manager, or Admin.');
      showToast('Invalid role blocked.');
      return;
    }

    localStorage.setItem('selectedRole', selectedRole);
    showAlert(`${selectedRole} role selected. Redirecting to login...`, 'success');
    showToast(`${selectedRole} selected.`);

    window.setTimeout(() => {
      window.location.href = 'login.html';
    }, 650);
  });
}

// LOGIN PAGE ROLE TEXT
const selectedRoleText = $('selectedRoleText');

if (selectedRoleText) {
  const selectedRole = getSelectedRole();
  selectedRoleText.textContent = selectedRole ? `Role: ${selectedRole}` : 'Role: Not selected';
}

// PASSWORD SHOW / HIDE
const togglePassword = $('togglePassword');

if (togglePassword) {
  togglePassword.addEventListener('click', () => {
    const password = $('password');
    if (!password) return;

    password.type = password.type === 'password' ? 'text' : 'password';
    togglePassword.setAttribute(
      'aria-label',
      password.type === 'password' ? 'Show password' : 'Hide password'
    );
  });
}

// LOGIN PAGE VALIDATION + PHP BACKEND LOGIN
const loginForm = $('loginForm');

if (loginForm) {
  const username = $('username');
  const email = $('email');
  const password = $('password');

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    clearAlert();
    clearFieldError('usernameWrap', 'usernameError');
    clearFieldError('emailWrap', 'emailError');
    clearFieldError('passwordWrap', 'passwordError');
    setText('loginRoleError', '');

    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value;
    const selectedRole = getSelectedRole();

    let isValid = true;

    if (!selectedRole) {
      setText('loginRoleError', 'Please select your role before login.');
      isValid = false;
    }

    if (!usernameValue) {
      showFieldError('usernameWrap', 'usernameError', 'Username is required.');
      isValid = false;
    } else if (!isValidUsername(usernameValue)) {
      showFieldError(
        'usernameWrap',
        'usernameError',
        'Use 3–30 letters, numbers, dot or underscore only.'
      );
      isValid = false;
    }

    if (!emailValue) {
      showFieldError('emailWrap', 'emailError', 'Email is required.');
      isValid = false;
    } else if (!isValidEmail(emailValue)) {
      showFieldError('emailWrap', 'emailError', 'Please enter a valid email address.');
      isValid = false;
    }

    if (!passwordValue) {
      showFieldError('passwordWrap', 'passwordError', 'Password is required.');
      isValid = false;
    } else if (passwordValue.length < 8) {
      showFieldError('passwordWrap', 'passwordError', 'Password must be at least 8 characters.');
      isValid = false;
    } else if (/\s/.test(passwordValue)) {
      showFieldError('passwordWrap', 'passwordError', 'Password cannot contain spaces.');
      isValid = false;
    } else if (!/[A-Za-z]/.test(passwordValue) || !/\d/.test(passwordValue)) {
      showFieldError(
        'passwordWrap',
        'passwordError',
        'Password must include at least one letter and one number.'
      );
      isValid = false;
    }

    if (!isValid) {
      showAlert('Login blocked because one or more inputs are invalid.');
      showToast('Invalid login blocked.');
      return;
    }

    fetch('login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: usernameValue,
        email: emailValue,
        password: passwordValue,
        role: selectedRole
      })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem('loggedInUser', JSON.stringify(data.user));

          showAlert('Login successful. Redirecting...', 'success');
          showToast('Login successful.');

          window.setTimeout(() => {
            window.location.href = data.redirect;
          }, 700);
        } else {
          showAlert(data.message || 'Login failed.');
          showToast('Login failed.');
        }
      })
      .catch((error) => {
        console.error('Login error:', error);
        showAlert('Something went wrong. Please check XAMPP, database, and login.php.');
        showToast('Backend connection failed.');
      });
  });

  username.addEventListener('input', () => {
    clearFieldError('usernameWrap', 'usernameError');
  });

  email.addEventListener('input', () => {
    clearFieldError('emailWrap', 'emailError');
  });

  password.addEventListener('input', () => {
    clearFieldError('passwordWrap', 'passwordError');
  });
}

// FORGOT PASSWORD
const forgotLink = $('forgotLink');

if (forgotLink) {
  forgotLink.addEventListener('click', (event) => {
    event.preventDefault();
    showToast('Forgot password page is not connected yet.');
  });
}

// SYSTEM ADMIN LINK
const adminLink = $('adminLink');

if (adminLink) {
  adminLink.addEventListener('click', (event) => {
    event.preventDefault();
    showToast('Please contact the system administrator.');
  });
}

// CREATE ACCOUNT BUTTON
const createAccountBtn = $('createAccountBtn');

if (createAccountBtn) {
  createAccountBtn.addEventListener('click', () => {
    window.location.href = 'student-register.html';
  });
}