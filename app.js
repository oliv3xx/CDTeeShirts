// ─── Products (fetched from database) ────────────────────────────────────────

let products = [];

async function loadProducts() {
    try {
        const res  = await fetch('products.php');
        products   = await res.json();
        renderProducts('featured-products');
        renderProducts('shop-products');
    } catch (err) {
        console.error('Could not load products:', err);
    }
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

let cart = [];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) cart = JSON.parse(savedCart);
    updateCartCount();
}

function addToCart(productId) {
    const product = products.find(p => (p.id || p.item_id) == productId);
    if (!product) return;

    const id    = product.id || product.item_id;
    const name  = product.name || product.item_name;
    const price = parseFloat(product.price);
    const img   = product.img || product.image_url;

    const existing = cart.find(item => item.id == id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price, img, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    showToast(`${name} added to cart!`);
}

function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function updateCartCount() {
    const countElements = document.querySelectorAll('#cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countElements.forEach(el => el.textContent = totalItems);
}

// ─── Products Grid ────────────────────────────────────────────────────────────

function getEffectivePrice(p) {
    return (p.is_on_sale == 1 && p.sale_price) ? parseFloat(p.sale_price) : parseFloat(p.price);
}

function getFilteredProducts() {
    const search = (document.getElementById('search-input')?.value || '').toLowerCase();
    const sort   = document.getElementById('sort-select')?.value || '';

    let filtered = products.filter(p =>
        (p.name || p.item_name || '').toLowerCase().includes(search) ||
        (p.description || '').toLowerCase().includes(search)
    );

    if (sort === 'price_asc')    filtered.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    if (sort === 'price_desc')   filtered.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    if (sort === 'availability') filtered.sort((a, b) => parseInt(b.quantity_available) - parseInt(a.quantity_available));

    return filtered;
}

function renderProducts(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const list = containerId === 'shop-products' ? getFilteredProducts() : products;

    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<p style="color:#666; text-align:center; grid-column:1/-1;">No products found.</p>';
        return;
    }

    list.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        const stockColor = product.quantity_available > 10 ? '#27ae60' : product.quantity_available > 0 ? '#e67e22' : '#c0392b';
        const stockText = product.quantity_available > 0 ? `${product.quantity_available} in stock` : 'Out of stock';
        const isOnSale = product.is_on_sale == 1 && product.sale_price;
        const priceDisplay = isOnSale
            ? `<p class="price"><span style="text-decoration:line-through; color:#aaa; font-size:16px;">$${parseFloat(product.price).toFixed(2)}</span> <span style="color:#c0392b;">$${parseFloat(product.sale_price).toFixed(2)}</span></p>`
            : `<p class="price">$${parseFloat(product.price).toFixed(2)}</p>`;

        card.innerHTML = `
            <img src="${product.img || product.image_url}" alt="${product.name || product.item_name}">
            ${isOnSale ? '<div class="sale-badge">SALE</div>' : ''}
            <div class="product-info">
                <h3>${product.name || product.item_name}</h3>
                ${priceDisplay}
                <p class="stock-count" style="font-size:13px; color:${stockColor}; margin-bottom:10px;">${stockText}</p>
                <button class="add-to-cart" data-id="${product.id || product.item_id}" ${product.quantity_available == 0 ? 'disabled' : ''}>
                    ${product.quantity_available > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id'));
            addToCart(id);
        });
    });
}

function setupShopControls() {
    const searchInput = document.getElementById('search-input');
    const sortSelect  = document.getElementById('sort-select');
    if (searchInput) searchInput.addEventListener('input', () => renderProducts('shop-products'));
    if (sortSelect)  sortSelect.addEventListener('change', () => renderProducts('shop-products'));
}

// ─── Cart Page ────────────────────────────────────────────────────────────────

const TAX_RATE = 0.0825;
let discountPercent = 0;

function renderCart() {
    const container = document.getElementById('cart-items');
    const summary   = document.getElementById('cart-summary');
    if (!container) return;

    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p style="color:#666;">Your cart is empty. <a href="shop.html">Go shopping</a></p>';
        if (summary) summary.style.display = 'none';
        return;
    }

    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <button class="qty-btn" data-index="${index}" data-action="minus">−</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" data-index="${index}" data-action="plus">+</button>
                <button class="remove-btn" data-index="${index}">Remove</button>
            </div>
        `;
        container.appendChild(div);
    });

    if (summary) summary.style.display = 'block';
    updateCartSummary();

    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index  = parseInt(btn.getAttribute('data-index'));
            const action = btn.getAttribute('data-action');
            if (action === 'plus') cart[index].quantity += 1;
            else if (action === 'minus' && cart[index].quantity > 1) cart[index].quantity -= 1;
            saveCart();
            renderCart();
            updateCartCount();
        });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            cart.splice(index, 1);
            saveCart();
            renderCart();
            updateCartCount();
        });
    });
}

function updateCartSummary() {
    const subtotal       = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = subtotal * (discountPercent / 100);
    const taxable        = subtotal - discountAmount;
    const tax            = taxable * TAX_RATE;
    const total          = taxable + tax;

    const subtotalEl  = document.getElementById('cart-subtotal');
    const discountEl  = document.getElementById('cart-discount');
    const discountRow = document.getElementById('discount-row');
    const taxEl       = document.getElementById('cart-tax');
    const totalEl     = document.getElementById('cart-total');

    if (subtotalEl)  subtotalEl.textContent  = subtotal.toFixed(2);
    if (taxEl)       taxEl.textContent        = tax.toFixed(2);
    if (totalEl)     totalEl.textContent      = total.toFixed(2);

    if (discountPercent > 0 && discountEl && discountRow) {
        discountEl.textContent    = discountAmount.toFixed(2);
        discountRow.style.display = 'flex';
    } else if (discountRow) {
        discountRow.style.display = 'none';
    }
}

