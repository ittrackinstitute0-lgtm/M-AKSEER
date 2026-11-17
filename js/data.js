/**
 * AL AKSEER ABBASI - DRY FRUITS
 * Data Layer & LocalStorage Management
 * 
 * Location: Quetta Road, Jacobabad, Sindh
 * Contact: 03353320944
 * Timings: 6:00 AM - 12:00 AM (Daily: 6.00 to 12.00)
 * Services: 100% Free Delivery
 */

const DEFAULT_SETTINGS = {
    storeName: "AL AKSEER ABBASI",
    tagline: "Royal & Pure Dry Fruits",
    phone: "03353320944",
    whatsapp: "923353320944",
    currency: "Rs.",
    deliveryFee: 0,
    freeDeliveryThreshold: 0,
    address: "Quetta Road, Jacobabad, Sindh, Pakistan",
    email: "info@al-akseer-abbasi.com",
    timings: "6:00 AM - 12:00 AM (Daily: 6.00 to 12.00)",
    announcement: "✨ Free Express Delivery on All Orders | Quetta Road, Jacobabad (Call/WhatsApp: 03353320944) ✨",
    workerUrl: ""
};

const DEFAULT_PRODUCTS = [
    {
        id: "prod-1",
        name: "Royal Irani Pistachio (Pista) Jumbo",
        category: "Pistachios",
        basePrice: 999,
        baseWeight: "1kg",
        stock: 50,
        rating: 4.9,
        reviewsCount: 142,
        badge: "Special Rs. 999/kg",
        modelType: "pistachio",
        image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=700&q=80",
        description: "Naturally opened, jumbo-sized Iranian pistachios roasted with light sea salt. Crispy, buttery texture and rich aroma. Rs. 999 per kg with free delivery."
    },
    {
        id: "prod-2",
        name: "Royal Kashmiri Almonds (Badam Giri)",
        category: "Almonds",
        basePrice: 999,
        baseWeight: "1kg",
        stock: 65,
        rating: 5.0,
        reviewsCount: 210,
        badge: "Special Rs. 999/kg",
        modelType: "almond",
        image: "https://images.unsplash.com/photo-1508061252224-43775270e0a4?auto=format&fit=crop&w=700&q=80",
        description: "100% natural cold-climate Kashmiri almond kernels packed with rich natural almond oil. Supreme brain food & daily wellness booster. Rs. 999 per kg."
    },
    {
        id: "prod-3",
        name: "Supreme White Cashews (Kaju W-240)",
        category: "Cashews",
        basePrice: 999,
        baseWeight: "1kg",
        stock: 45,
        rating: 4.9,
        reviewsCount: 118,
        badge: "Special Rs. 999/kg",
        modelType: "cashew",
        image: "https://images.unsplash.com/photo-1536591375315-1b8368903277?auto=format&fit=crop&w=700&q=80",
        description: "Crispy, whole white king-size cashews. Naturally sweet and rich in heart-healthy unsaturated fats and minerals. Rs. 999 per kg."
    },
    {
        id: "prod-4",
        name: "Kashmiri Snow Walnuts (Akhrot Giri Light)",
        category: "Walnuts",
        basePrice: 999,
        baseWeight: "1kg",
        stock: 50,
        rating: 4.9,
        reviewsCount: 143,
        badge: "Fresh Stock",
        modelType: "walnut",
        image: "https://images.unsplash.com/photo-1557053910-d9eadeed1c58?auto=format&fit=crop&w=700&q=80",
        description: "Light amber, unbroken Kashmiri walnut halves. Never bitter, ultra fresh, abundant in brain-powering Omega-3 fatty acids."
    },
    {
        id: "prod-5",
        name: "Original Madinah Ajwa Dates (Ajwa Khajoor)",
        category: "Dates",
        basePrice: 999,
        baseWeight: "1kg",
        stock: 40,
        rating: 5.0,
        reviewsCount: 310,
        badge: "Holy & Pure",
        modelType: "date",
        image: "https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?auto=format&fit=crop&w=700&q=80",
        description: "Authenticated direct import from Saudi Arabia (Al-Madinah Al-Munawwarah). Soft, rich, fine texture with historic medicinal benefits."
    },
    {
        id: "prod-6",
        name: "Royal Medjool Dates (King of Dates)",
        category: "Dates",
        basePrice: 999,
        baseWeight: "1kg",
        stock: 35,
        rating: 4.9,
        reviewsCount: 88,
        badge: "Premium",
        modelType: "date",
        image: "https://images.unsplash.com/photo-1589135233689-d56715f45853?auto=format&fit=crop&w=700&q=80",
        description: "Jumbo caramel-like texture, naturally luscious and sweet without any added syrup. Ideal for energy boosts and gifting."
    },
    {
        id: "prod-7",
        name: "Turkish Golden Dried Figs (Injeer)",
        category: "Figs & Raisins",
        basePrice: 999,
        baseWeight: "1kg",
        stock: 30,
        rating: 4.8,
        reviewsCount: 75,
        badge: "High Fiber",
        modelType: "fig",
        image: "https://images.unsplash.com/photo-1608797178974-15b35a61dede?auto=format&fit=crop&w=700&q=80",
        description: "Large plump golden figs naturally sun-dried in clean hygienic orchards. Excellent digestive aid and iron source."
    },
    {
        id: "prod-8",
        name: "Wild Roasted Pine Nuts (Chilgoza) With Shell",
        category: "Exotics",
        basePrice: 4800,
        baseWeight: "500g",
        stock: 18,
        rating: 5.0,
        reviewsCount: 64,
        badge: "Luxury Rare",
        modelType: "almond",
        image: "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&w=700&q=80",
        description: "Premium Himalayan wild harvest Chilgoza. Roasty, aromatic, rich natural butter that melts in the mouth."
    },
    {
        id: "prod-9",
        name: "Pure Kashmiri Mongra Saffron (Zafran)",
        category: "Exotics",
        basePrice: 2800,
        baseWeight: "5 Grams",
        stock: 25,
        rating: 5.0,
        reviewsCount: 112,
        badge: "Grade A+++",
        modelType: "saffron",
        image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=700&q=80",
        description: "Grade 1 pure red stigma strands. Intensely fragrant, deep royal golden color, tested for purity and zero adulteration."
    },
    {
        id: "prod-10",
        name: "Sundarkhani Golden Raisins (Kishmish)",
        category: "Figs & Raisins",
        basePrice: 850,
        baseWeight: "1kg",
        stock: 65,
        rating: 4.8,
        reviewsCount: 84,
        badge: "Fresh Crop",
        modelType: "fig",
        image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=700&q=80",
        description: "Long slender golden raisins from Balochistan orchards. Sweet, juicy, perfect for traditional desserts and daily snacking."
    },
    {
        id: "prod-11",
        name: "Shigar Apricots without Kernel (Khubani)",
        category: "Dried Fruits",
        basePrice: 950,
        baseWeight: "1kg",
        stock: 42,
        rating: 4.8,
        reviewsCount: 57,
        badge: "Natural",
        modelType: "fig",
        image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=700&q=80",
        description: "Organically sun-dried sweet apricots from Gilgit-Baltistan. Juicy, chewy, rich in antioxidants and Vitamin A."
    },
    {
        id: "prod-12",
        name: "Al Akseer Imperial Royal Gift Box",
        category: "Gift Boxes",
        basePrice: 2999,
        baseWeight: "1.5kg Mix",
        stock: 20,
        rating: 5.0,
        reviewsCount: 96,
        badge: "Festive Special",
        modelType: "giftbox",
        image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=700&q=80",
        description: "Handcrafted wooden luxury box loaded with 6 partitions: Almonds, Pistachios, Cashews, Walnuts, Medjool Dates, and Chilgoza."
    }
];

