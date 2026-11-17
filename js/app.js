/**
 * AL AKSEER ABBASI - DRY FRUITS
 * Storefront Application Logic
 */

const App = {
    products: [],
    settings: {},
    activeCategory: 'All',
    searchQuery: '',
    sortBy: 'featured',
    selectedWeights: {}, // Map of productId -> { label, multiplier }

    init: function() {
        this.loadSettings();
        this.loadProducts();
        this.setupNavigation();
        this.setupFilters();
        this.setupCartDrawer();
        this.setupCheckout();
        this.setupProductModals();
        this.renderCatalog();
        this.updateCartUI();
        this.init3DTiltEffects();

        // Listen for storage changes if admin updates data in another tab
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEYS.PRODUCTS || e.key === STORAGE_KEYS.SETTINGS) {
                this.loadSettings();
                this.loadProducts();
                this.renderCatalog();
            }
        });
    },

    loadSettings: function() {
        this.settings = StoreDB.getSettings();

        // Update announcement bar & contact info in DOM
        const annEl = document.getElementById('announcement-text');
        if (annEl) annEl.textContent = this.settings.announcement;

        const storeNameEls = document.querySelectorAll('.store-name-text');
        storeNameEls.forEach(el => el.textContent = this.settings.storeName);

        const phoneEls = document.querySelectorAll('.store-phone-text');
        phoneEls.forEach(el => {
            el.textContent = this.settings.phone;
            if (el.tagName === 'A') el.href = `tel:${this.settings.phone}`;
        });

        const waEls = document.querySelectorAll('.store-whatsapp-link');
        waEls.forEach(el => {
            el.href = `https://wa.me/${this.settings.whatsapp}?text=${encodeURIComponent('Hello AL AKSEER ABBASI Dry Fruits! I would like to inquire about your fresh stock and free delivery.')}`;
        });
    },

    loadProducts: function() {
        this.products = StoreDB.getProducts();
        // Set default weight for each product (1kg base)
        this.products.forEach(p => {
            if (!this.selectedWeights[p.id]) {
                this.selectedWeights[p.id] = { label: '1kg', multiplier: 1.0 };
            }
        });
    },

    /* ================= FILTERS & CATALOG RENDERING ================= */

    setupFilters: function() {
        // Category pills
        const categoryButtons = document.querySelectorAll('.cat-pill');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeCategory = btn.dataset.category;
                this.renderCatalog();
            });
        });

        // Search bar
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.renderCatalog();
            });
        }

        // Sort selector
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.renderCatalog();
            });
        }
    },

    getFilteredProducts: function() {
        let list = [...this.products];

        // Filter by Category
        if (this.activeCategory && this.activeCategory !== 'All') {
            list = list.filter(p => p.category.toLowerCase().includes(this.activeCategory.toLowerCase()));
        }

        // Filter by Search
        if (this.searchQuery) {
            list = list.filter(p =>
                p.name.toLowerCase().includes(this.searchQuery) ||
                p.description.toLowerCase().includes(this.searchQuery) ||
                p.category.toLowerCase().includes(this.searchQuery)
            );
        }

        // Sort
        switch (this.sortBy) {
            case 'price-low':
                list.sort((a, b) => a.basePrice - b.basePrice);
                break;
            case 'price-high':
                list.sort((a, b) => b.basePrice - a.basePrice);
                break;
            case 'rating':
                list.sort((a, b) => b.rating - a.rating);
                break;
            default:
                // Featured (preserve order)
                break;
        }

        return list;
    },

    renderCatalog: function() {
        const grid = document.getElementById('products-grid');
        if (!grid) return;

        const filtered = this.getFilteredProducts();

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="no-products-found">
                    <div class="empty-icon"><i class="fas fa-search"></i></div>
                    <h3>No Dry Fruits Found</h3>
                    <p>We couldn't find any products matching "${this.searchQuery}". Try selecting another category or clear your search.</p>
                    <button class="btn btn-secondary" onclick="App.resetFilters()">View All Products</button>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(product => {
            const weightObj = this.selectedWeights[product.id] || { label: '1kg', multiplier: 1.0 };
            const currentPrice = Math.round(product.basePrice * weightObj.multiplier);
            const isOutOfStock = product.stock <= 0;

            return `
                <div class="product-card-3d" data-id="${product.id}" data-model="${product.modelType || 'pistachio'}">
                    <div class="card-glass-glow"></div>
                    <div class="card-inner">
                        <div class="card-badge-container">
                            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                            <button class="btn-3d-inspect" title="Inspect in 3D" onclick="App.open3DModal('${product.id}')">
                                <i class="fas fa-cube"></i> 3D View
                            </button>
                        </div>

                        <div class="card-image-wrap" onclick="App.openQuickView('${product.id}')">
                            <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='${StoreDB.getFallbackImage(product.name)}'">
                            <div class="image-overlay-hover">
                                <span class="quick-view-btn"><i class="fas fa-eye"></i> Quick Details</span>
                            </div>
                        </div>

                        <div class="card-content">
                            <span class="product-category">${product.category}</span>
                            <h3 class="product-title" onclick="App.openQuickView('${product.id}')">${product.name}</h3>

                            <div class="product-rating">
                                <div class="stars">
                                    ${this.getRatingStars(product.rating)}
                                </div>
                                <span class="rating-val">${product.rating}</span>
                                <span class="review-count">(${product.reviewsCount})</span>
                            </div>

                            <!-- Weight Selector -->
                            <div class="weight-selector-row">
                                <span class="weight-label">Pack:</span>
                                <div class="weight-pills">
                                    <button class="weight-pill ${weightObj.label === '250g' ? 'active' : ''}" 
                                        onclick="App.changeProductWeight('${product.id}', '250g', 0.25)">250g</button>
                                    <button class="weight-pill ${weightObj.label === '500g' ? 'active' : ''}" 
                                        onclick="App.changeProductWeight('${product.id}', '500g', 0.5)">500g</button>
                                    <button class="weight-pill ${weightObj.label === '1kg' ? 'active' : ''}" 
                                        onclick="App.changeProductWeight('${product.id}', '1kg', 1.0)">1kg</button>
                                </div>
                            </div>

                            <div class="price-action-row">
                                <div class="price-block">
                                    <span class="currency-symbol">${this.settings.currency}</span>
                                    <span class="price-amount" id="price-val-${product.id}">${Number(currentPrice).toLocaleString()}</span>
                                    <span class="pack-size-tag">/ ${weightObj.label}</span>
                                </div>

                                <button class="btn btn-add-cart ${isOutOfStock ? 'disabled' : ''}" 
                                    ${isOutOfStock ? 'disabled' : ''} 
                                    onclick="App.addToCart('${product.id}')">
                                    <i class="fas fa-cart-plus"></i>
                                    <span>${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Rebind 3D tilt effects
        this.init3DTiltEffects();
    },

    changeProductWeight: function(productId, weightLabel, multiplier) {
        this.selectedWeights[productId] = { label: weightLabel, multiplier: multiplier };
        const product = StoreDB.getProductById(productId);
        if (product) {
            const newPrice = Math.round(product.basePrice * multiplier);
            const priceEl = document.getElementById(`price-val-${productId}`);
            if (priceEl) {
                priceEl.textContent = Number(newPrice).toLocaleString();
                priceEl.parentElement.classList.add('price-bounce');
                setTimeout(() => priceEl.parentElement.classList.remove('price-bounce'), 400);
            }
            // Update active pill button
            const card = document.querySelector(`.product-card-3d[data-id="${productId}"]`);
            if (card) {
                card.querySelectorAll('.weight-pill').forEach(pill => {
                    pill.classList.toggle('active', pill.textContent.trim() === weightLabel);
                });
                const packTag = card.querySelector('.pack-size-tag');
                if (packTag) packTag.textContent = `/ ${weightLabel}`;
            }
        }
    },

    getRatingStars: function(rating) {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else if (rating >= i - 0.5) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        return starsHtml;
    },

    resetFilters: function() {
        this.activeCategory = 'All';
        this.searchQuery = '';
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        document.querySelectorAll('.cat-pill').forEach(b => {
            b.classList.toggle('active', b.dataset.category === 'All');
        });
        this.renderCatalog();
    },

    /* ================= 3D TILT EFFECT ON CARDS ================= */

    init3DTiltEffects: function() {
        const cards = document.querySelectorAll('.product-card-3d');
        cards.forEach(card => {
            const inner = card.querySelector('.card-inner');
            const glow = card.querySelector('.card-glass-glow');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -12;
                const rotateY = ((x - centerX) / centerX) * 12;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

                if (glow) {
                    glow.style.opacity = '1';
                    glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(212, 175, 55, 0.2), transparent 70%)`;
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                if (glow) glow.style.opacity = '0';
            });
        });
    },

    /* ================= SHOPPING CART LOGIC ================= */

    setupCartDrawer: function() {
        const openBtn = document.getElementById('cart-toggle-btn');
        const closeBtn = document.getElementById('cart-close-btn');
        const backdrop = document.getElementById('cart-backdrop');
        const drawer = document.getElementById('cart-drawer');

        if (openBtn) openBtn.addEventListener('click', () => this.openCart());
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeCart());
        if (backdrop) backdrop.addEventListener('click', () => this.closeCart());
    },

    openCart: function() {
        const drawer = document.getElementById('cart-drawer');
        const backdrop = document.getElementById('cart-backdrop');
        if (drawer) drawer.classList.add('open');
        if (backdrop) backdrop.classList.add('open');
        this.renderCartItems();
    },

    closeCart: function() {
        const drawer = document.getElementById('cart-drawer');
        const backdrop = document.getElementById('cart-backdrop');
        if (drawer) drawer.classList.remove('open');
        if (backdrop) backdrop.classList.remove('open');
    },

    addToCart: function(productId, customWeight = null, customQty = 1) {
        const product = StoreDB.getProductById(productId);
        if (!product) return;

        const weightObj = customWeight || this.selectedWeights[productId] || { label: '500g', multiplier: 1.0 };
        const unitPrice = Math.round(product.basePrice * weightObj.multiplier);
        const cart = StoreDB.getCart();

        // Check if item with same productId and weight exists
        const existingIdx = cart.findIndex(item => item.productId === productId && item.weight === weightObj.label);

        if (existingIdx !== -1) {
            cart[existingIdx].quantity += customQty;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                image: product.image,
                category: product.category,
                weight: weightObj.label,
                unitPrice: unitPrice,
                quantity: customQty
            });
        }

        StoreDB.saveCart(cart);
        this.updateCartUI();
        this.showToast(`✨ Added ${product.name} (${weightObj.label}) to cart!`);

        // Bounce cart button in navbar
        const cartBtn = document.getElementById('cart-toggle-btn');
        if (cartBtn) {
            cartBtn.classList.add('cart-pulse');
            setTimeout(() => cartBtn.classList.remove('cart-pulse'), 500);
        }
    },

    updateCartQuantity: function(index, delta) {
        const cart = StoreDB.getCart();
        if (cart[index]) {
            cart[index].quantity += delta;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            StoreDB.saveCart(cart);
            this.updateCartUI();
            this.renderCartItems();
        }
    },

    removeCartItem: function(index) {
        const cart = StoreDB.getCart();
        if (cart[index]) {
            const removed = cart.splice(index, 1);
            StoreDB.saveCart(cart);
            this.updateCartUI();
            this.renderCartItems();
            this.showToast(`Removed ${removed[0].name} from cart`);
        }
    },

    updateCartUI: function() {
        const cart = StoreDB.getCart();
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

        const badgeEls = document.querySelectorAll('.cart-count-badge');
        badgeEls.forEach(el => {
            el.textContent = totalCount;
            el.style.display = totalCount > 0 ? 'inline-flex' : 'none';
        });
    },

    renderCartItems: function() {
        const listEl = document.getElementById('cart-items-list');
        const emptyEl = document.getElementById('cart-empty-view');
        const footerEl = document.getElementById('cart-footer-view');
        if (!listEl) return;

        const cart = StoreDB.getCart();

        if (cart.length === 0) {
            listEl.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'block';
            if (footerEl) footerEl.style.display = 'none';
            return;
        }

        if (emptyEl) emptyEl.style.display = 'none';
        if (footerEl) footerEl.style.display = 'block';

        listEl.innerHTML = cart.map((item, idx) => `
            <div class="cart-item-row">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='${StoreDB.getFallbackImage(item.name)}'">
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <span class="cart-item-weight"><i class="fas fa-weight-hanging"></i> ${item.weight}</span>
                    <div class="cart-item-price-calc">
                        ${this.settings.currency} ${Number(item.unitPrice).toLocaleString()} × ${item.quantity} = 
                        <strong>${this.settings.currency} ${Number(item.unitPrice * item.quantity).toLocaleString()}</strong>
                    </div>
                    <div class="cart-item-qty-controls">
                        <button class="qty-btn" onclick="App.updateCartQuantity(${idx}, -1)">-</button>
                        <span class="qty-number">${item.quantity}</span>
                        <button class="qty-btn" onclick="App.updateCartQuantity(${idx}, 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove-btn" title="Remove Item" onclick="App.removeCartItem(${idx})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `).join('');

        // Calculate Totals & Free Delivery Bar
        const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        const deliveryThreshold = this.settings.freeDeliveryThreshold || 3500;
        const baseDelivery = this.settings.deliveryFee || 250;
        const isFreeDelivery = subtotal >= deliveryThreshold;
        const deliveryFee = isFreeDelivery ? 0 : baseDelivery;
        const grandTotal = subtotal + deliveryFee;

        // Subtotal elements
        const subtotalEl = document.getElementById('cart-subtotal-val');
        if (subtotalEl) subtotalEl.textContent = `${this.settings.currency} ${Number(subtotal).toLocaleString()}`;

        const deliveryEl = document.getElementById('cart-delivery-val');
        if (deliveryEl) {
            deliveryEl.innerHTML = isFreeDelivery 
                ? '<span class="free-shipping-badge">FREE (Promo)</span>' 
                : `${this.settings.currency} ${Number(deliveryFee).toLocaleString()}`;
        }

        const totalEl = document.getElementById('cart-grand-total-val');
        if (totalEl) totalEl.textContent = `${this.settings.currency} ${Number(grandTotal).toLocaleString()}`;

        // Free Delivery Progress Bar
        const progBar = document.getElementById('free-shipping-progress');
        const progText = document.getElementById('free-shipping-text');
        if (progBar && progText) {
            if (isFreeDelivery) {
                progBar.style.width = '100%';
                progBar.classList.add('unlocked');
                progText.innerHTML = `🎉 Congratulations! You have unlocked <strong>FREE Express Delivery</strong>!`;
            } else {
                const diff = deliveryThreshold - subtotal;
                const pct = Math.min(100, Math.round((subtotal / deliveryThreshold) * 100));
                progBar.style.width = `${pct}%`;
                progBar.classList.remove('unlocked');
                progText.innerHTML = `Add <strong>${this.settings.currency} ${Number(diff).toLocaleString()}</strong> more to enjoy FREE delivery!`;
            }
        }
    },

    /* ================= CHECKOUT & WHATSAPP ================= */

    setupCheckout: function() {
        const checkoutBtn = document.getElementById('cart-checkout-btn');
        const checkoutModal = document.getElementById('checkout-modal');
        const closeCheckoutBtn = document.getElementById('close-checkout-btn');
        const checkoutForm = document.getElementById('checkout-form');
        const waDirectBtn = document.getElementById('checkout-whatsapp-btn');

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                const cart = StoreDB.getCart();
                if (cart.length === 0) {
                    this.showToast("Your cart is empty. Please add items first.");
                    return;
                }
                this.closeCart();
                this.openCheckoutModal();
            });
        }

        if (closeCheckoutBtn) {
            closeCheckoutBtn.addEventListener('click', () => this.closeCheckoutModal());
        }

        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processStandardOrder();
            });
        }

        if (waDirectBtn) {
            waDirectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.processWhatsAppOrder();
            });
        }
    },

    openCheckoutModal: function() {
        const modal = document.getElementById('checkout-modal');
        if (!modal) return;

        const cart = StoreDB.getCart();
        const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        const isFree = subtotal >= this.settings.freeDeliveryThreshold;
        const shipping = isFree ? 0 : this.settings.deliveryFee;
        const total = subtotal + shipping;

        // Render summary in checkout
        const summaryEl = document.getElementById('checkout-order-summary');
        if (summaryEl) {
            summaryEl.innerHTML = `
                <div class="summary-items">
                    ${cart.map(i => `
                        <div class="summary-row">
                            <span>${i.name} (${i.weight}) × ${i.quantity}</span>
                            <strong>${this.settings.currency} ${Number(i.unitPrice * i.quantity).toLocaleString()}</strong>
                        </div>
                    `).join('')}
                </div>
                <div class="summary-divider"></div>
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>${this.settings.currency} ${Number(subtotal).toLocaleString()}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping</span>
                    <span>${shipping === 0 ? 'FREE' : `${this.settings.currency} ${shipping}`}</span>
                </div>
                <div class="summary-row total-highlight">
                    <span>Grand Total:</span>
                    <span>${this.settings.currency} ${Number(total).toLocaleString()}</span>
                </div>
            `;
        }

        modal.classList.add('open');
    },

    closeCheckoutModal: function() {
        const modal = document.getElementById('checkout-modal');
        if (modal) modal.classList.remove('open');
    },

    processStandardOrder: function() {
        const form = document.getElementById('checkout-form');
        const name = document.getElementById('cust-name').value.trim();
        const phone = document.getElementById('cust-phone').value.trim();
        const city = document.getElementById('cust-city').value.trim();
        const address = document.getElementById('cust-address').value.trim();
        const notes = document.getElementById('cust-notes').value.trim();
        const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'Cash on Delivery';

        if (!name || !phone || !address) {
            this.showToast("Please fill in all required customer details.");
            return;
        }

        const cart = StoreDB.getCart();
        const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        const shipping = subtotal >= this.settings.freeDeliveryThreshold ? 0 : this.settings.deliveryFee;
        const total = subtotal + shipping;

        const newOrder = StoreDB.addOrder({
            customerName: name,
            phone: phone,
            city: city,
            address: address,
            notes: notes,
            paymentMethod: paymentMethod,
            subtotal: subtotal,
            deliveryFee: shipping,
            total: total,
            items: cart.map(item => ({
                name: `${item.name} (${item.weight})`,
                quantity: item.quantity,
                price: item.unitPrice
            }))
        });

        // Clear cart
        StoreDB.clearCart();
        this.updateCartUI();
        this.closeCheckoutModal();
        if (form) form.reset();

        // Show Confirmation Modal
        this.showOrderConfirmation(newOrder);
    },

    processWhatsAppOrder: function() {
        const name = document.getElementById('cust-name').value.trim() || 'Valued Customer';
        const phone = document.getElementById('cust-phone').value.trim() || 'N/A';
        const city = document.getElementById('cust-city').value.trim() || 'N/A';
        const address = document.getElementById('cust-address').value.trim() || 'Address to be confirmed on WhatsApp';

        const cart = StoreDB.getCart();
        if (cart.length === 0) return;

        const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        const shipping = subtotal >= this.settings.freeDeliveryThreshold ? 0 : this.settings.deliveryFee;
        const total = subtotal + shipping;

        let message = `*Assalam-o-Alaikum AL AKSEER ABBASI Dry Fruits!* 🌿\n\n`;
        message += `I would like to place an order from your website:\n\n`;
        cart.forEach((item, index) => {
            message += `${index + 1}. *${item.name}* (${item.weight})\n   Qty: ${item.quantity} × ${this.settings.currency} ${item.unitPrice} = ${this.settings.currency} ${item.unitPrice * item.quantity}\n`;
        });
        message += `\n-----------------------\n`;
        message += `*Subtotal:* ${this.settings.currency} ${subtotal}\n`;
        message += `*Delivery:* ${shipping === 0 ? 'FREE' : `${this.settings.currency} ${shipping}`}\n`;
        message += `*TOTAL BILL:* ${this.settings.currency} ${total}\n`;
        message += `-----------------------\n\n`;
        message += `*Customer Details:*\n`;
        message += `• Name: ${name}\n`;
        message += `• Phone: ${phone}\n`;
        message += `• City: ${city}\n`;
        message += `• Address: ${address}\n\n`;
        message += `Please confirm my order and share delivery schedule. Thank you!`;

        // Record in store database as WhatsApp order
        StoreDB.addOrder({
            customerName: name,
            phone: phone,
            city: city,
            address: address,
            notes: "Direct WhatsApp Order Checkout",
            paymentMethod: "WhatsApp Inquiry / Cash on Delivery",
            subtotal: subtotal,
            deliveryFee: shipping,
            total: total,
            items: cart.map(item => ({
                name: `${item.name} (${item.weight})`,
                quantity: item.quantity,
                price: item.unitPrice
            }))
        });

        // Open WhatsApp
        const waUrl = `https://wa.me/${this.settings.whatsapp}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');

        StoreDB.clearCart();
        this.updateCartUI();
        this.closeCheckoutModal();
        this.showToast("WhatsApp order drafted! Opening WhatsApp now...");
    },

    showOrderConfirmation: function(order) {
        const confirmModal = document.getElementById('order-confirmation-modal');
        if (!confirmModal) return;

        const orderIdEl = document.getElementById('confirm-order-id');
        const orderTotalEl = document.getElementById('confirm-order-total');
        if (orderIdEl) orderIdEl.textContent = `#${order.id}`;
        if (orderTotalEl) orderTotalEl.textContent = StoreDB.formatCurrency(order.total);

        confirmModal.classList.add('open');
    },

    /* ================= 3D QUICK VIEW & PRODUCT MODAL ================= */

    setupProductModals: function() {
        const closeQuickView = document.getElementById('close-quickview-btn');
        if (closeQuickView) {
            closeQuickView.addEventListener('click', () => {
                const modal = document.getElementById('quickview-modal');
                if (modal) modal.classList.remove('open');
            });
        }

        const close3DModal = document.getElementById('close-3d-modal-btn');
        if (close3DModal) {
            close3DModal.addEventListener('click', () => {
                const modal = document.getElementById('product-3d-modal');
                if (modal) modal.classList.remove('open');
                DryFruit3D.closeModal3D();
            });
        }

        const closeConfirmModal = document.getElementById('close-confirm-btn');
        if (closeConfirmModal) {
            closeConfirmModal.addEventListener('click', () => {
                const modal = document.getElementById('order-confirmation-modal');
                if (modal) modal.classList.remove('open');
            });
        }
    },

    openQuickView: function(productId) {
        const product = StoreDB.getProductById(productId);
        if (!product) return;

        const modal = document.getElementById('quickview-modal');
        if (!modal) return;

        const imgEl = document.getElementById('qv-product-image');
        const titleEl = document.getElementById('qv-product-title');
        const catEl = document.getElementById('qv-product-category');
        const descEl = document.getElementById('qv-product-desc');
        const priceEl = document.getElementById('qv-product-price');
        const stockEl = document.getElementById('qv-product-stock');
        const inspectBtn = document.getElementById('qv-inspect-3d-btn');

        if (imgEl) {
            imgEl.src = product.image;
            imgEl.onerror = () => { imgEl.src = StoreDB.getFallbackImage(product.name); };
        }
        if (titleEl) titleEl.textContent = product.name;
        if (catEl) catEl.textContent = product.category;
        if (descEl) descEl.textContent = product.description;
        if (priceEl) priceEl.textContent = StoreDB.formatCurrency(product.basePrice);
        if (stockEl) {
            stockEl.innerHTML = product.stock > 0 
                ? `<span class="badge in-stock"><i class="fas fa-check-circle"></i> In Stock (${product.stock} packs left)</span>`
                : `<span class="badge out-of-stock"><i class="fas fa-times-circle"></i> Sold Out</span>`;
        }

        if (inspectBtn) {
            inspectBtn.onclick = () => {
                modal.classList.remove('open');
                this.open3DModal(productId);
            };
        }

        const addBtn = document.getElementById('qv-add-cart-btn');
        if (addBtn) {
            addBtn.onclick = () => {
                const qtyInput = document.getElementById('qv-quantity-input');
                const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
                this.addToCart(productId, { label: '1kg', multiplier: 1.0 }, qty);
                modal.classList.remove('open');
            };
        }

        modal.classList.add('open');
    },

    open3DModal: function(productId) {
        const product = StoreDB.getProductById(productId);
        if (!product) return;

        const modal = document.getElementById('product-3d-modal');
        if (!modal) return;

        const titleEl = document.getElementById('modal-3d-title');
        const descEl = document.getElementById('modal-3d-desc');
        const priceEl = document.getElementById('modal-3d-price');
        const addBtn = document.getElementById('modal-3d-add-cart-btn');

        if (titleEl) titleEl.textContent = product.name;
        if (descEl) descEl.textContent = product.description;
        if (priceEl) priceEl.textContent = StoreDB.formatCurrency(product.basePrice) + ' (500g)';

        if (addBtn) {
            addBtn.onclick = () => {
                this.addToCart(productId);
                modal.classList.remove('open');
                DryFruit3D.closeModal3D();
            };
        }

        modal.classList.add('open');

        // Launch 3D Mesh in Canvas
        setTimeout(() => {
            DryFruit3D.openModal3D(product.modelType || 'pistachio', product.name);
        }, 80);
    },

    /* ================= NAVIGATION & TOASTS ================= */

    setupNavigation: function() {
        // Smooth scroll for nav anchors
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId && targetId !== '#') {
                    const targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        e.preventDefault();
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        // Mobile menu toggle
        const mobToggle = document.getElementById('mobile-menu-toggle');
        const mobMenu = document.getElementById('nav-links-menu');
        if (mobToggle && mobMenu) {
            mobToggle.addEventListener('click', () => {
                mobMenu.classList.toggle('active');
            });
        }
    },

    showToast: function(message) {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = 'glass-toast';
        toast.innerHTML = `<i class="fas fa-check-circle toast-icon"></i> <span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 20);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3200);
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
