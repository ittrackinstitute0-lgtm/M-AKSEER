/**
 * AL AKSEER ABBASI - DRY FRUITS
 * Admin Panel Application Logic
 */

const Admin = {
    isAuthenticated: false,
    currentTab: 'dashboard',
    activeEditingProductId: null,

    init: function() {
        this.checkAuth();
        this.setupAuthHandlers();
        this.setupNavigation();
        this.setupProductCrud();
        this.setupOrderManagement();
        this.setupSettings();

        // Refresh stats & tables if logged in
        if (this.isAuthenticated) {
            this.renderAll();
        }
    },

    /* ================= AUTHENTICATION ================= */

    checkAuth: function() {
        const authStatus = sessionStorage.getItem('aka_admin_authenticated');
        if (authStatus === 'true') {
            this.isAuthenticated = true;
            this.showDashboard();
        } else {
            this.showLoginModal();
        }
    },

    setupAuthHandlers: function() {
        const loginForm = document.getElementById('admin-login-form');
        const loginModal = document.getElementById('admin-login-modal');
        const logoutBtn = document.getElementById('admin-logout-btn');
        const quickLoginBtn = document.getElementById('quick-login-btn');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const pass = document.getElementById('admin-password-input').value;
                if (pass === 'admin123' || pass === 'admin') {
                    this.authenticate();
                } else {
                    this.showError('Invalid Admin Password. (Default demo pass is: admin123)');
                }
            });
        }

        if (quickLoginBtn) {
            quickLoginBtn.addEventListener('click', () => {
                document.getElementById('admin-password-input').value = 'admin123';
                this.authenticate();
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    },

    authenticate: function() {
        this.isAuthenticated = true;
        sessionStorage.setItem('aka_admin_authenticated', 'true');
        const modal = document.getElementById('admin-login-modal');
        if (modal) modal.style.display = 'none';
        this.showToast('✅ Welcome to AL AKSEER ABBASI Admin Dashboard');
        this.showDashboard();
        this.renderAll();
    },

    logout: function() {
        this.isAuthenticated = false;
        sessionStorage.removeItem('aka_admin_authenticated');
        this.showLoginModal();
        this.showToast('Logged out of Admin Panel');
    },

    showLoginModal: function() {
        const modal = document.getElementById('admin-login-modal');
        const appWrapper = document.getElementById('admin-app-wrapper');
        if (modal) modal.style.display = 'flex';
        if (appWrapper) appWrapper.style.display = 'none';
    },

    showDashboard: function() {
        const modal = document.getElementById('admin-login-modal');
        const appWrapper = document.getElementById('admin-app-wrapper');
        if (modal) modal.style.display = 'none';
        if (appWrapper) appWrapper.style.display = 'flex';
    },

    /* ================= TAB NAVIGATION ================= */

    setupNavigation: function() {
        const navItems = document.querySelectorAll('.admin-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.dataset.tab;
                if (!tab) return;

                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                document.querySelectorAll('.admin-tab-content').forEach(section => {
                    section.classList.toggle('active', section.id === `tab-${tab}`);
                });

                this.currentTab = tab;
                if (tab === 'dashboard') this.renderDashboardStats();
                if (tab === 'products') this.renderProductsTable();
                if (tab === 'orders') this.renderOrdersTable();
                if (tab === 'settings') this.renderSettingsForm();
            });
        });
    },

    renderAll: function() {
        this.renderDashboardStats();
        this.renderProductsTable();
        this.renderOrdersTable();
        this.renderSettingsForm();
    },

    /* ================= DASHBOARD METRICS ================= */

    renderDashboardStats: function() {
        const products = StoreDB.getProducts();
        const orders = StoreDB.getOrders();
        const settings = StoreDB.getSettings();

        // Total Revenue (all non-cancelled orders)
        const totalRevenue = orders
            .filter(o => o.status !== 'Cancelled')
            .reduce((sum, o) => sum + (o.total || 0), 0);

        const pendingOrders = orders.filter(o => o.status === 'Pending').length;
        const lowStockProducts = products.filter(p => p.stock <= 15).length;

        // Metric Card Elements
        const revEl = document.getElementById('stat-total-revenue');
        const ordEl = document.getElementById('stat-total-orders');
        const prodEl = document.getElementById('stat-total-products');
        const stockEl = document.getElementById('stat-low-stock');

        if (revEl) revEl.textContent = StoreDB.formatCurrency(totalRevenue);
        if (ordEl) ordEl.innerHTML = `${orders.length} <span class="badge badge-warning">${pendingOrders} Pending</span>`;
        if (prodEl) prodEl.textContent = `${products.length} Items`;
        if (stockEl) stockEl.innerHTML = `${lowStockProducts} <span class="badge ${lowStockProducts > 0 ? 'badge-danger' : 'badge-success'}">${lowStockProducts > 0 ? 'Action Needed' : 'Healthy'}</span>`;

        // Render Recent Orders in Dashboard view
        const recentOrdersTable = document.getElementById('dashboard-recent-orders');
        if (recentOrdersTable) {
            const recent = orders.slice(0, 5);
            recentOrdersTable.innerHTML = recent.map(o => `
                <tr>
                    <td><strong>#${o.id}</strong></td>
                    <td>${o.customerName}</td>
                    <td>${o.date}</td>
                    <td>${StoreDB.formatCurrency(o.total)}</td>
                    <td><span class="status-pill status-${o.status.toLowerCase()}">${o.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="Admin.openOrderDetails('${o.id}')">View</button>
                    </td>
                </tr>
            `).join('');
        }
    },

    /* ================= PRODUCT CRUD ================= */

    setupProductCrud: function() {
        const addBtn = document.getElementById('add-product-btn');
        const modal = document.getElementById('product-modal');
        const closeBtn = document.getElementById('close-product-modal-btn');
        const form = document.getElementById('product-form');
        const imgInput = document.getElementById('prod-img-input');
        const imgPreview = document.getElementById('prod-img-preview');
        const searchInput = document.getElementById('admin-prod-search');

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.activeEditingProductId = null;
                document.getElementById('product-modal-title').textContent = 'Add New Dry Fruit Product';
                form.reset();
                if (imgPreview) imgPreview.src = 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80';
                modal.classList.add('open');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('open');
            });
        }

        if (imgInput && imgPreview) {
            imgInput.addEventListener('input', (e) => {
                const url = e.target.value.trim();
                imgPreview.src = url || StoreDB.getFallbackImage('Preview');
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.renderProductsTable(e.target.value.toLowerCase().trim());
            });
        }
    },

    renderProductsTable: function(filter = '') {
        const tableBody = document.getElementById('admin-products-table-body');
        if (!tableBody) return;

        let products = StoreDB.getProducts();

        if (filter) {
            products = products.filter(p =>
                p.name.toLowerCase().includes(filter) ||
                p.category.toLowerCase().includes(filter)
            );
        }

        tableBody.innerHTML = products.map(p => `
            <tr>
                <td>
                    <img src="${p.image}" alt="${p.name}" class="table-thumb" onerror="this.src='${StoreDB.getFallbackImage(p.name)}'">
                </td>
                <td>
                    <strong>${p.name}</strong>
                    <div class="table-subtext">${p.description ? p.description.substring(0, 48) + '...' : ''}</div>
                </td>
                <td><span class="category-tag">${p.category}</span></td>
                <td><strong>${StoreDB.formatCurrency(p.basePrice)}</strong> <span class="text-muted">/ 500g</span></td>
                <td>
                    <span class="stock-indicator ${p.stock <= 10 ? 'stock-critical' : 'stock-ok'}">
                        ${p.stock} units
                    </span>
                </td>
                <td><span class="badge badge-gold">${p.modelType || 'pistachio'} 3D</span></td>
                <td>
                    <div class="action-buttons-group">
                        <button class="btn btn-sm btn-icon" title="Edit Product" onclick="Admin.editProduct('${p.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-icon text-danger" title="Delete Product" onclick="Admin.deleteProduct('${p.id}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    editProduct: function(productId) {
        const product = StoreDB.getProductById(productId);
        if (!product) return;

        this.activeEditingProductId = productId;
        const modal = document.getElementById('product-modal');
        document.getElementById('product-modal-title').textContent = 'Edit Dry Fruit Product';

        document.getElementById('prod-name-input').value = product.name;
        document.getElementById('prod-cat-input').value = product.category;
        document.getElementById('prod-price-input').value = product.basePrice;
        document.getElementById('prod-stock-input').value = product.stock;
        document.getElementById('prod-model-input').value = product.modelType || 'pistachio';
        document.getElementById('prod-badge-input').value = product.badge || '';
        document.getElementById('prod-img-input').value = product.image;
        document.getElementById('prod-desc-input').value = product.description;

        const imgPreview = document.getElementById('prod-img-preview');
        if (imgPreview) imgPreview.src = product.image;

        modal.classList.add('open');
    },

    saveProduct: function() {
        const name = document.getElementById('prod-name-input').value.trim();
        const category = document.getElementById('prod-cat-input').value;
        const basePrice = parseFloat(document.getElementById('prod-price-input').value) || 0;
        const stock = parseInt(document.getElementById('prod-stock-input').value) || 0;
        const modelType = document.getElementById('prod-model-input').value;
        const badge = document.getElementById('prod-badge-input').value.trim();
        const image = document.getElementById('prod-img-input').value.trim() || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80';
        const description = document.getElementById('prod-desc-input').value.trim();

        if (!name || basePrice <= 0) {
            this.showError('Please enter a valid product name and price.');
            return;
        }

        const data = {
            name,
            category,
            basePrice,
            stock,
            modelType,
            badge,
            image,
            description
        };

        if (this.activeEditingProductId) {
            StoreDB.updateProduct(this.activeEditingProductId, data);
            this.showToast('Product updated successfully!');
        } else {
            StoreDB.addProduct(data);
            this.showToast('New dry fruit product added to shop!');
        }

        const modal = document.getElementById('product-modal');
        if (modal) modal.classList.remove('open');

        this.renderProductsTable();
        this.renderDashboardStats();
    },

    deleteProduct: function(productId) {
        const product = StoreDB.getProductById(productId);
        if (!product) return;

        if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
            StoreDB.deleteProduct(productId);
            this.showToast('Product deleted from inventory');
            this.renderProductsTable();
            this.renderDashboardStats();
        }
    },

    /* ================= ORDER MANAGEMENT ================= */

    setupOrderManagement: function() {
        const closeBtn = document.getElementById('close-order-details-btn');
        const modal = document.getElementById('order-details-modal');
        const filterSelect = document.getElementById('admin-order-filter');

        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => modal.classList.remove('open'));
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.renderOrdersTable(e.target.value);
            });
        }
    },

    renderOrdersTable: function(statusFilter = 'All') {
        const tableBody = document.getElementById('admin-orders-table-body');
        if (!tableBody) return;

        let orders = StoreDB.getOrders();

        if (statusFilter && statusFilter !== 'All') {
            orders = orders.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase());
        }

        if (orders.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4">No orders found.</td></tr>`;
            return;
        }

        tableBody.innerHTML = orders.map(o => `
            <tr>
                <td><strong>#${o.id}</strong></td>
                <td>
                    <div class="cust-name-cell">${o.customerName}</div>
                    <div class="table-subtext"><i class="fas fa-phone-alt"></i> ${o.phone}</div>
                </td>
                <td>${o.date}</td>
                <td>
                    <div class="order-items-snippet">${o.items ? o.items.length : 0} item(s)</div>
                    <div class="table-subtext">${o.city || 'Pakistan'}</div>
                </td>
                <td><strong>${StoreDB.formatCurrency(o.total)}</strong></td>
                <td>
                    <select class="status-select status-${o.status.toLowerCase()}" onchange="Admin.updateStatus('${o.id}', this.value)">
                        <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>
                    <div class="action-buttons-group">
                        <button class="btn btn-sm btn-icon" title="View Order Details" onclick="Admin.openOrderDetails('${o.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-icon text-danger" title="Delete Order" onclick="Admin.deleteOrder('${o.id}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    updateStatus: function(orderId, newStatus) {
        StoreDB.updateOrderStatus(orderId, newStatus);
        this.showToast(`Order #${orderId} marked as ${newStatus}`);
        this.renderDashboardStats();
    },

    deleteOrder: function(orderId) {
        if (confirm(`Are you sure you want to permanently delete Order #${orderId}?`)) {
            StoreDB.deleteOrder(orderId);
            this.showToast(`Order #${orderId} deleted.`);
            this.renderOrdersTable();
            this.renderDashboardStats();
        }
    },

    openOrderDetails: function(orderId) {
        const orders = StoreDB.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const modal = document.getElementById('order-details-modal');
        if (!modal) return;

        document.getElementById('modal-order-id').textContent = `#${order.id}`;
        document.getElementById('modal-order-date').textContent = order.date;
        document.getElementById('modal-order-status-badge').innerHTML = `<span class="status-pill status-${order.status.toLowerCase()}">${order.status}</span>`;

        document.getElementById('modal-cust-name').textContent = order.customerName;
        document.getElementById('modal-cust-phone').textContent = order.phone;
        document.getElementById('modal-cust-email').textContent = order.email || 'N/A';
        document.getElementById('modal-cust-address').textContent = order.address || 'N/A';
        document.getElementById('modal-order-notes').textContent = order.notes || 'None';
        document.getElementById('modal-payment-method').textContent = order.paymentMethod || 'Cash on Delivery';

        // Items Breakdown
        const itemsListEl = document.getElementById('modal-order-items-list');
        if (itemsListEl && order.items) {
            itemsListEl.innerHTML = order.items.map(item => `
                <div class="modal-order-item-row">
                    <span>${item.name} × ${item.quantity}</span>
                    <strong>${StoreDB.formatCurrency(item.price * item.quantity)}</strong>
                </div>
            `).join('');
        }

        document.getElementById('modal-order-subtotal').textContent = StoreDB.formatCurrency(order.subtotal || order.total);
        document.getElementById('modal-order-shipping').textContent = order.deliveryFee === 0 ? 'FREE' : StoreDB.formatCurrency(order.deliveryFee);
        document.getElementById('modal-order-total').textContent = StoreDB.formatCurrency(order.total);

        // WhatsApp Customer Contact Button
        const waContactBtn = document.getElementById('modal-cust-whatsapp-btn');
        if (waContactBtn) {
            const cleanPhone = order.phone.replace(/[^0-9]/g, '');
            const msg = `Hello ${order.customerName}, regarding your AL AKSEER ABBASI dry fruits order #${order.id}...`;
            waContactBtn.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
        }

        modal.classList.add('open');
    },

    /* ================= SETTINGS ================= */

    setupSettings: function() {
        const form = document.getElementById('settings-form');
        const resetBtn = document.getElementById('reset-demo-data-btn');
        const exportBtn = document.getElementById('export-data-btn');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to restore default mock products and sample orders? Any custom changes will be reset.')) {
                    StoreDB.resetToFactoryDefaults();
                    this.showToast('✅ Restored default shop data successfully!');
                    this.renderAll();
                }
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportJsonBackup();
            });
        }
    },

    renderSettingsForm: function() {
        const s = StoreDB.getSettings();
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        };

        setVal('setting-store-name', s.storeName);
        setVal('setting-tagline', s.tagline);
        setVal('setting-phone', s.phone);
        setVal('setting-whatsapp', s.whatsapp);
        setVal('setting-currency', s.currency);
        setVal('setting-free-delivery', s.freeDeliveryThreshold);
        setVal('setting-delivery-fee', s.deliveryFee);
        setVal('setting-address', s.address);
        setVal('setting-announcement', s.announcement);
        setVal('setting-worker-url', s.workerUrl || localStorage.getItem('al_akseer_worker_url') || '');
    },

    saveSettings: function() {
        const getVal = (id) => document.getElementById(id)?.value?.trim() || '';

        const workerUrlVal = getVal('setting-worker-url');
        if (workerUrlVal) {
            localStorage.setItem('al_akseer_worker_url', workerUrlVal);
        }

        const updatedSettings = {
            storeName: getVal('setting-store-name') || 'AL AKSEER ABBASI',
            tagline: getVal('setting-tagline'),
            phone: getVal('setting-phone'),
            whatsapp: getVal('setting-whatsapp'),
            currency: getVal('setting-currency') || 'Rs.',
            freeDeliveryThreshold: parseFloat(getVal('setting-free-delivery')) || 0,
            deliveryFee: parseFloat(getVal('setting-delivery-fee')) || 0,
            address: getVal('setting-address'),
            announcement: getVal('setting-announcement'),
            workerUrl: workerUrlVal
        };

        StoreDB.saveSettings(updatedSettings);
        this.showToast('✅ Store settings saved successfully!');
        this.renderDashboardStats();
    },

    exportJsonBackup: function() {
        const backup = {
            products: StoreDB.getProducts(),
            orders: StoreDB.getOrders(),
            settings: StoreDB.getSettings(),
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Al_Akseer_Abbasi_Backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Backup file downloaded.');
    },

    /* ================= UTILITIES ================= */

    showToast: function(message) {
        let toastContainer = document.getElementById('admin-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'admin-toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = 'glass-toast admin-toast';
        toast.innerHTML = `<span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 20);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3200);
    },

    showError: function(message) {
        this.showToast(`⚠️ ${message}`);
    }
};

// Initialize Admin
document.addEventListener('DOMContentLoaded', () => {
    Admin.init();
});
