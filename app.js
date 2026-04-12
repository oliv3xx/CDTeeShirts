// Sample Products - Premium Blank Tees (Real High-Quality Images)
const products = [
    {
        id: 1,
        name: "Black Oversized Essential Tee",
        price: 35,
        img: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=830&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"   // Black
    },
    {
        id: 2,
        name: "White Classic Blank Tee",
        price: 32,
        img: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"   // White
    },
    {
        id: 3,
        name: "Red Street Heavyweight Tee",
        price: 38,
        img: "https://plus.unsplash.com/premium_photo-1691367279053-ffa6edf80181?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTd8fFRzaGlydHxlbnwwfHwwfHx8MA%3D%3D"   // Red
    },
    {
        id: 4,
        name: "Navy Minimal Blank Tee",
        price: 30,
        img: "https://plus.unsplash.com/premium_photo-1689565524694-88720c282271?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fG5hdnklMjBibHVlJTIwVHNoaXJ0fGVufDB8fDB8fHww"   // Navy blue
    },
    {
        id: 5,
        name: "Forest Green Boxy Tee",
        price: 40,
        img: "https://images.unsplash.com/photo-1706550633351-293b55daccf4?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTl8fGdyZWVuJTIwVHNoaXJ0fGVufDB8fDB8fHww"   // Green
    },
    {
        id: 6,
        name: "Beige Vintage Washed Tee",
        price: 34,
        img: "https://plus.unsplash.com/premium_photo-1671656349262-1e1d3e09735c?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmVpZ2UlMjBUc2hpcnR8ZW58MHx8MHx8fDA%3D"   // Beige
    }
];

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
    alert(`${product.name} added to cart!`);
}

function updateCartCount() {
    const countElements = document.querySelectorAll('#cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countElements.forEach(el => el.textContent = totalItems);
}

function renderProducts(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    products.forEach(product => {
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

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (!container) return;

    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty. <a href="shop.html">Go shopping</a></p>';
        totalEl.textContent = '0';
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>$${item.price} × ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <button class="qty-btn" data-index="${index}" data-action="minus">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" data-index="${index}" data-action="plus">+</button>
                <button class="remove-btn" data-index="${index}">Remove</button>
            </div>
        `;
        container.appendChild(div);
    });

    totalEl.textContent = total;

    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
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

function setupCheckout() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            alert("Thank you for shopping at Tshirteers! (This is a demo)");
            cart = [];
            saveCart();
            renderCart();
            updateCartCount();
        });
    }
}

function init() {
    loadCart();
    renderProducts('featured-products');
    renderProducts('shop-products');
    renderCart();
    setupCheckout();
    updateCartCount();
}

window.onload = init;