// ─── Products (temporary hardcoded data until backend is connected) ───────────

const products = [
    {
        id: 1,
        name: "Black Oversized Essential Tee",
        price: 35,
        img: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=830&auto=format&fit=crop"
    },
    {
        id: 2,
        name: "White Classic Blank Tee",
        price: 32,
        img: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=774&auto=format&fit=crop"
    },
    {
        id: 3,
        name: "Red Street Heavyweight Tee",
        price: 38,
        img: "https://plus.unsplash.com/premium_photo-1691367279053-ffa6edf80181?w=400&auto=format&fit=crop&q=60"
    },
    {
        id: 4,
        name: "Navy Minimal Blank Tee",
        price: 30,
        img: "https://plus.unsplash.com/premium_photo-1689565524694-88720c282271?w=400&auto=format&fit=crop&q=60"
    },
    {
        id: 5,
        name: "Forest Green Boxy Tee",
        price: 40,
        img: "https://images.unsplash.com/photo-1706550633351-293b55daccf4?w=400&auto=format&fit=crop&q=60"
    },
    {
        id: 6,
        name: "Beige Vintage Washed Tee",
        price: 34,
        img: "https://plus.unsplash.com/premium_photo-1671656349262-1e1d3e09735c?w=400&auto=format&fit=crop&q=60"
    }
];

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
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    showToast(`${product.name} added to cart!`);
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

function getFilteredProducts() {
    const search = (document.getElementById('search-input')?.value || '').toLowerCase();
    const sort   = document.getElementById('sort-select')?.value || '';

    let filtered = products.filter(p =>
        p.name.toLowerCase().includes(search)
    );

    if (sort === 'price_asc')   filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc')  filtered.sort((a, b) => b.price - a.price);

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
        card.innerHTML = `
            <img src="${product.img}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">$${product.price}</p>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
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
        applyBtn.addEventListener('click', () => {
            const code = document.getElementById('discount-input').value.trim().toUpperCase();
            const msg  = document.getElementById('discount-msg');

            // For now, match the test code from the database
            if (code === 'SAVE10') {
                discountPercent = 10;
                localStorage.setItem('discountPercent', discountPercent);
                localStorage.setItem('discountCode', code);
                msg.className   = 'discount-msg success';
                msg.textContent = '10% discount applied!';
            } else {
                discountPercent = 0;
                localStorage.removeItem('discountPercent');
                localStorage.removeItem('discountCode');
                msg.className   = 'discount-msg error';
                msg.textContent = 'Invalid or expired discount code.';
            }
            updateCartSummary();
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            window.location.href = 'checkout.html';
        });
    }
}

// ─── Checkout Card Formatting ─────────────────────────────────────────────────

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

        const res = await fetch('backend/api/login.php', {
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

        const res = await fetch('backend/api/register.php', {
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
    renderProducts('featured-products');
    renderProducts('shop-products');
    renderCart();
    setupCheckout();
    setupLoginForm();
    setupRegisterForm();
    setupShopControls();
    setupCardFormatting();
    updateCartCount();
}

window.onload = init;