const DEFAULT_ORDERS = [
    {
        id: "AKA-8041",
        customerName: "Haji Muhammad Tariq",
        phone: "03353320944",
        email: "tariq.abbasi@gmail.com",
        city: "Jacobabad",
        address: "Near Station Chowk, Quetta Road, Jacobabad",
        date: "2026-11-01 14:30",
        status: "Processing",
        items: [
            { name: "Royal Irani Pistachio (Pista) Jumbo (1kg)", quantity: 2, price: 999 },
            { name: "Supreme White Cashews (Kaju W-240) (1kg)", quantity: 1, price: 999 }
        ],
        subtotal: 2997,
        deliveryFee: 0,
        total: 2997,
        paymentMethod: "Cash on Delivery",
        notes: "Please pack with extra protection seal. Call 03353320944 before arrival."
    },
    {
        id: "AKA-8040",
        customerName: "Dr. Fatima Zahra",
        phone: "03009988112",
        email: "dr.fatima@yahoo.com",
        city: "Sukkur",
        address: "Military Road, Sukkur",
        date: "2026-11-01 11:15",
        status: "Delivered",
        items: [
            { name: "Royal Kashmiri Almonds (Badam Giri) (1kg)", quantity: 2, price: 999 },
            { name: "Pure Kashmiri Mongra Saffron (Zafran)", quantity: 1, price: 2800 }
        ],
        subtotal: 4798,
        deliveryFee: 0,
        total: 4798,
        paymentMethod: "Bank Transfer",
        notes: "Deliver during office hours."
    }
];