function setupCheckout() {
    const applyBtn   = document.getElementById('apply-discount');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (applyBtn) {
        applyBtn.addEventListener('click', async () => {
            const code = document.getElementById('discount-input').value.trim().toUpperCase();
            const msg  = document.getElementById('discount-msg');
            msg.className = 'discount-msg';
            msg.textContent = 'Checking...';

            try {
                const res  = await fetch(`check_discount.php?code=${encodeURIComponent(code)}`);
                const data = await res.json();

                if (data.success) {
                    discountPercent = parseFloat(data.discount_percentage);
                    localStorage.setItem('discountPercent', discountPercent);
                    localStorage.setItem('discountCode', code);
                    msg.className   = 'discount-msg success';
                    msg.textContent = `${discountPercent}% discount applied!`;
                } else {
                    discountPercent = 0;
                    localStorage.removeItem('discountPercent');
                    localStorage.removeItem('discountCode');
                    msg.className   = 'discount-msg error';
                    msg.textContent = data.error || 'Invalid or expired discount code.';
                }
                updateCartSummary();
            } catch (err) {
                msg.className   = 'discount-msg error';
                msg.textContent = 'Could not validate code. Try again.';
            }
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            window.location.href = 'checkout.html';
        });
    }
}

// ─── Nav User State ───────────────────────────────────────────────────────────

function updateNav() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const loginLink = document.querySelector('a[href="login.html"]');
    if (!loginLink) return;

    if (user) {
        // Hide login link
        loginLink.style.display = 'none';

        // Build dropdown HTML
        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.innerHTML = `
            <div class="user-bubble">
                <span>Hi, ${user.first_name || user.username}</span>
                <span class="user-arrow">▾</span>
            </div>
            <div class="user-menu" id="user-menu">
                ${user.is_admin == 1 ? '<a href="dashboard.html">Admin Dashboard</a>' : ''}
                <a href="#" id="logout-btn">Logout</a>
            </div>
        `;

        loginLink.parentNode.appendChild(dropdown);

        // Toggle dropdown
        dropdown.querySelector('.user-bubble').addEventListener('click', () => {
            dropdown.querySelector('.user-menu').classList.toggle('open');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.querySelector('.user-menu').classList.remove('open');
            }
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }
}

function setupCardFormatting() {
    const cardNumber = document.getElementById('card-number');
    const cardExpiry = document.getElementById('card-expiry');
    const cardCvv    = document.getElementById('card-cvv');

    if (cardNumber) {
        cardNumber.addEventListener('input', function() {
            let val = this.value.replace(/\D/g, '').slice(0, 16);
            this.value = val.match(/.{1,4}/g)?.join(' ') || val;
        });
    }

    if (cardExpiry) {
        cardExpiry.addEventListener('input', function() {
            let val = this.value.replace(/\D/g, '').slice(0, 4);
            if (val.length >= 3) {
                this.value = val.slice(0, 2) + '/' + val.slice(2);
            } else {
                this.value = val;
            }
        });
    }

    if (cardCvv) {
        cardCvv.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 3);
        });
    }
}

function showTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

    if (tab === 'login') {
        document.querySelectorAll('.auth-tab')[0].classList.add('active');
        document.getElementById('login-form').classList.add('active');
    } else {
        document.querySelectorAll('.auth-tab')[1].classList.add('active');
        document.getElementById('register-form').classList.add('active');
    }
}

function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const msg = document.getElementById('login-message');
        msg.className = 'auth-message';
        msg.textContent = 'Logging in...';

        const res = await fetch('login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: document.getElementById('login-username').value,
                password: document.getElementById('login-password').value
            })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data));
            msg.className = 'auth-message success';
            msg.textContent = `Welcome back, ${data.first_name || data.username}!`;
            setTimeout(() => window.location.href = 'index.html', 1000);
        } else {
            msg.className = 'auth-message error';
            msg.textContent = data.error || 'Login failed.';
        }
    });
}

function setupRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const msg = document.getElementById('register-message');
        msg.className = 'auth-message';
        msg.textContent = 'Creating account...';

        const res = await fetch('register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username:   document.getElementById('reg-username').value,
                email:      document.getElementById('reg-email').value,
                password:   document.getElementById('reg-password').value,
                first_name: document.getElementById('reg-firstname').value,
                last_name:  document.getElementById('reg-lastname').value
            })
        });

        const data = await res.json();

        if (data.success) {
            msg.className = 'auth-message success';
            msg.textContent = 'Account created! Switching to login...';
            setTimeout(() => showTab('login'), 1500);
        } else {
            msg.className = 'auth-message error';
            msg.textContent = data.error || 'Registration failed.';
        }
    });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
    loadCart();
    loadProducts();
    renderCart();
    setupCheckout();
    setupLoginForm();
    setupRegisterForm();
    setupShopControls();
    setupCardFormatting();
    updateNav();
    updateCartCount();
}

window.onload = init;