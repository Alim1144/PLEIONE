// Проверка авторизации
document.addEventListener('DOMContentLoaded', function() {
    const adminSession = localStorage.getItem('pleione_admin_session');
    
    if (adminSession !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Загружаем данные админа
    const adminEmail = localStorage.getItem('pleione_admin_email');
    if (adminEmail) {
        document.getElementById('adminEmail').textContent = adminEmail;
    }
    
    // Инициализация
    loadDashboard();
    loadProducts();
    loadOrders();
    loadDiscounts();
    loadSettings();
});

// Константы
const STORAGE_KEYS = {
    FLOWERS: 'pleione_flowers',
    ORDERS: 'pleione_orders',
    DISCOUNTS: 'pleione_discounts',
    SETTINGS: 'pleione_settings'
};

// Функции навигации
function showSection(sectionId) {
    // Скрываем все секции
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Убираем активный класс у всех кнопок навигации
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Показываем нужную секцию
    document.getElementById(sectionId).classList.add('active');
    
    // Активируем соответствующую кнопку навигации
    event.target.classList.add('active');
    
    // На мобильных устройствах скрываем сайдбар
    if (window.innerWidth <= 768) {
        document.getElementById('adminSidebar').classList.remove('active');
    }
}

function toggleMobileMenu() {
    const sidebar = document.getElementById('adminSidebar');
    sidebar.classList.toggle('active');
}

function logout() {
    localStorage.removeItem('pleione_admin_session');
    localStorage.removeItem('pleione_admin_email');
    window.location.href = 'admin-login.html';
}

// Функции дашборда
function loadDashboard() {
    const flowers = getFlowers();
    const orders = getOrders();
    const discounts = getDiscounts();
    
    document.getElementById('totalProducts').textContent = flowers.length;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('activeDiscounts').textContent = discounts.filter(d => isDiscountActive(d)).length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('totalRevenue').textContent = `${totalRevenue} ₽`;
}

// Функции управления товарами
function loadProducts() {
    const flowers = getFlowers();
    const productsGrid = document.getElementById('productsGrid');
    
    productsGrid.innerHTML = '';
    
    flowers.forEach(flower => {
        const productCard = createProductCard(flower);
        productsGrid.appendChild(productCard);
    });
    
    // Настройка поиска и фильтров
    setupProductFilters();
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const discount = getActiveDiscount(product.id);
    const finalPrice = discount ? product.price * (1 - discount.percent / 100) : product.price;
    
    card.innerHTML = `
        <div class="product-image">
            ${product.image ? `<img src="${product.image}" alt="${product.name}">` : `<span>${product.emoji || '🌹'}</span>`}
        </div>
        <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-price">
                ${discount ? `<span style="text-decoration: line-through; color: #999; margin-right: 0.5rem;">${product.price} ₽</span>` : ''}
                ${finalPrice} ₽
                ${discount ? `<span style="background: #dc3545; color: white; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.8rem; margin-left: 0.5rem;">-${discount.percent}%</span>` : ''}
            </div>
            <div class="product-description">${product.description}</div>
            <div class="product-actions">
                <button class="action-btn edit-btn" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i> Редактировать
                </button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function setupProductFilters() {
    const searchInput = document.getElementById('productSearch');
    const categorySelect = document.getElementById('productCategory');
    
    searchInput.addEventListener('input', filterProducts);
    categorySelect.addEventListener('change', filterProducts);
}

function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const category = document.getElementById('productCategory').value;
    const flowers = getFlowers();
    
    const filteredFlowers = flowers.filter(flower => {
        const matchesSearch = flower.name.toLowerCase().includes(searchTerm) || 
                            flower.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || flower.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    
    filteredFlowers.forEach(flower => {
        const productCard = createProductCard(flower);
        productsGrid.appendChild(productCard);
    });
}

// Функции модальных окон
function showAddProductModal() {
    const modal = document.getElementById('addProductModal');
    modal.classList.add('active');
    
    // Устанавливаем текущую дату для полей
    document.getElementById('productName').focus();
}

function showAddDiscountModal() {
    const modal = document.getElementById('addDiscountModal');
    modal.classList.add('active');
    
    // Загружаем список товаров
    loadProductOptions();
    
    // Устанавливаем текущую дату
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('discountStart').value = today;
    document.getElementById('discountEnd').value = today;
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    
    // Очищаем форму
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
    }
}

function loadProductOptions() {
    const flowers = getFlowers();
    const select = document.getElementById('discountProduct');
    
    select.innerHTML = '<option value="">Выберите товар</option>';
    
    flowers.forEach(flower => {
        const option = document.createElement('option');
        option.value = flower.id;
        option.textContent = flower.name;
        select.appendChild(option);
    });
}

// Обработчики форм
document.getElementById('addProductForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const product = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        price: parseInt(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value,
        category: document.getElementById('productCategorySelect').value,
        image: document.getElementById('productImage').value || null,
        emoji: document.getElementById('productEmoji').value || '🌹'
    };
    
    addProduct(product);
    closeModal('addProductModal');
    showNotification('Товар успешно добавлен!', 'success');
});

document.getElementById('addDiscountForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const discount = {
        id: Date.now(),
        productId: parseInt(document.getElementById('discountProduct').value),
        percent: parseInt(document.getElementById('discountPercent').value),
        startDate: document.getElementById('discountStart').value,
        endDate: document.getElementById('discountEnd').value
    };
    
    addDiscount(discount);
    closeModal('addDiscountModal');
    showNotification('Скидка успешно добавлена!', 'success');
});

// Функции работы с данными
function getFlowers() {
    const saved = localStorage.getItem(STORAGE_KEYS.FLOWERS);
    return saved ? JSON.parse(saved) : [];
}

function addProduct(product) {
    const flowers = getFlowers();
    flowers.push(product);
    localStorage.setItem(STORAGE_KEYS.FLOWERS, JSON.stringify(flowers));
    
    loadProducts();
    loadDashboard();
}

function deleteProduct(productId) {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
        const flowers = getFlowers();
        const filteredFlowers = flowers.filter(f => f.id !== productId);
        localStorage.setItem(STORAGE_KEYS.FLOWERS, JSON.stringify(filteredFlowers));
        
        loadProducts();
        loadDashboard();
        showNotification('Товар удален!', 'success');
    }
}

function getOrders() {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : [];
}

function getDiscounts() {
    const saved = localStorage.getItem(STORAGE_KEYS.DISCOUNTS);
    return saved ? JSON.parse(saved) : [];
}

function addDiscount(discount) {
    const discounts = getDiscounts();
    discounts.push(discount);
    localStorage.setItem(STORAGE_KEYS.DISCOUNTS, JSON.stringify(discounts));
    
    loadDiscounts();
    loadDashboard();
}

function getActiveDiscount(productId) {
    const discounts = getDiscounts();
    const today = new Date().toISOString().split('T')[0];
    
    return discounts.find(d => 
        d.productId === productId && 
        d.startDate <= today && 
        d.endDate >= today
    );
}

function isDiscountActive(discount) {
    const today = new Date().toISOString().split('T')[0];
    return discount.startDate <= today && discount.endDate >= today;
}

// Функции загрузки данных
function loadOrders() {
    const orders = getOrders();
    const ordersList = document.getElementById('ordersList');
    
    ordersList.innerHTML = '';
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<div style="padding: 2rem; text-align: center; color: #666;">Заказов пока нет</div>';
        return;
    }
    
    orders.forEach(order => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        
        orderItem.innerHTML = `
            <div class="order-info">
                <h4>Заказ #${order.id}</h4>
                <p>${order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}</p>
                <p>Дата: ${new Date(order.date).toLocaleDateString()}</p>
            </div>
            <div class="order-status status-${order.status}">
                ${order.status === 'pending' ? 'В обработке' : 'Завершен'}
            </div>
        `;
        
        ordersList.appendChild(orderItem);
    });
}

function loadDiscounts() {
    const discounts = getDiscounts();
    const discountsList = document.getElementById('discountsList');
    
    discountsList.innerHTML = '';
    
    if (discounts.length === 0) {
        discountsList.innerHTML = '<div style="padding: 2rem; text-align: center; color: #666;">Скидок пока нет</div>';
        return;
    }
    
    discounts.forEach(discount => {
        const flowers = getFlowers();
        const product = flowers.find(f => f.id === discount.productId);
        
        if (!product) return;
        
        const discountItem = document.createElement('div');
        discountItem.className = 'discount-item';
        
        const isActive = isDiscountActive(discount);
        
        discountItem.innerHTML = `
            <div class="discount-info">
                <h4>${product.name}</h4>
                <p>Скидка: ${discount.percent}%</p>
                <p>Период: ${new Date(discount.startDate).toLocaleDateString()} - ${new Date(discount.endDate).toLocaleDateString()}</p>
                <p style="color: ${isActive ? '#28a745' : '#dc3545'}; font-weight: 600;">
                    ${isActive ? 'Активна' : 'Неактивна'}
                </p>
            </div>
            <div class="discount-percent">-${discount.percent}%</div>
        `;
        
        discountsList.appendChild(discountItem);
    });
}

function loadSettings() {
    const settings = getSettings();
    
    document.getElementById('shopName').value = settings.shopName || 'PLEIONE';
    document.getElementById('shopDescription').value = settings.shopDescription || 'Цветы&Декор';
    document.getElementById('whatsapp').value = settings.whatsapp || '';
    document.getElementById('telegram').value = settings.telegram || '';
}

function getSettings() {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : {};
}

function saveSettings() {
    const settings = {
        shopName: document.getElementById('shopName').value,
        shopDescription: document.getElementById('shopDescription').value,
        whatsapp: document.getElementById('whatsapp').value,
        telegram: document.getElementById('telegram').value
    };
    
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    showNotification('Настройки сохранены!', 'success');
}

// Утилиты
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const container = document.getElementById('adminNotification');
    container.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Закрытие модальных окон по клику вне их
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Обработка клавиши Escape для закрытия модальных окон
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});
