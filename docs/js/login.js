/**
 * SalesSync — Login & Registration Page Controller
 * Handles form validation, UI state transitions, tab switching, and auth flow.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if already authenticated — if so, auto-redirect to dashboard
    if (window.SalesSyncAuth && window.SalesSyncAuth.isAuthenticated()) {
        const urlParams = new URLSearchParams(window.location.search);
        // Only redirect if not explicitly logged out
        if (!urlParams.has('logged_out')) {
            window.location.href = 'dashboard.html';
            return;
        }
    }

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginAlert = document.getElementById('loginAlert');
    const alertMessage = document.getElementById('alertMessage');
    const alertIcon = document.getElementById('alertIcon');

    // Tabs / View toggle
    const viewLoginBtn = document.getElementById('viewLoginBtn');
    const viewRegisterBtn = document.getElementById('viewRegisterBtn');
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');
    const cardTitle = document.getElementById('cardTitle');
    const cardSubtitle = document.getElementById('cardSubtitle');

    // Password visibility toggles
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;

            const icon = btn.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                if (icon) {
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                }
            } else {
                input.type = 'password';
                if (icon) {
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });
    });

    // Helper: Show Alert
    function showAlert(message, type = 'error') {
        if (!loginAlert) return;
        loginAlert.className = `login-alert login-alert--${type} show`;
        if (alertMessage) alertMessage.textContent = message;
        if (alertIcon) {
            alertIcon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        }
    }

    function hideAlert() {
        if (!loginAlert) return;
        loginAlert.className = 'login-alert';
    }

    // Helper: Clear field errors
    function clearFieldErrors(form) {
        if (!form) return;
        form.querySelectorAll('.login-input').forEach(input => input.classList.remove('input-error'));
        form.querySelectorAll('.login-field-error').forEach(err => {
            err.textContent = '';
            err.classList.remove('show');
        });
    }

    function setFieldError(fieldId, errorId, message) {
        const field = document.getElementById(fieldId);
        const err = document.getElementById(errorId);
        if (field) field.classList.add('input-error');
        if (err) {
            err.textContent = message;
            err.classList.add('show');
        }
    }

    // Check for logged_out query param
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('logged_out')) {
        showAlert('You have been signed out successfully.', 'success');
        // Clean URL without refresh
        history.replaceState(null, '', window.location.pathname);
    }

    // Tab Switchers
    if (viewRegisterBtn) {
        viewRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideAlert();
            clearFieldErrors(loginForm);
            if (loginSection) loginSection.style.display = 'none';
            if (registerSection) registerSection.style.display = 'block';
            if (cardTitle) cardTitle.textContent = 'Create Account';
            if (cardSubtitle) cardSubtitle.textContent = 'Sign up to access the sales analytics portal';
        });
    }

    if (viewLoginBtn) {
        viewLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideAlert();
            clearFieldErrors(registerForm);
            if (registerSection) registerSection.style.display = 'none';
            if (loginSection) loginSection.style.display = 'block';
            if (cardTitle) cardTitle.textContent = 'SalesSync Portal';
            if (cardSubtitle) cardSubtitle.textContent = 'Sign in to access your real-time analytics';
        });
    }

    // Quick Autofill Demo Credentials
    const demoCard = document.getElementById('demoCredentialsBox');
    if (demoCard) {
        demoCard.style.cursor = 'pointer';
        demoCard.setAttribute('title', 'Click to auto-fill demo credentials');
        demoCard.addEventListener('click', () => {
            const userInput = document.getElementById('loginUsername');
            const passInput = document.getElementById('loginPassword');
            if (userInput && passInput) {
                userInput.value = 'admin';
                passInput.value = 'admin123';
                showAlert('Demo credentials filled! Click "Sign In" or press Enter.', 'success');
                userInput.focus();
            }
        });
    }

    // Handle Login Submit
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            hideAlert();
            clearFieldErrors(loginForm);

            const username = document.getElementById('loginUsername')?.value.trim();
            const password = document.getElementById('loginPassword')?.value;
            const rememberMe = document.getElementById('rememberMe')?.checked;
            const submitBtn = document.getElementById('loginSubmitBtn');

            let hasError = false;
            if (!username) {
                setFieldError('loginUsername', 'loginUsernameError', 'Username is required');
                hasError = true;
            }
            if (!password) {
                setFieldError('loginPassword', 'loginPasswordError', 'Password is required');
                hasError = true;
            }
            if (hasError) return;

            // Show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-sm"></span> Signing In...';
            }

            // Small delay for smooth UI feedback
            setTimeout(() => {
                const result = window.SalesSyncAuth.login(username, password);

                if (result.success) {
                    if (rememberMe) {
                        window.SalesSyncAuth.remember(result.user);
                    } else {
                        window.SalesSyncAuth.forgetRemember();
                    }

                    showAlert('Login successful! Redirecting to dashboard...', 'success');
                    if (submitBtn) {
                        submitBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
                    }

                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500);
                } else {
                    showAlert(result.message || 'Invalid username or password.', 'error');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                    }
                }
            }, 400);
        });
    }

    // Handle Register Submit
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            hideAlert();
            clearFieldErrors(registerForm);

            const fullName = document.getElementById('regFullName')?.value.trim();
            const username = document.getElementById('regUsername')?.value.trim();
            const password = document.getElementById('regPassword')?.value;
            const confirmPassword = document.getElementById('regConfirmPassword')?.value;
            const submitBtn = document.getElementById('regSubmitBtn');

            let hasError = false;
            if (!fullName) {
                setFieldError('regFullName', 'regFullNameError', 'Full name is required');
                hasError = true;
            }
            if (!username) {
                setFieldError('regUsername', 'regUsernameError', 'Username is required');
                hasError = true;
            } else if (username.length < 3) {
                setFieldError('regUsername', 'regUsernameError', 'Minimum 3 characters');
                hasError = true;
            }

            if (!password) {
                setFieldError('regPassword', 'regPasswordError', 'Password is required');
                hasError = true;
            } else if (password.length < 6) {
                setFieldError('regPassword', 'regPasswordError', 'Minimum 6 characters');
                hasError = true;
            }

            if (password !== confirmPassword) {
                setFieldError('regConfirmPassword', 'regConfirmPasswordError', 'Passwords do not match');
                hasError = true;
            }

            if (hasError) return;

            // Show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-sm"></span> Creating Account...';
            }

            setTimeout(() => {
                const result = window.SalesSyncAuth.register(username, password, fullName);

                if (result.success) {
                    // Switch back to login view
                    if (registerSection) registerSection.style.display = 'none';
                    if (loginSection) loginSection.style.display = 'block';
                    if (cardTitle) cardTitle.textContent = 'SalesSync Portal';
                    if (cardSubtitle) cardSubtitle.textContent = 'Sign in to access your real-time analytics';

                    showAlert(result.message, 'success');

                    // Pre-fill login username
                    const loginUserInput = document.getElementById('loginUsername');
                    if (loginUserInput) {
                        loginUserInput.value = username;
                        document.getElementById('loginPassword')?.focus();
                    }
                } else {
                    showAlert(result.message, 'error');
                }

                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
                }
            }, 400);
        });
    }
});