// Storage Keys
const STORAGE_KEYS = {
    PRODUCTS: "al_akseer_products",
    ORDERS: "al_akseer_orders",
    SETTINGS: "al_akseer_settings",
    CART: "al_akseer_cart"
};

// Data Helper Functions
const StoreDB = {
    getProducts: function() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
            if (!data) {
                this.saveProducts(DEFAULT_PRODUCTS);
                return DEFAULT_PRODUCTS;
            }
            return JSON.parse(data);
        } catch (e) {
            console.error("Failed to load products from storage", e);
            return DEFAULT_PRODUCTS;
        }
    },

    saveProducts: function(products) {
        try {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        } catch (e) {
            console.error("Failed to save products", e);
        }
    },

    getProductById: function(id) {
        const products = this.getProducts();
        return products.find(p => p.id === id) || null;
    },

    addProduct: function(productData) {
        const products = this.getProducts();
        const newProduct = {
            id: "prod-" + Date.now(),
            rating: 5.0,
            reviewsCount: 1,
            modelType: productData.modelType || "almond",
            ...productData
        };
        products.unshift(newProduct);
        this.saveProducts(products);
        return newProduct;
    },

    updateProduct: function(id, updatedFields) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedFields };
            this.saveProducts(products);
            return products[index];
        }
        return null;
    },

    deleteProduct: function(id) {
        let products = this.getProducts();
        products = products.filter(p => p.id !== id);
        this.saveProducts(products);
        return true;
    },

    getOrders: function() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
            if (!data) {
                this.saveOrders(DEFAULT_ORDERS);
                return DEFAULT_ORDERS;
            }
            return JSON.parse(data);
        } catch (e) {
            console.error("Failed to load orders", e);
            return DEFAULT_ORDERS;
        }
    },

    saveOrders: function(orders) {
        try {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        } catch (e) {
            console.error("Failed to save orders", e);
        }
    },

    addOrder: function(orderData) {
        const orders = this.getOrders();
        const newOrder = {
            id: "AKA-" + Math.floor(1000 + Math.random() * 9000),
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: "Pending",
            ...orderData
        };
        orders.unshift(newOrder);
        this.saveOrders(orders);
        return newOrder;
    },

    updateOrderStatus: function(id, newStatus) {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === id);
        if (order) {
            order.status = newStatus;
            this.saveOrders(orders);
            return true;
        }
        return false;
    },

    deleteOrder: function(id) {
        let orders = this.getOrders();
        orders = orders.filter(o => o.id !== id);
        this.saveOrders(orders);
        return true;
    },

    getSettings: function() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (!data) {
                this.saveSettings(DEFAULT_SETTINGS);
                return DEFAULT_SETTINGS;
            }
            return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
        } catch (e) {
            console.error("Failed to load settings", e);
            return DEFAULT_SETTINGS;
        }
    },

    saveSettings: function(settings) {
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (e) {
            console.error("Failed to save settings", e);
        }
    },

    getCart: function() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.CART);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    saveCart: function(cart) {
        try {
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
        } catch (e) {
            console.error("Failed to save cart", e);
        }
    },

    clearCart: function() {
        localStorage.removeItem(STORAGE_KEYS.CART);
    },

    resetToFactoryDefaults: function() {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        localStorage.removeItem(STORAGE_KEYS.CART);
    },

    formatCurrency: function(amount) {
        const settings = this.getSettings();
        return `${settings.currency} ${Number(amount).toLocaleString('en-US')}`;
    }
};

// Fallback image generator in case external URL fails
function getFallbackImage(text) {
    const safeText = encodeURIComponent(text || "AL AKSEER ABBASI Dry Fruits");
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450"><rect width="100%" height="100%" fill="%231a382b"/><circle cx="300" cy="200" r="90" fill="%23d4af37" opacity="0.2"/><path d="M300 130 C250 170 250 240 300 270 C350 240 350 170 300 130 Z" fill="%23d4af37"/><text x="50%" y="330" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="%23ffffff" text-anchor="middle">${safeText}</text><text x="50%" y="365" font-family="Arial, sans-serif" font-size="14" fill="%23d4af37" text-anchor="middle">AL AKSEER ABBASI DRY FRUITS</text></svg>`;
}
